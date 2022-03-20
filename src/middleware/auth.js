const jwt = require('jsonwebtoken')
const blogModel = require("../models/blogModel")
let autherAuth= async function (req,res,next){
    try{
        let token = req.headers['x-api-key']
        if(!token){
        res.status(403).send({status: false, msg: "Missing authentication token request" })
        return    
        }
        
        let validateToken =  await jwt.verify(token, "group39")
        if(!validateToken){
        res.status(403).send({status: false, msg: "Invalid authentication request"})
        return
        }
        req.authorId=validateToken.authorId
        
        next()
    } 
    catch (err) {
        console.error(`Error $ {error.message}`)
        res.status(500).send({ status :false, message: error.message })
    }
    }

    

module.exports.autherAuth = autherAuth
