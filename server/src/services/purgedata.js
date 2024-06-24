import User from "../models/user.js";
import Team from "../models/team.js";
import connectMongo from "../db/mongoose.js";

async function purge() {
    await User.deleteMany({});
    await Team.deleteMany({});
    console.log('User and Team data purged')
}
connectMongo()
purge();