import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export default async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("Could not connect to MongoDB. Error:\n", err);
    }
}