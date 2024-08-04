import Team from "../models/team.js";


export default async function getRanks() {
    const teams = await Team.find();

    teams.sort((a, b) => {
        if (a.questionData.score !== b.questionData.score) {
            return b.questionData.score - a.questionData.score;
        } else {
            const timeA = a.questionData.questions[a.questionData.current - 1]?.timeTaken;
            const timeB = b.questionData.questions[b.questionData.current - 1]?.timeTaken;
            return timeA - timeB;
        }
    });

    const ranks = {};
    teams.forEach((team, index) => {
        ranks[team.teamName] = index + 1;
    });

    return ranks;

}