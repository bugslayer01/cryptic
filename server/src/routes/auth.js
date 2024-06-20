import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';
import { z } from 'zod';
import bcrypt from 'bcrypt'
const router = express.Router();

const userSchema = z.object({
    teamName: z.string().min(1, "Please enter the team name"),
    username: z.string().min(1, "Please enter your username"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Please enter your password"),
});

router.get('/register', (req, res) => {
    res.render('registerLeader', { error: null });
})

router.post('/register', async (req, res) => {
    try {

        const { teamName, username, email, password } = userSchema.parse(req.body);
        const teamExists = await Team.findOne({ teamName })
        const usernameExists = await User.findOne({ username })
        const emailExists = await User.findOne({ email });

        if (teamExists) {
            res.render('registerLeader', { error: 'Team with this name already registered' });
        }
        if (usernameExists) {
            res.render('registerLeader', { error: 'User with this username already registered' });
        }
        if (emailExists) {
            res.render('registerLeader', { error: 'Email already registered' });
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

    } catch {
        res.render('registerLeader', { error: error.errors[0].message });
    }
});

export default router;