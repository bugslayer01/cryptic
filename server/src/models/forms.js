const mongoose = require("mongoose")

const formsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: (true, "Please enter your name")
    },
    email: {
        type: String,
        required: (true, "Please enter your email")
    },
    phoneNumber: {
        type: String,
        required: (true, "Please enter your phone number")
    },
    departments: {
        type: String,
        enum: ['Tech', 'Design', 'Management'],
        required: true
    }
})

const FormsData = mongoose.model("response", formsSchema)

module.exports = {
    FormsData
}