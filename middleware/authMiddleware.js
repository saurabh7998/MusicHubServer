import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import * as userDao from '../controllers/user/userDao.js'

export const protect = asyncHandler(async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            req.user = await userDao.findUserById(decoded.id)
            const {_id, name, email, createdAt, updatedAt} = req.user
            req.user = {_id, name, email, createdAt, updatedAt}

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})