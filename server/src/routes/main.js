import express from 'express';
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';
import { checkAdmin, checkAuth } from '../middlewares/auth.js';
import Team from '../models/team.js';
import User from '../models/user.js';
import getRanks from '../utils/rank.js';
import regActive from '../middlewares/registrations.js';
import { memberRegisterSchema } from '../utils/zodSchemas.js';
import sendMail from '../utils/mail.js';
import Control from '../models/settings.js';
const router = express.Router();

router.get('/', async (_, res) => {
    try {
        return res.render('dashboard',)
    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/team', checkAuth, regActive, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }

    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.redirect('/login');
        }
        const team = await Team.findById(user.teamId).populate('members');
        if (!team) {
            return res.redirect('/login');
        }
        return res.render('team', { userData: team.members, isLeader: req.user.isLeader, teamName: team.teamName });
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        res.clearCookie('token');
        return res.status(500).send('Internal Server Error');
    }
});

router.route('/registermember')
    .get(checkAuth, regActive, async (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        if (!req.user.isLeader) {
            return res.redirect('/team');
        }
        return res.render('registerMember', { error: null })
    })

    .post(checkAuth, regActive, async (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        if (!req.user.isLeader) {
            return res.redirect('/team');
        }

        try {
            const { username, email, password } = memberRegisterSchema.parse(req.body);
            const leader = await User.findById(req.user._id);
            if (!leader)
                return res.redirect('/login')
            const team = await Team.findById(leader.teamId);
            if (!team)
                return res.redirect('/login')
            if (team.members.length == 4) {
                return res.render('registerMember', { error: 'Max 4 members allowed' });
            }
            const usernameExists = await User.findOne({ username })
            const emailExists = await User.findOne({ email });
            if (usernameExists) {
                return res.render('registerMember', { error: 'User with this username already registered' });
            }
            if (emailExists) {
                return res.render('registerMember', { error: 'Email already registered' });
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
            sendMail({ username, email, teamName: team.teamName })
            return res.redirect("/team");
        } catch (error) {
            console.log(error)
            if (error.errors && error.errors[0]?.message) {
                return res.render('registerMember', { error: error.errors[0].message });
            }
            return res.send("<h1>Internal Server Error</h1>")
        }
    });

router.delete('/deleteuser/:_id', checkAuth, checkAdmin, async (req, res) => {
    if (req.admin) {
        const { _id } = req.params;
        const user = await User.findById(_id);
        let team = await Team.findById(user.teamId);
        await User.findByIdAndDelete(_id);
        const id = new mongoose.Types.ObjectId(_id);

        team = await Team.findByIdAndUpdate(
            team._id,
            { $pull: { members: id } },
            { new: true }
        );
        if (team.members.length == 0) {
            try {
                await Team.findByIdAndDelete(team._id);
                return res.redirect('/phoenix?show=teams')

            } catch (err) {
                console.error('Error deleting team:', err);
                return res.status(500).send('Failed to delete team');
            }
        }
        return res.redirect('/phoenix')
    } else if (!req.user) {
        return res.redirect('/login');
    } else if (req.user?.isLeader) {
        try {
            const { _id } = req.params;
            const leader = await User.findById(req.user._id);
            const team = await Team.findById(leader.teamId);
            //If a team leader deliberately tries to delete himself
            if (req.user._id == _id) {
                return res.send("<h1>You can't delete yourself idiot🤡</h1>");
            }
            //If people deliberately call this route with the wrong id or id of a member of another team
            if (team.members.includes(_id)) {
                await User.findByIdAndDelete(_id);
                const id = new mongoose.Types.ObjectId(_id);

                await Team.findByIdAndUpdate(
                    team._id,
                    { $pull: { members: id } },
                    { new: true }
                );
            }
            else {
                return res.send("<h1>Zyada hacker banne ki koshish kar rahe ho🤡</h1>");
            }
            return res.redirect('/team');
        } catch (error) {
            res.status(500).send('Internal Server Error');
            console.log(error);
        }
    }
    return res.redirect('/team');
});

router.get('/leaderboard', async (req, res) => {
    try {
        const ranks = await getRanks();
        const teamsData = [];
        const teams = await Team.find();
        const control = await Control.findOne();
        for (let i = 1; i <= teams.length; i++) {
            for (let j = 0; j < teams.length; j++) {
                if (i == ranks[teams[j].teamName]) {
                    teamsData.push(teams[j]);
                }
            }
        }
        return res.render('leaderboard', { teamsData, scores: control.scores });
    } catch (error) {
        console.error('Error during GET /leaderboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;