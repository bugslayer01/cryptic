import mongoose from "mongoose";
import checkAuth from "../middlewares/auth.js";
import User from "../models/user.js";
import Team from "../models/team.js";
import questions from "../db/questions.js";
import express from 'express'
const router = express.Router();


  

router.get('/cryptic', checkAuth, async (req, res) => {
    if(!req.user){
        return res.redirect('/login')
    }
    const user = await User.findById(req.user._id);
    const team = await Team.findById(user.teamId);
    const currentQuestion = team.questionData.current;
    const question = questions[currentQuestion];
    return res.render('cryptic', {question})
})

export default router;