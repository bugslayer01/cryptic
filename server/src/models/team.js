import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, "Please enter the team name"],
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isBlocked: { type: Boolean, default: false },
  questionData: {
    current: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    wrongAttempts: { type: Number, default: 0 },
    currentDare: {type: Number, default: null},
    daresCompleted: [{ type: Number}],
    questions: [{
      answered: { type: Boolean, default: false },
      timeTaken: { type: Number, default: 0 },
      answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      attempts: { type: Number, default: 0 },
      submitTime: { type: Date, default: null },
      allAnswers: [{ type: String }],
    }],
  },
});


const Team = mongoose.model('Team', teamSchema);

export default Team;