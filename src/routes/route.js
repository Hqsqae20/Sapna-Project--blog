const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const authorController= require("../controllers/authorController")
const blogController= require("../controllers/blogController")
const auth = require("../middleware/auth")

// Phase 1
router.post("/authors", authorController.registerAuthor)

// router.post("/blogs", blogController.createBlog)

// router.get("/blogs", blogController.getBlogs)

// router.put("/blogs/:blogId", blogController.updateBlog)

// router.delete("/blogs/:blogId", blogController.deleteBlog)

// router.delete("/blogs", blogController.deleteBlogQuery)


// Phase 2

router.post("/login", authorController.loginAuthor)

router.post("/blogs",auth.autherAuth, blogController.createBlog)

router.get("/blogs", auth.autherAuth, blogController.getBlogs)

router.put("/blogs/:blogId", auth.autherAuth, blogController.updateBlog)

router.delete("/blogs/:blogId", auth.autherAuth, blogController.deleteBlog)

router.delete("/blogs", auth.autherAuth, blogController.deleteBlogQuery)

module.exports = router;