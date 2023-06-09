import * as userDao from './userDao.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import {protect} from "../../middleware/authMiddleware.js";

const UsersController = (app) => {
    app.post('/api/user/', registerUser)
    app.post('/api/user/login', loginUser)
    app.get('/api/user/me', protect, getMe)
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