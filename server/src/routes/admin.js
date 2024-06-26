import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';
import Admin from '../models/admin.js'
import { z } from 'zod';
import bcrypt from 'bcrypt'
import { setAdmin } from '../services/jwtfuncs.js';
import { checkAdmin } from '../middlewares/auth.js';
import getRanks from '../services/rank.js';
const router = express.Router();

const adminSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).max(50, { message: 'Username must be at most 50 characters long.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

router.get('/phoenix', checkAdmin, async (req, res) => {
    try {
        const { show, loggedIn, teamName, sort } = req.query;
        console.log(req.query)
        if (show == 'users') {
            let users = null
            if (loggedIn == 'NA') {
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
            if (sort == 'alpha') {
                teams = await Team.find().sort({ teamName: 1 });
                teamsData = teams;
            }
            if (sort == 'rank') {
                teamsData = [];
                teams = await Team.find().sort();
                for (let i = 1; i <= teams.length; i++) {
                    for (let j = 0; j < teams.length; j++) {
                        if (i == ranks[teams[j].teamName]) {
                            teamsData.push(teams[j])
                        }
                    }
                }
            }
            for(let team of teamsData){
                const leader = await User.findById(team.members[0]);
                leaderList.push(leader.username);
            }
            return res.render('admin', { query: 'allTeams', teamsData, ranks, leaderList });
        }
        if(show == 'teamdetails' && teamName){
            const ranks = await getRanks()
            const team = await Team.findOne({teamName});
            const nameOfTeam = team.teamName
            let userdata = [];
            for (let i = 0; i < team.members.length; i++){
                const user = await User.findById(team.members[i]);
                userdata.push(user);
            }
            return res.render('admin', {query: 'teamdetails', team, userdata, ranks, nameOfTeam})
        }
    } catch(error){
        console.log(error);
        res.send('internal server error');
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
        res.render('registeradmin', { error: error.errors[0].message });
    }
});

router.get('/phoenix/login', (req, res) => {
    if (req.pelican) {
        return res.redirect('/admin')
    }
    return res.render('adminlogin', { error: null });
});

router.post('/phoenix/login', async (req, res) => {
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

export default router;