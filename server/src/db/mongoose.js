import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default function connectMongo() {
    mongoose
        .connect("mongodb+srv://parthktr9400:FYSukMFUMSyrEhWo@team.88fkbkw.mongodb.net/?retryWrites=true&w=majority&appName=team")
        .then(async () => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.log("Could not connect to MongoDB. Error:\n", err);
        });
}