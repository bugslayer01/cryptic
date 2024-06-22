import mongoose from "mongoose";
import checkAuth from "../middlewares/auth";
import User from "../models/user";
import Team from "../models/team";
import questions from "../db/questions";
import express from 'express'
const router = express.Router();


  

router.get('/cryptic', checkAuth, (req, res) => {
    if(!req.user){
        return res.redirect('/login')
    }
    const user = User.findById(req.user._id);
    const team = Team.findById(user.teamId);
    const currentQuestion = team.questionData.current;
    const question = questions[currentQuestion];
    return res.render('cryptic', {question, image})
})