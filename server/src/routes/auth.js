import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';
import { z } from 'zod';
import bcrypt from 'bcrypt'
import { setUser } from '../services/jwtfuncs.js';
const router = express.Router();
const registerSchema = z.object({
    teamName: z.string().min(1, {message : "Please enter the team name"}),
    username: z.string().min(2, {message : "Username should be atleast 2 characters long"}),
    email: z.string().email({message : "Please enter a valid email address"}),
    password: z.string().min(6, {message : "Password should be atleast 6 characters long"}),
});

const loginSchema = z.object({
    username: z.string().min(2, {message : "Username is atleast 2 characters long"}),
    password: z.string().min(6, {message : "Password is atleast 6 characters long"}),
});

router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/register', async (req, res) => {
    try {

        const { teamName, username, email, password } = registerSchema.parse(req.body);
        const teamExists = await Team.findOne({ teamName })
        const usernameExists = await User.findOne({ username })
        const emailExists = await User.findOne({ email });

        if (teamExists) {
            res.render('register', { error: 'Team with this name already registered' });
        }
        if (usernameExists) {
            res.render('register', { error: 'User with this username already registered' });
        }
        if (emailExists) {
            res.render('register', { error: 'Email already registered' });
        }
        const hash = await bcrypt.hash(password, 12);
        const team = new Team({
            teamName
        });
        const newTeam = await team.save();
        const user = new User({
            teamId: newTeam._id,
            username,
            email,
            password: hash,
            isLeader: true,
        });
        let newUser = await user.save();
        team.members.push(newUser._id)
        await team.save();

        res.redirect("/login");

    } catch(error) {
        res.render('register', { error: error.errors[0].message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = loginSchema.parse(req.body);
        const user = await User.findOne({ username })
        if (!user) {
            res.render('login', { error: 'Invalid username or password' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.render('login', { error: 'Invalid username or password' });
        }
        const token = setUser({ _id: user._id, username: user.username, isLeader: user.isLeader });
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');
    } catch(error) {
        res.render('login', { error: error.errors[0].message });
    }
})

export default router;