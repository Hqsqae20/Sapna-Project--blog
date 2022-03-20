const { count } = require("console")
const mongoose = require('mongoose');
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const moment = require('moment')

const isValid=function(value){
    if(typeof value ==='undefined' || value === null) return false
    if(typeof value ==='string' && value.trim().length === 0) return false
    return true
} 


const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBlog = async function (req, res) {
    try{
        const requestBody=req.body

        if(!isValidRequestBody(requestBody)){
            res.status(400).send({ status: false, message: "Invalid request parameters. Please provide login details"})
            return
         }

         //Extract pramas
         const {title,body,authorId,tags,category,subcategory,isPublished} =requestBody

         //Validation starts
         if(!isValid(title)){
            res.status(400).send({status:false,message:' Blog title is required'})
            return
        }

        if(!isValid(body)){
            res.status(400).send({status:false,message:'blog body  is required'})
            return
        }

        if(!isValid(authorId)){
            res.status(400).send({status:false,message:'Author Id is required'})
            return
        }

        if(!isValidObjectId(authorId)){
            res.status(400).send({status:false,message: `${authorId} is not a valid author id`})
            return
        }

        if(!isValid(category)){
            res.status(400).send({status:false,message:'Blog category is required'})
            return
        }

        const author =await authorModel.findById(authorId)
        if(!author){
            res.status(401).send({status:false,message:'Author does not exit'})
            return
        }

        const blogData={
            title,
            body,
            authorId,
            category,
            isPublished:isPublished ? isPublished :false,
            publishedAt:isPublished ? new Date() :null
        }

        if(tags){
            if(Array.isArray(tags)){
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === "[Object string]"){
                blogData['tags'] = [ tags]
            }
        }

        if(subcategory){
            if(Array.isArray(subcategory)){
                blogData['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === "[Object string]"){
                blogData['subcategory'] = [ subcategory]
            }
        }

        const newBlog=await blogModel.create(blogData)
        res.status(201).send({status:true,message:`New Blog created successfully`,data:newBlog})
    }catch (error) {
        console.log(error)
        res.status(500).send({status :false, message:  error.message })
    }
}

const getBlogs = async function (req, res) {
    try{
        const filterQuery ={isDeleted :false ,deleteAt :null ,isPublished :true}
        const queryParams=req.query

        if(isValidRequestBody(queryParams)){
            const {authorId,category,tags,subcategory} =queryParams

            if(isValid(authorId) && isValidObjectId(authorId)){
                filterQuery['authorId']= authorId
            }

            if(isValid(category)){
                filterQuery['category']= category.trim()
            }

            if(isValid(tags)){
                const tagsArr=tags.trim().split(',').map(tag =>tag.trim())
                filterQuery['tags']= {$all:tagsArr}
            }

            if(isValid(subcategory)){
                const subcatArr=subcategory.trim().split(',').map(subcatArr =>subcatArr.trim())
                filterQuery['subcategory']= {$all:subcatArr}
            }
        }
        const blogs =await blogModel.find(filterQuery)

        if(Array.isArray(blogs ) && blogs.length === 0){
            res.status(404).send({status :false, message:  "No blogs found" })
            return
        }
        res.status(200).send({status :true, message:  `Blogs list` ,data:blogs})
    }catch (error) {
        
        res.status(500).send({status :false, message:  error.message })
    }
}

const updateBlog = async (req, res) => {

    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        // validations...

        if (!isValidObjectId(blogId)) {
            res.status(400).send( { status : false , message : `${blogId} is Not a Valid Blog id` } )
            return
        }

        if (!isValidObjectId(authorIdFromToken)) {
            res.status(400).send( { status : false , message : `${authorIdFromToken} is Not a Valid token id` } )
            return
        }

        const blog = await blogModel.findOne( { _id: blogId, isDeleted: false, deletedAt: null } )

        if(!blog) {
            res.status(404).send({ status : false , message : "Blog Not Found" } )
            return
        }

        if(blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send( { status : false , message : 'Unauthorized access ! Owner Info dosent match' } )
            return
        }

        if(!isValidRequestBody(requestBody)) {
            res.status(200).send( { status : false , message : 'No parameters Passed. Blog unmodified', Data : blog } )
            return
        }

        ////  Extracting Params  ////

        const {title, body, tags, category, subcategory, isPublished} = requestBody

        const updateBlogData = {}

        if(isValid(title)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['title'] = title
        }

        if(isValid(body)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['body'] = body
        }

        if(isValid(category)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(tags)) {
                updateBlogData['$addToSet']['tags'] = { $each : [...tags] } 
            }

            if(typeof tags === 'string') {

                updateBlogData['$addToSet']['tags'] = tags
            }

        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(subcategory)) {
                updateBlogData['$addToSet']['subcategory'] = { $each : [...subcategory] } 
            }

            if(typeof subcategory === 'string') {

                updateBlogData['$addToSet']['subcategory'] = subcategory
            }

        }

        const updatedBlog = await blogModel.findOneAndUpdate( { _id: blogId }, updateBlogData, {new : true} )
              res.status(200).send( { status : true , message : 'Blog Updated Successfully', data : updateBlogData } )

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

