import express from 'express'
import { checkAuth } from "../middlewares/auth.js";
import User from "../models/user.js";
import Team from "../models/team.js";
import questions from "../db/questions.js";
import dares from "../db/dares.js";
import eventActive from "../middlewares/cryptic.js";

const router = express.Router();
const startTime = new Date("Aug 13, 2024 14:15:00");

router.route('/cryptic')
    .get(checkAuth, eventActive, async (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        try {
            const user = await User.findById(req.user._id);
            const team = await Team.findById(user.teamId);
            if (team.members.length < 2) {
                return res.send('<h1>Minimum of two members should be in the team to play</h1>');
            }
            if (team.questionData.current > (questions.length - 1) || req.stats) {
                const allQuestions = team.questionData.questions;
                let lowestTime = 999999999;
                let highestTime = -99999999;
                let maxAttempts = -99999999;
                let totalDares = team.questionData.daresCompleted.length;
                let question1 = null;
                let question2 = null;
                let question3 = null;
                for (let i = 1; i < allQuestions.length; i++) {
                    if (allQuestions[i].timeTaken < lowestTime) {
                        lowestTime = allQuestions[i].timeTaken;
                        question1 = questions[i].q ? questions[i].q : questions[i].keyword;
                    }

                    if (allQuestions[i].timeTaken > highestTime) {
                        highestTime = allQuestions[i].timeTaken;
                        question2 = questions[i].q ? questions[i].q : questions[i].keyword;
                    }

                    if (allQuestions[i].attempts > maxAttempts) {
                        maxAttempts = allQuestions[i].attempts;
                        question3 = questions[i].q ? questions[i].q : questions[i].keyword;
                    }
                }
                return res.render('stats', { lowestTime, highestTime, maxAttempts, totalDares, question1, question2, question3 });
            }
            const question = questions[team.questionData.current];

            if (team.isBlocked) {
                let dare = null;
                let dareNo = null;
                if (!team.questionData.currentDare) {
                    if (team.questionData.daresCompleted.length == dares.length) {
                        dare = "Ask MLSC for the dare";
                        team.questionData.currentDare = 404; //If the team has completed all the available dares
                    }
                    else {
                        while (true) {
                            const dareNo = Math.floor(Math.random() * dares.length) + 1;
                            if (!team.questionData.daresCompleted.includes(dareNo))
                                dare = dares[dareNo - 1];
                            team.questionData.currentDare = dareNo;
                            break;
                        }
                    }
                }
                else {
                    dareNo = team.questionData.currentDare;
                    if (team.questionData.currentDare == 500) {
                        dare = "You have been blocked by MLSC";
                    }
                    else {
                        dare = dares[dareNo - 1];
                    }
                }
                await team.save();
                return res.render('cryptic', { question, isBlocked: true, dare, dareNo });
            }
            return res.render('cryptic', { question, isBlocked: false, dare: null, dareNo: null });
        } catch (err) {
            console.error('Error fetching user or team data:', err);
            return res.status(500).send('Internal Server Error');
        }

    })

    .post(checkAuth, eventActive, async (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        try {
            let { answer } = req.body;
            answer = answer.trim();
            if (!answer) {
                return res.redirect('/cryptic');
            }
            const user = await User.findById(req.user._id);
            const team = await Team.findById(user.teamId);
            if (team.questionData.current > (questions.length - 1)) {
                return res.redirect('/cryptic');
            }
            if (team.isBlocked) {
                return res.redirect('/cryptic');
            }
            const current = team.questionData.current;
            if(current != 0) {
            user.noOfAttempts += 1;
            }
            if (team.questionData.questions[current]) {
                team.questionData.questions[current].allAnswers.push(answer);
                team.questionData.questions[current].attempts += 1;
                if (questions[current].a.toLowerCase() == answer.toLowerCase()) {
                    team.questionData.questions[current].answered = true;
                    team.questionData.questions[current].answeredBy = user._id;
                    team.questionData.questions[current].submitTime = new Date(new Date().getTime() + (5 * 60 + 30) * 60 * 1000);
                    team.questionData.wrongAttempts = 0;
                    team.questionData.score += questions[current].score;
                    if(current != 0) {
                    user.noOfQuestionsAnswered += 1;
                    }
                    if (current == 0) {
                        team.questionData.questions[0].timeTaken = team.questionData.questions[0].submitTime - startTime;
                    }
                    else {
                        team.questionData.questions[current].timeTaken = team.questionData.questions[current].submitTime - team.questionData.questions[current - 1].submitTime;
                    }
                    team.questionData.current += 1;
                }
                else {
                    if(current != 0) {
                    team.questionData.wrongAttempts += 1;
                    }
                    if (team.questionData.wrongAttempts >= 4) {
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
                    if(current != 0) {
                    user.noOfQuestionsAnswered += 1
                    }
                    answeredBy = user._id;
                    answered = true;
                    submitTime = new Date(new Date().getTime() + (5 * 60 + 30) * 60 * 1000);
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
                    if(current != 0) {
                    team.questionData.wrongAttempts += 1;
                    }
                    if (team.questionData.wrongAttempts >= 4) {
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
            await user.save();
            await team.save();
            return res.redirect('/cryptic')
        } catch (error) {
            console.log(error);
            return res.redirect('/cryptic');
        }
    });

export default router;