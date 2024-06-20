const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: (true, "Please enter the username"),
  },
  password: {
    type: String,
    required: (true, "Please enter your password"),
  },
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = {
  Admin,
};
