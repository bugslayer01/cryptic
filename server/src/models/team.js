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
  questionData: {
    current: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
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