// 
const deleteBlog = async function (req, res) {
    try{
    let params = req.params
    let blogId = params.blogId
    let authorIdFromToken = req.authorId

    if(!isValidObjectId(blogId)){
        res.status(400).send({status:false,message: `${blogId} is not a valid blog id`})
        return

    }
    if(!isValidObjectId(authorIdFromToken)){
        res.status(400).send({status:false,message: `${authorIdFromToken} is not a valid token id`})
        return
    }

    const blog =await blogModel.findOne({_id:blogId,isDeleted:false,deleteAt:null})

    if(!blog){
        res.status(404).send({status:false,message: `Blog not found`})
        return
    }

    if(blog.authorId.toString() !==authorIdFromToken){
        res.status(401).send({status:false,message: `Unauthorized access!Owner info doesn't match`})
        return
    }
    await blogModel.findOneAndUpdate({_id:blogId}, {$set :{isDeleted:true ,deletedAt:new Date()}})

    res.status(200).send({status:true, message: `Blog deleted successfully`})
} catch (error) {    
    res.status(500).send({status :false, message:  error.message })
}

}

const deleteBlogQuery =async function(req,res)
{
    try{
        const filterQuery={isDeleted:false, deletedAt :null}
        const queryParams=req.query
        let authorIdFromToken = req.authorId

        if(!isValidObjectId(authorIdFromToken)){
            res.status(400).send({status:false,message: `${authorIdFromToken} is not a valid token id`})
            return
        }

        if(!isValidRequestBody(queryParams)){
            res.status(400).send({status:true,message: `No query Params recieved`})
            return
        }

        const {authorId,tags,category,subcategory,isPublished}=queryParams

        if(isValid(authorId) && isValidObjectId(authorId)){
            filterQuery['authorId']=authorId
        }

        if(isValid(category)){
            filterQuery['category']=category.trim()
        }

        if(isValid(isPublished)){
            filterQuery['isPublished']=isPublished
        }

        if(isValid(tags)){
            const tagsArr=tags.trim().split(',').map(tag =>tag.trim())
            filterQuery['tags']= {$all:tagsArr}
        }  
        
        if(isValid(subcategory)){
            const subcatArr=subcategory.trim().split(',').map(subcatArr =>subcatArr.trim())
            filterQuery['subcategory']= {$all:subcatArr}
        }
    
    const blogs =await blogModel.find(filterQuery)

    if(Array.isArray(blogs ) && blogs.length === 0){
        res.status(404).send({status :false, message:  "No matcing blogs found" })
        return
    }

    const idOfBlogDelete=blogs.map(blog =>{
        if(blog.authorId.toString() === authorIdFromToken) return blog._id
    })

    if(idOfBlogDelete.length ===0){
        res.status(404).send({status :false, message:  "No blogs found" })
        return
    }
    await blogModel.updateMany({_id: {$in: idOfBlogDelete}}, {$set: {isDeleted :true,deletedAt:true,deletedAt:new Date()}})

    res.status(200).send({status:true, message: `Blog deleted successfully`})
} catch (error) {    
    res.status(500).send({status :false, message:  error.message })
}   
}

    
module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteBlogQuery = deleteBlogQuery
