import express from 'express';
import checkAuth from '../middlewares/auth.js';
import Team from '../models/team.js';
import User from '../models/user.js';
const router = express.Router();

const memberRegisterSchema = z.object({
    teamName: z.string().min(1, { message: "Please enter the team name" }),
    username: z.string().min(2, { message: "Username should be atleast 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password should be atleast 6 characters long" }),
});

router.get('/dashboard', checkAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/login')
        }
        const user = await User.findById(req.user._id)
        const team = await Team.findById(user.teamId)

        res.render('dashboard', { username: user.username, teamName: team.teamName, })
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/team', checkAuth, async (req, res) => {
    if (!req.user) {
        res.redirect('/login')
    }

    try {
        const user = await User.findById(req.user._id)
        const team = await Team.findById(user.teamId)
        const allIds = team.members;
        let userData = [];
        for (let id of allIds) {
            const member = await User.findById(id);
            userData.push(member);
        }
        res.render('team', { userData })
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/registermember', checkAuth, async (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    }
    if (!req.user.isLeader) {
        res.redirect('/team');
    }
    res.render('registerMember',{error : null})
});

router.post('/registermember', checkAuth, async (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    }
    if (!req.user.isLeader) {
        res.redirect('/team');
    }

    try {
        const { username, email, password } = memberRegisterSchema.parse(req.body);
        const leader = await User.findById(req.user._id);
        const team = await Team.findById(leader.teamId);
        const usernameExists = await User.findOne({ username })
        const emailExists = await User.findOne({ email });
        if (usernameExists) {
            res.render('registerMember', { error: 'User with this username already registered' });
        }
        if (emailExists) {
            res.render('registerMember', { error: 'Email already registered' });
        }
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            teamId: team._id,
            username,
            email,
            password: hash,
            isLeader: false,
        });
        let newUser = await user.save();
        team.members.push(newUser._id)
        await team.save();

        res.redirect("/team");
    } catch (error) {
        res.render('registerMember', { error: error.errors[0].message });
    }
});

export default router;