import express from "express";
import jwt from 'jsonwebtoken'
import User from "../models/User.js"

const router = express.Router()

const generateToken = (userId) => {
   return jwt.sign({userId},
        process.env.JWT_SECRET,
        {expiresIn : "15d"}
    )
}

// register route
router.post('/register',  async (req , res)=> {
    try {
        const {email, password, username} = req.body

        if(!username || !password || !email){
            return res.status(400).json({message : "All fields are required"})
        }

        if(password.length <6) {
            return res.status(400).json({ message : "password must not be less than 6"})
        }

        if(username.length < 3){
            return res.status(400).json({message : "name must be atleast 3 character long"})
        }

        const existingEmail = await User.findOne({email})
        if (existingEmail){
            return res.status(400).json({message : `user with this email: ${email} already exist`})
        }

        const existingUsername = await User.findOne({username})
        if (existingUsername){
            return res.status(400).json({message : `user with the username: ${username} already exist`})
        }


        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`
        const user = new User({
            email,
            password,
            username,
            profileImage
        })
        await user.save();
        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
                profileImage: user.profileImage
            }
        })
    } catch (error) {
        console.log("error creating an account", error)
    }
})


// login route
router.post('/login', async (req , res)=> {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({message : "All fields are required"})
        }
        // check if user exist
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message : "Invalid email or password"})
        }
        // check if password is correct
        const isPasswordCorrect = await user.comparePassword(password)
        if(!isPasswordCorrect){
            return res.status(400).json({message : "Invalid email or password"})
        }
        // generate token
        const token = generateToken(user._id)
        // return user and token
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        })
    } catch (error) {
        console.log("error logging in", error)
        res.status(500).json({message : "Server error"})    
    }
})



export default router