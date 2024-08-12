import mongoose from "mongoose";

const controlSchema = new mongoose.Schema({
    eventActive: {
        type: Boolean,
        default: false
    },
    registrations: {
        type: Boolean,
        default: false
    },
    stats: {
        type: Boolean,
        default: false
    },
    scores: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Control = mongoose.model('Control', controlSchema);

export default Control;