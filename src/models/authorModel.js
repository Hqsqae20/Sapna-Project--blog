const mongoose = require('mongoose');
const validator = require('validator');

const authorSchema = new mongoose.Schema( {
    fname: {
        type:String,
        required: "first name is required",
        trim:true

    },
    
    lname: {
        type: String,
        required: "Last name is required",
        trim:true
    },
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss","Mast"],
        required: "Title is required",
    },
    email: {
        type: String,
        required: true,
        trim:true,
        lowercase:true,
        unique: true,
        required: " Email is required",
        validate: {
            validator:function(email){
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            },message:"Please fill valid email",isAsync:false
        },
        
    },
    password: {
        type: String,
        required: "Password is required",
        lowercase: true,
        trim: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema)