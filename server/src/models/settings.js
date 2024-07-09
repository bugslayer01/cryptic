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
    totalRequests: {
        type: Number,
        default: 0
    }
    //will add more if needed
}, {
    timestamps: true
});

const Control = mongoose.model('Control', controlSchema);

export default Control;