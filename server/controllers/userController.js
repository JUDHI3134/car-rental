import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

//generate jwt token
const generateToken = (userId) => {
    const payload = userId;

    return jwt.sign(payload, process.env.JWT_SECRET)
}

//Register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.json({success: false, message:"Fill all the fields"})
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
           return res.json({success: false, message:"User already exist"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashedPassword })
        
        const token = generateToken(user._id.toString());

        res.json({success: true, token})

    } catch (error) {
        console.log("Error while register user",error)
        res.json({success: false, message:error.message})
    }
}

//login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        
        if (!user) {
           return res.json({success: false, message:"User not found"})  
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({success: false, message:"Invalid Credentials"}) 
        }

        const token = generateToken(user._id.toString());

        res.json({success: true, token})


    } catch (error) {
        console.log("Error while Login user",error)
        res.json({success: false, message:error.message})
    }
}

// get user data using token (JWT) 
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        res.json({success: true, user})
    } catch (error) {
         console.log("Error at get user data : ",error)
        res.json({success: false, message:error.message})
    }
}