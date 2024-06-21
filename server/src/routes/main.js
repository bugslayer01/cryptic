import express from 'express';
import checkAuth from '../middlewares/auth.js';
import Team from '../models/team.js';
import User from '../models/user.js';
const router = express.Router();

router.get('/dashboard', checkAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/login')
        }
        console.log(req.user)
        const user = await User.findById(req.user._id)
        const team = await Team.findById(user.teamId)

        res.render('dashboard', { username: user.username, teamName: team.teamName, })
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/team', checkAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/login')
        }
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

router.get

export default router;