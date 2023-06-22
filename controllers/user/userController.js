import * as userDao from './userDao.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import {protect} from "../../middleware/authMiddleware.js";
import * as likedSongDao from "../likedSong/likedSongDao.js";

const UsersController = (app) => {
    app.post('/api/user/', registerUser)
    app.post('/api/user/login', loginUser)
    app.get('/api/user/me', protect, getMe)

    app.post('/api/user/likedSongs', getLikedTracks);
    app.post('/api/user/like', addLikedTrack);
    app.post('/api/user/dislike', removeLikedTrack);
}

const removeLikedTrack = async (req, res) => {
    const {userId} = req.body;
    const {trackId} = req.body;
    const existingTrack = await likedSongDao.findLikedTrack(
        {trackId: trackId});

    const userDetails = await userDao.findUserById(userId);

    const index = userDetails.likedTracks.indexOf(existingTrack._id);
    if (index !== -1) {
        userDetails.likedTracks.splice(index, 1);
    }
    if (existingTrack.likedBy.length === 0) {
        await existingTrack.remove();
    }
    await userDetails.save();

    return res.json(userDetails);

}

const addLikedTrack = async (req, res) => {
    const {userId} = req.body;
    const {likedTrackId} = req.body;
    const existingTrack = await likedSongDao.findLikedTrack(
        {trackId: likedTrackId});
    const results = await userDao.addLikedSongToUser(userId, existingTrack);
    return res.json(results);
}

const getLikedTracks = async (req, res) => {
    const {userId} = req.body;
    const results = await userDao.findLikedTracksByUser(userId);
    return res.json(results);
}

// @desc    Register new user
// @route   POST /api/user
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await userDao.findUserByEmail({email})

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await userDao.createUser({
                                              name,
                                              email,
                                              password: hashedPassword,
                                              likedTracks: []
                                          })

    if (user) {
        res.status(201).json({
                                 _id: user.id,
                                 name: user.name,
                                 email: user.email,
                                 token: generateToken(user._id),
                             })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    Authenticate a user
// @route   POST /api/user/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    // Check for user email
    const user = await userDao.findUserByEmail({email})

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
                     _id: user.id,
                     name: user.name,
                     email: user.email,
                     token: generateToken(user._id),
                 })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

// @desc    Get user data
// @route   GET /api/user/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

export default UsersController