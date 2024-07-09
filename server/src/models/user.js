import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, "Please enter the team name"]
    },
    username: {
        type: String,
        required: [true, "Please enter your username"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email address"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"]
    },
    isLeader: {
        type: Boolean,
        required: true
    },
    loggedIn: {
        type: Boolean,
        default: false
    },
    currentToken: {
        type: String,
        default: null
    },
    noOfAttempts: {
        type: Number,
        default: 0
    },
    noOfQuestionsAnswered: {
        type: Number,
        default: 0
    },
});

const User = mongoose.model('User', userSchema);

export default User;
