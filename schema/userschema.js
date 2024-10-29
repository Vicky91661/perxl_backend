const mongoose = require("mongoose");
const { boolean } = require("zod");
require('dotenv').config();

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: Number,
        required: true,
        unique: true,
        minLength: 10,
        maxLength: 10
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    profilePic: {
        type: String,
        default:
          'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    otp: {
        type:String,
        required:true,
    },
    verified:{
        type:Boolean,
        required:true,
        default:false
    },
    socketID:{
        type:String,
        default:null,
        null:true
    },
    isActive:{
        type:Boolean
    }
    // contacts: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'User',
    //     },
    // ]
})

const User = mongoose.model('User', userSchema);
module.exports = User;