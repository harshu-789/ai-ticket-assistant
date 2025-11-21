import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../../models/User.js';
import { inngest } from '../inngest/client.js';



export const registerUser = async (req, res) => {
    const {email,password, skills = []} = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({email, password: hashed, skills});

        // Fire Inngest event
        await inngest.send({
            name: 'user/signup',
            data: { email}
        })
        const token = jwt.sign({id: newUser._id,role: newUser.role}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({user: newUser, token});
    } catch (error) {
        res.status(500).json({error: 'Registration failed', details: error.message});
    }
}


export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await user.findOne({email})
        if(!user){
            return res.status(401).json({error: 'Invalid email or password'});
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({error: 'Invalid email or password'});
        }
         const token = jwt.sign({id: newUser._id,role: newUser.role}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({user: newUser, token});
    } catch (error) {
         res.status(500).json({error: 'Login failed', details: error.message});
    }
}


export const logoutUser = async (req, res) => {
    // For JWT, logout is typically handled on the client side by deleting the token.
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({error: 'No token provided'});
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).json({error: 'Invalid token'});
            }
        })
        res.status(200).json({message: 'Logout successful'});
    } catch (error) {
        res.status(500).json({error: 'Logout failed', details: error.message});
    }
}

export const updateUser = async(req,res)=>{
    const {skills = [], role, email} = req.body;
    try {
        if(req.user?.role !== 'admin' ){
            return res.status(403).json({error: 'Forbidden'});
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({error: 'User not found'});
        }
        await User.updateOne({email}, {skills: skills.length ? skills : user.skills, role});
        res.status(200).json({message: 'User updated successfully'});
    } catch (error) {
        res.status(500).json({error: 'Update failed', details: error.message});
    }
}

export const getUsers = async(req,res)=>{
    try {
        if(req.user?.role !== 'admin' ){
            return res.status(403).json({error: 'Forbidden'});
        }
        const users = await User.find().select('-password');
        return res.status(200).json({users});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch users', details: error.message});
    }
}