const express = require('express')
const router = express.Router()

const { Setting, User } = require('../models')

//reads the loan settings. returns null values when the admin has not set them yet
const getLoanSettings = async () => {
    const rows = await Setting.findAll()
    const map = {}
    rows.forEach((r) => { map[r.setting_key] = r.setting_value })
    return {
        interest_rate: map.interest_rate !== undefined ? Number(map.interest_rate) : null,
        interest_type: map.interest_type || null
    }
}

//get request => current rate set by the admin (everyone can read)
router.get("/", async (req, res) => {
    try {
        res.status(200).json(await getLoanSettings())
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching settings" })
    }
})

//admin only: set the interest rate (percent per month) and interest type
router.put("/", async (req, res) => {
    const { user_id, interest_rate, interest_type } = req.body
    try {
        const user = await User.findByPk(user_id)
        if (!user || String(user.role).toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Only the admin can change the interest rate." })
        }

        const rate = Number(interest_rate)
        if (interest_rate === "" || interest_rate === undefined || !Number.isFinite(rate) || rate < 0) {
            return res.status(400).json({ message: "Enter a valid interest rate." })
        }
        const type = String(interest_type || "simple").toLowerCase()
        if (!["simple", "compound"].includes(type)) {
            return res.status(400).json({ message: "Interest type must be simple or compound." })
        }

        await Setting.upsert({ setting_key: "interest_rate", setting_value: String(rate) })
        await Setting.upsert({ setting_key: "interest_type", setting_value: type })
        res.status(200).json({ message: "Interest rate updated", interest_rate: rate, interest_type: type })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while saving settings" })
    }
})

module.exports = router
module.exports.getLoanSettings = getLoanSettings
