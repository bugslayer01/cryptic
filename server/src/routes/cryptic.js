import { checkAuth } from "../middlewares/auth.js";
import User from "../models/user.js";
import Team from "../models/team.js";
import questions from "../db/questions.js";
import dares from "../db/dares.js";
import express from 'express'
import { z } from 'zod'
const router = express.Router();
let startTime = null;

const answerSchema = z.object({
    answer: z.string().min(1, { message: "Please enter the answer" })
});

router.get('/cryptic', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    const user = await User.findById(req.user._id);
    const team = await Team.findById(user.teamId);

    const question = questions[team.questionData.current];

    if (team.isBlocked) {
        let dare = null;
        let dareNo = null
        if (!team.questionData.currentDare) {
            if (team.questionData.daresCompleted.length == dares.length) {
                dare = "Ask the organisers for the dare";
                team.questionData.currentDare = 666;
            }
            else {
                while (true) {
                    const dareNo = Math.floor(Math.random() * dares.length) + 1;
                    if (!team.questionData.daresCompleted.includes(dareNo))
                        dare = dares[dareNo]
                    team.questionData.currentDare = dareNo;
                    break;
                }
            }
        }
        else{
            dareNo = team.questionData.currentDare
            dare = dares[dareNo]
        }
        await team.save();
        return res.render('cryptic', { question, isBlocked: true, dare, dareNo })
    }
    console.log("printing question", question)
    return res.render('cryptic', { question, isBlocked: false, dare: null, dareNo: null })
});

router.post('/cryptic', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    try {
        let { answer } = answerSchema.parse(req.body);
        answer = answer.trim();
        console.log("printing answer", answer)
        const user = await User.findById(req.user._id);
        const team = await Team.findById(user.teamId);
        if (team.isBlocked) {
            return res.redirect('/cryptic')
        }
        const current = team.questionData.current;
        if (team.questionData.questions[current]) {
            team.questionData.questions[current].allAnswers.push(answer);
            team.questionData.questions[current].attempts += 1;
            if (questions[current].a.toLowerCase() == answer.toLowerCase()) {
                team.questionData.questions[current].answered = true;
                team.questionData.questions[current].answeredBy = user._id;
                team.questionData.questions[current].submitTime = new Date();
                team.questionData.wrongAttempts = 0;
                team.questionData.score += questions[current].score;
                if (current == 0) {
                    team.questionData.questions[0].timeTaken = team.questionData.questions[0].submitTime - startTime;
                }
                else {
                    team.questionData.questions[current].timeTaken = team.questionData.questions[current].submitTime - team.questionData.questions[current - 1].submitTime;
                }
                team.questionData.current += 1;
            }
            else {
                team.questionData.wrongAttempts += 1;
                if (team.questionData.wrongAttempts >= 3) {
                    team.isBlocked = true;
                }
            }
        }
        else {
            let answeredBy = null
            let answered = false;
            let submitTime = null;
            let timeTaken = 0;
            if (questions[current].a.toLowerCase() == answer.toLowerCase()) {
                answeredBy = user._id;
                answered = true;
                submitTime = new Date();
                team.questionData.wrongAttempts = 0;
                team.questionData.score += questions[current].score;
                if (current == 0) {
                    timeTaken = submitTime - startTime;
                }
                else {
                    timeTaken = submitTime - team.questionData.questions[current - 1].submitTime;
                }
                team.questionData.current += 1;
            }
            else {
                team.questionData.wrongAttempts += 1;
                if (team.questionData.wrongAttempts >= 3) {
                    team.isBlocked = true;
                }
            }
            let newQuestion = {
                answered,
                timeTaken,
                answeredBy,
                attempts: 1,
                submitTime,
                allAnswers: []
            };
            newQuestion.allAnswers.push(answer);
            team.questionData.questions.push(newQuestion);
        }
        await team.save();
        return res.redirect('/cryptic')
    } catch (error) {
        console.log(error)
        return res.render('cryptic', { error: error.errors[0].message });
    }

});

router.get('/start', (req, res) => {
    console.log("Event started")
    startTime = new Date();
    res.redirect('/admin')
});

export default router;