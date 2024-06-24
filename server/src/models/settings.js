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
    //will add more
});

const Control = mongoose.model('Control', controlSchema);

export default Control;