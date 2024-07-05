import express from 'express';
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';
import z from 'zod'
import { checkAdmin, checkAuth } from '../middlewares/auth.js';
import Team from '../models/team.js';
import User from '../models/user.js';
import getRanks from '../utils/rank.js';
import regActive from '../middlewares/registrations.js';
import eventActive from '../middlewares/cryptic.js';
import axios from 'axios';
const router = express.Router();

const memberRegisterSchema = z.object({
    username: z.string().min(2, { message: "Username should be atleast 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password should be atleast 6 characters long" }),
});

router.get('/dashboard', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }
    try {
        const user = await User.findById(req.user._id).populate('teamId');
        return res.render('dashboard', { username: user.username, teamName: user.teamId.teamName, })
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/team', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }

    try {
        const user = await User.findById(req.user._id)
        const team = await Team.findById(user.teamId).populate('members')
        return res.render('team', { userData: team.members, isLeader: req.user.isLeader })
    } catch (err) {
        console.error('Error fetching user or team data:', err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/registermember', checkAuth, regActive, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    if (!req.user.isLeader) {
        return res.redirect('/team');
    }
    return res.render('registerMember', { error: null })
});

router.post('/registermember', checkAuth, regActive, async (req, res) => {
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
    const backURL = req.header('Referer') || '/phoenix';
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
        return res.redirect(backURL)
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
            return res.redirect(backURL);
        } catch (error) {
            res.status(500).send('Internal Server Error');
            console.log(error);
        }
    }
    return res.redirect(backURL);
});

router.get('/leaderboard', checkAuth, eventActive, async (req, res) => {
    const ranks = await getRanks();
    const teamsData = [];
    const teams = await Team.find();
    for (let i = 1; i <= teams.length; i++) {
        for (let j = 0; j < teams.length; j++) {
            if (i == ranks[teams[j].teamName]) {
                teamsData.push(teams[j])
            }
        }
    }
    return res.render('leaderboard', { teamsData })
});

export default router;