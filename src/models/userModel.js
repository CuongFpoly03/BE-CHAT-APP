const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        // _id: {type: "string ", unique: true, require: true},
        name: {type: "String", required: true},
        email: {type: "String", unique: true, require: true},
        password: {type: "String",required: true},
        pic: {
            type: "String",
            require: true,
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamp: true
    }
);

userSchema.methods.matchPasswords = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};

userSchema.pre("save", async function(next) {
    if(!this.isModified) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const User = mongoose.model("users", userSchema);
module.exports = User;