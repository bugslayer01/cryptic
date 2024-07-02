import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';
import Admin from '../models/admin.js'
import { z } from 'zod';
import bcrypt from 'bcrypt'
import dotenv from "dotenv";
import { setAdmin, setSuperUser } from '../utils/jwtfuncs.js';
import { checkAdmin, checkSuperUser } from '../middlewares/auth.js';
import getRanks from '../utils/rank.js';
import Control from '../models/settings.js';
const router = express.Router();
dotenv.config();

const adminSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).max(50, { message: 'Username must be at most 50 characters long.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

router.get('/phoenix/superlogin', checkAdmin, (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    res.render('superlogin', { error: null });
});

router.post('/phoenix/superlogin', checkAdmin, (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    try {
        const { password } = req.body;
        if (password == process.env.superaccesskey) {
            const token = setSuperUser({ message: "You are logged in My Lord" });
            res.cookie('titan', token, { httpOnly: true });
            return res.redirect('/phoenix/settings');
        }
        else
            return res.render('superlogin', { error: "Wrong Key" });
    } catch (err) {
        console.log(err)
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/phoenix/settings', checkAdmin, checkSuperUser, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    if (!req.superuser) {
        return res.redirect('/phoenix/superlogin');
    }

    let { flash } = req.query
    const control = await Control.findOne();

    res.render('settings', { flash, eventActive: control.eventActive, regActive: control.registrations });
});

router.post('/phoenix/settings/save', checkAdmin, checkSuperUser, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    if (!req.superuser) {
        return res.redirect('/phoenix/superlogin');
    }
    try {
        let { crypticStatus, regStatus } = req.body;
        if (!crypticStatus) {
            crypticStatus = false;
        }

        if (!regStatus) {
            regStatus = false;
        }
        const control = await Control.findOne();

        control.eventActive = crypticStatus;
        control.registrations = regStatus;
        await control.save();

        return res.redirect('/phoenix/settings?flash=true');
    } catch (err) {
        console.log(err)
        return res.status(500).send("Internal Server Error");
    }
});


router.get('/phoenix', checkAdmin, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    try {
        const { show, loggedIn, teamName, sort } = req.query;
        console.log(req.query)
        if (show == 'users' || !show) {
            let users = null
            if (loggedIn == 'NA' || !loggedIn) {
                users = await User.find();
            }
            if (loggedIn == 'true') {
                users = await User.find({ loggedIn: true });
            }
            if (loggedIn == 'false') {
                users = await User.find({ loggedIn: false });
            }
            let teams = []
            for (let user of users) {
                const team = await Team.findById(user.teamId)
                teams.push(team.teamName)
            }
            return res.render('admin', { query: "allUsers", userdata: users, teams });

        }
        if (show == 'teams') {
            let teams = null;
            let teamsData = null;
            let leaderList = []
            const ranks = await getRanks()
            if (sort == 'alpha' || !sort) {
                teams = await Team.find().sort({ teamName: 1 });
                teamsData = teams;
            }
            if (sort == 'rank') {
                teamsData = [];
                teams = await Team.find();
                for (let i = 1; i <= teams.length; i++) {
                    for (let j = 0; j < teams.length; j++) {
                        if (i == ranks[teams[j].teamName]) {
                            teamsData.push(teams[j])
                        }
                    }
                }
            }
            for (let team of teamsData) {
                const leader = await User.findById(team.members[0]);
                leaderList.push(leader.username);
            }
            return res.render('admin', { query: 'allTeams', teamsData, ranks, leaderList });
        }
        if (show == 'teamdetails' && teamName) {
            const ranks = await getRanks()
            const team = await Team.findOne({ teamName }).populate('members');
            const nameOfTeam = team.teamName
            return res.render('admin', { query: 'teamdetails', team, userdata: team.members, ranks, nameOfTeam })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }

});

router.get('/tempreg', (req, res) => {
    return res.render('registeradmin', { error: null });
});

router.post('/tempreg', async (req, res) => {
    try {
        const { username, password } = adminSchema.parse(req.body);
        const hash = await bcrypt.hash(password, 12);
        const adminCheck = await Admin.findOne({ username });
        if (adminCheck) {
            return res.render('registeradmin', { error: 'Admin with this name is already registered' });
        }
        const admin = new Admin({
            username,
            password: hash,
        });
        await admin.save();
        console.log('Admin registered successfully');
        return res.redirect('/phoenix/login');
    } catch (error) {
        return res.render('registeradmin', { error: error.errors[0].message });
    }
});

router.get('/phoenix/login', (req, res) => {
    if (req.pelican) {
        return res.redirect('/admin')
    }
    return res.render('adminlogin', { error: null });
});

router.post('/phoenix/login', async (req, res) => {
    if (req.pelican) {
        return res.redirect('/admin')
    }
    try {
        const { username, password } = adminSchema.parse(req.body);
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.render("adminlogin", { error: "Invalid username or password." });
        }
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {

            return res.render("adminlogin", { error: "Invalid username or password." });
        }
        const token = setAdmin({ id: admin._id, username: admin.username });

        res.cookie('pelican', token, { httpOnly: true });
        res.redirect('/phoenix');
    } catch (error) {
        console.log(error);
        return res.render('adminlogin', { error: error.errors[0].message });
    }
});

router.get('/phoenix/blocked', checkAdmin, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    let leaderList = []
    const ranks = await getRanks()
    const teamsData = await Team.find({ isBlocked: true });
    for (let team of teamsData) {
        const leader = await User.findById(team.members[0]);
        leaderList.push(leader.username);
    }
    return res.render('blocked', {  teamsData, ranks, leaderList });
});

router.post('/phoenix/unblock/:_id', checkAdmin, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    const { _id } = req.params;
    const team = await Team.findById(_id);
    team.isBlocked = false
    team.questionData.wrongAttempts = 0;
    if(team.questionData.currentDare != 666){
    team.questionData.daresCompleted.push(team.questionData.currentDare);
    }
    team.questionData.currentDare = null; 
    await team.save()
    res.redirect('/phoenix/blocked')

});
router.post('/phoenix/block/:_id',checkAdmin, async (req, res) =>{
    if (!req.admin) {
        return res.redirect('/phoenix/login')
    }
    const { _id } = req.params;
    const team = await Team.findById(_id);
    team.isBlocked = true;
    team.questionData.currentDare = 420 //Someone delibirately blocked the team from the admin side
    team.save();
    res.redirect(`/phoenix?show=teamdetails&teamName=${team.teamName}`)
})

export default router;