import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';
import Admin from '../models/admin.js'
import { z } from 'zod';
import bcrypt from 'bcrypt'
import { setAdmin } from '../services/jwtfuncs.js';
import { checkAdmin } from '../middlewares/auth.js';
const router = express.Router();

const adminSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).max(50, { message: 'Username must be at most 50 characters long.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

router.get('/phoenix', checkAdmin, async (req, res) => {
    const {show, loggedIn} = req.query;
    if(show == 'users'){
        if(!loggedIn){
            const users = await User.find();
            let teams = []
            for (let user of users){
                const team = await Team.findById(user.teamId)


                teams.push(team.teamName)
            }
            return res.render('admin', {query: "allUsers", userdata: users, teams});
        }
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
    if(req.user){
        return res.redirect('/admin')
    }
    return res.render('login', { error: null });
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