const express = require('express')
const crypto = require('crypto')
const router = express.Router()

const { User } = require('../models')

//password helpers (built-in crypto, no extra package needed)
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(password, salt, 64).toString('hex')
    return `${salt}:${hash}`
}

const checkPassword = (password, stored) => {
    const [salt, hash] = stored.split(':')
    const test = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), test)
}

//get request => list of users
router.get("/", async (req, res) => {
    try {
        const userList = await User.findAll({
            attributes: ["user_id", "username", "full_name", "role"]
        })
        res.status(200).json(userList)
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching users" })
    }
})

//get user details using user id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findOne({
            attributes: ["user_id", "username", "full_name", "role"],
            where: { user_id: id }
        })
        if (!user) {
            return res.status(404).json({ message: "User not found!" })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching user" })
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const { username, password, full_name, role } = req.body
    try {
        await User.create({
            username,
            password: hashPassword(password),
            full_name,
            role
        })
        res.status(201).json({ message: "Successfully created user" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while creating new user" })
    }
})

//login
router.post("/login", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ where: { username: username } })
        if (!user || !checkPassword(password, user.password)) {
            return res.status(401).json({ message: "Invalid username or password" })
        }
        res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while logging in" })
    }
})

//update user data
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { username, password, full_name, role } = req.body

    try {
        const data = { username, full_name, role }
        if (password) {
            data.password = hashPassword(password)
        }
        const user = await User.update(data, { where: { user_id: id } })
        if (user[0] === 0) {
            return res.status(404).json({ message: "User data not found!" })
        }
        res.status(200).json({ message: "Successfully updated user data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating user data" })
    }
})

//delete user
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deleted = await User.destroy({ where: { user_id: id } })
        if (deleted === 0) {
            return res.status(404).json({ message: "User data not found!" })
        }
        res.status(200).json({ message: "Successfully deleted user" })
    } catch (error) {
        res.status(400).json({ message: "Cannot delete user, it may still be linked to loans or payments" })
    }
})

//last line
module.exports = router
