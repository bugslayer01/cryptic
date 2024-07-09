import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter your username"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"]
    }
}, {
    timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;