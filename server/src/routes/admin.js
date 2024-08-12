import express from 'express';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import Team from '../models/team.js';
import User from '../models/user.js';
import Admin from '../models/admin.js'
import { setAdmin, setSuperUser } from '../utils/jwtfuncs.js';
import { checkAdmin, checkSuperUser } from '../middlewares/auth.js';
import getRanks from '../utils/rank.js';
import Control from '../models/settings.js';
import updateLoggedState from '../utils/updateLoggedState.js';
import { adminSchema } from '../utils/zodSchemas.js';
const startTime = new Date("Aug 13, 2024 14:15:00");
const router = express.Router();
dotenv.config();

router.route('/phoenix/superlogin')
    .get(checkAdmin, (req, res) => {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        res.render('superlogin', { error: null });
    })

    .post(checkAdmin, (req, res) => {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        try {
            const { password } = req.body;
            if (password == process.env.superaccesskey) {
                const token = setSuperUser({ message: "You are logged in My Lord" });
                res.cookie('titan', token, { httpOnly: true, secure: (process.env.NODE_ENV || 'dev') === 'prod' });
                return res.redirect('/phoenix/settings');
            }
            else
                return res.render('superlogin', { error: "Wrong Key" });
        } catch (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
    });
router.route('/phoenix/settings')
    .get(checkAdmin, checkSuperUser, async (req, res) => {
        try {
            if (!req.admin) {
                return res.redirect('/phoenix/login');
            }
            if (!req.superuser) {
                return res.redirect('/phoenix/superlogin');
            }

            let { flash } = req.query;
            const control = await Control.findOne();
            if (!control) {
                return res.render('settings', { flash: 'Control settings not found.', eventActive: false, regActive: false });
            }

            res.render('settings', { flash, eventActive: control.eventActive, regActive: control.registrations, statsActive: control.stats, scoresActive: control.scores });
        } catch (error) {
            console.error('Error during GET /phoenix/settings:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    .put(checkAdmin, checkSuperUser, async (req, res) => {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        if (!req.superuser) {
            return res.redirect('/phoenix/superlogin');
        }
        try {
            let { crypticStatus, regStatus, statsStatus, scoresStatus } = req.body;
            if (!crypticStatus) {
                crypticStatus = false;
            }

            if (!regStatus) {
                regStatus = false;
            }

            if (!statsStatus) {
                statsStatus = false;
            }
            if(!scoresStatus){
                scoresStatus = false;
            }
            const control = await Control.findOne();

            control.eventActive = crypticStatus;
            control.registrations = regStatus;
            control.stats = statsStatus;
            control.scores = scoresStatus;
            await control.save();

            return res.redirect('/phoenix/settings?flash=true');
        } catch (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
    });


router.get('/phoenix', checkAdmin, async (req, res) => {
    if (!req.admin) {
        return res.redirect('/phoenix/login');
    }
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            res.clearCookie('pelican');
            return res.redirect('/phoenix/login');
        }
        const { show, loggedIn, teamName, sort } = req.query;
        if (show == 'users') {
            let users = null;
            await updateLoggedState();
            if (loggedIn == 'true') {
                users = await User.find({ loggedIn: true }).collation({ locale: 'en', strength: 2 }).sort({ username: 1 });
            }
            else if (loggedIn == 'false') {
                users = await User.find({ loggedIn: false }).collation({ locale: 'en', strength: 2 }).sort({ username: 1 });
            }
            else if (sort == 'alpha') {
                users = await User.find().collation({ locale: 'en', strength: 2 }).sort({ username: 1 });

            }
            else if (sort == 'rank') {
                users = await User.find().sort({ noOfQuestionsAnswered: -1 });
            }
            else {
                users = await User.find();
            }
            let teams = []
            for (let user of users) {
                const team = await Team.findById(user.teamId);;
                teams.push(team.teamName);
            }
            return res.render('admin', { query: "allUsers", userdata: users, teams });

        }
        if (show == 'teams' || !show) {
            let teams = null;
            let teamsData = null;
            let leaderList = [];
            const ranks = await getRanks();
            if (sort == 'alpha') {
                teams = await Team.find().collation({ locale: 'en', strength: 2 }).sort({ teamName: 1 });
                teamsData = teams;
            }
            else if (sort == 'rank') {
                teamsData = [];
                teams = await Team.find();
                for (let i = 1; i <= teams.length; i++) {
                    for (let j = 0; j < teams.length; j++) {
                        if (i == ranks[teams[j].teamName]) {
                            teamsData.push(teams[j]);
                        }
                    }
                }
            }
            else {
                teams = await Team.find();
                teamsData = teams;
            }
            for (let team of teamsData) {
                const leader = await User.findById(team.members[0]);
                leaderList.push(leader.username);
            }
            return res.render('admin', { query: 'allTeams', teamsData, ranks, leaderList, startTime });
        }
        if (show == 'teamdetails' && teamName) {
            await updateLoggedState(teamName)
            const ranks = await getRanks();
            const team = await Team.findOne({
                teamName: {
                    $regex: new RegExp('^' + teamName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
                }
            }).populate('members');
            if (!team) {
                return res.send(`<h1>No team with name ${teamName} found`);
            }
            const nameOfTeam = team.teamName;
            return res.render('admin', { query: 'teamdetails', team, userdata: team.members, ranks, nameOfTeam });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }

});
router.route('/tempreg')
    .get((_, res) => {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'prod') {
            return res.redirect('/404');
        }
        return res.render('registeradmin', { error: null });
    })

    .post(async (req, res) => {
        try {
            if (!process.env.NODE_ENV || process.env.NODE_ENV === 'prod') {
                return res.redirect('/404');
            }
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

router.route('/phoenix/login')
    .get((req, res) => {
        if (req.admin) {
            return res.redirect('/admin');
        }
        return res.render('adminlogin', { error: null });
    })

    .post(async (req, res) => {
        if (req.admin) {
            return res.redirect('/admin');
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
            res.cookie('pelican', token, { httpOnly: true, secure: (process.env.NODE_ENV || 'dev') === 'prod' });
            return res.redirect('/phoenix');
        } catch (error) {
            console.error('Error during POST /phoenix/login:', error);
            return res.render('adminlogin', { error: 'An unexpected error occurred. Please try again.' });
        }
    });


router.get('/phoenix/blocked', checkAdmin, async (req, res) => {
    try {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        let leaderList = [];
        const ranks = await getRanks();
        const teamsData = await Team.find({ isBlocked: true });
        for (let team of teamsData) {
            const leader = await User.findById(team.members[0]);
            leaderList.push(leader.username);
        }
        return res.render('blocked', { teamsData, ranks, leaderList });
    } catch (error) {
        console.error('Error during GET /phoenix/blocked:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/phoenix/unblock/:_id', checkAdmin, async (req, res) => {
    try {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        const { _id } = req.params;
        const team = await Team.findById(_id);
        if (!team) {
            return res.redirect('/phoenix/blocked');
        }
        team.isBlocked = false;
        team.questionData.wrongAttempts = 0;
        if (team.questionData.currentDare != 404 && team.questionData.currentDare != 500) {
            team.questionData.daresCompleted.push(team.questionData.currentDare);
        }
        team.questionData.currentDare = null;
        await team.save();
        res.redirect('/phoenix/blocked');
    } catch (error) {
        console.error('Error during POST /phoenix/unblock/:_id:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/phoenix/block/:_id', checkAdmin, async (req, res) => {
    try {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        const { _id } = req.params;
        const team = await Team.findById(_id);
        if (!team) {
            return res.redirect('/phoenix');
        }
        team.isBlocked = true;
        team.questionData.currentDare = 500; // Someone deliberately blocked the team from the admin side
        await team.save();
        return res.redirect(`/phoenix?show=teamdetails&teamName=${team.teamName}`);
    } catch (error) {
        console.error('Error during POST /phoenix/block/:_id:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.delete('/phoenix/deleteteam/:_id', checkAdmin, async (req, res) => {
    try {
        if (!req.admin) {
            return res.redirect('/phoenix/login');
        }
        const { _id } = req.params;
        const team = await Team.findById(_id).populate('members');
        if (!team) {
            return res.redirect('/phoenix');
        }
        for (let member of team.members) {
            await User.findByIdAndDelete(member._id);
        }
        await Team.findByIdAndDelete(team._id);
        return res.redirect('/phoenix?show=teams');
    } catch (error) {
        console.error('Error during DELETE /phoenix/deleteteam/:_id:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.route('/phoenix/award')
    .get(checkAdmin, async (req, res) => {
        try {
            if (!req.admin) {
                return res.redirect('/phoenix/login');
            }
            const teams = await Team.find();
            return res.render('award', { teams, flash: null });
        } catch (error) {
            console.error('Error during GET /phoenix/award:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    .post(checkAdmin, async (req, res) => {
        try {
            if (!req.admin) {
                return res.redirect('/phoenix/login');
            }
            let { teamId, points } = req.body;
            points = parseInt(points);
            const teams = await Team.find();
            const team = await Team.findById(teamId);
            if (!team) {
                return res.render('award', { teams, flash: 'Team not found' });
            }
            team.questionData.score += points;
            await team.save();
            return res.render('award', { teams, flash: `${points} points awarded to ${team.teamName}` });
        } catch (error) {
            console.error('Error during POST /phoenix/award:', error);
            res.status(500).send('Internal Server Error');
        }
    });
router.route('/phoenix/changePassword')
    .get(checkAdmin, async (req, res) => {
        try {
            if (!req.admin) {
                return res.redirect('/phoenix/login');
            }
            const { teamId } = req.query;
            if (!teamId) {
                const teams = await Team.find();
                return res.render('changePassword', { flash: null, teams, show: "teams" });
            }
            const team = await Team.findById(teamId).populate('members');
            if (!team) {
                const teams = await Team.find();
                return res.render('changePassword', { flash: 'Team not found', teams, show: "teams" });
            }
            return res.render('changePassword', { flash: null, team, show: "team" });
        } catch (error) {
            console.error('Error during GET /phoenix/changePassword:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    .post(checkAdmin, async (req, res) => {
        console.log(req.body);
        try {
            if (!req.admin) {
                return res.redirect('/phoenix/login');
            }
            if (!req.body.all) {
                const { userId, password } = req.body;
                const user = await User.findById(userId);
                if (!user) {
                    const teams = await Team.find();
                    return res.render('changePassword', { flash: 'User not found', teams, show: "teams" });
                }
                const hash = await bcrypt.hash(password, 12);
                user.password = hash;
                await user.save();
                const teams = await Team.find();
                return res.render('changePassword', { flash: 'Password changed successfully', teams, show: "teams" });
            }
            const { teamId, password } = req.body;
            const team = await Team.findById(teamId).populate('members');
            if (!team) {
                const teams = await Team.find();
                return res.render('changePassword', { flash: 'Team not found', teams, show: "teams" });
            }
            const hash = await bcrypt.hash(password, 12);
            for (let member of team.members) {
                member.password = hash;
                await member.save();
            }
            const teams = await Team.find();
            return res.render('changePassword', { flash: 'Password changed successfully', teams, show: "teams" });
        } catch (error) {
            console.error('Error during POST /phoenix/changePassword:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    
export default router;