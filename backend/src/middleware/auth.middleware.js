import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) =>{
    try {
        // get token from header
        const token = req.header("authorization")?.replace("Bearer", "");
        if(!token){
            return res.status(401).json({message : "Access denied , Not authorization token"})
        }
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // find user 
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message : "Token is not valid"})
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("auth middleware error", error);
        res.status(500).json({message : "Server error in auth middleware"})
    }
}

export default protectRoute;