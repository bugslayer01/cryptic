import mongoose from "mongoose";
import dotenv from "dotenv";
import Team from "../models/team.js";
import User from '../models/user.js'
dotenv.config();

export default function connectMongo() {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(async () => {
            console.log("Connected to MongoDB");
            // await User.deleteMany({}) For development, to be removed later
            
            // await Team.deleteMany({}) For development, to be removed later
        })
        .catch((err) => {
            console.log("Could not connect to MongoDB. Error:\n", err);
        });
}





