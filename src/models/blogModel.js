const mongoose = require('mongoose');
const moment = require('moment');

const blogsSchema = new mongoose.Schema( {
    title: {
        type: String,
        required: "Blog title is required",
        trim:true,
    },
    body: {
        type: String,
        required: "Blog body is required",
        trim:true,

    },
    authorId: {
        
        ref: "Author",
        required: "Blog Author  is required",
        type:mongoose.Types.ObjectId,

    },
    tags: [{
        type: String,
        trim:true,
    }],
    category: {
        type: String,
        required: "Blog category is required",
        trim:true,

    },
    subcategory: [{
        type: String,
        trim:true,
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });


module.exports = mongoose.model('Blogs', blogsSchema)