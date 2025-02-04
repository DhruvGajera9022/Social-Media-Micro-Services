// for mongoDB
const mongoose = require("mongoose");
// for hash the password
const argon2 = require("argon2");


// define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    mediaId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true })


// hash the password 
userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password)
        } catch (error) {
            return next(error)
        }
    }
});


// compare the password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw error
    }
}


// for searching
userSchema.index({ username: 'text' });


// creating model
const User = mongoose.model("User", userSchema);


module.exports = User;