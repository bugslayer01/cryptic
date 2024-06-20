import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the team name"],
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  //more to be added
});

const Team = mongoose.model('Team', teamSchema);

export default Team;