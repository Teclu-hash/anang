const express = require('express')
const router = express.Router()

const { Borrower, BorrowerReference, Loan } = require('../models')

//get request => list of borrowers
router.get("/", async (req, res) => {
    try {
        const borrowerList = await Borrower.findAll()
        res.status(200).json(borrowerList)
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching borrowers" })
    }
})

//get borrower details (with references and loans) using borrower id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const borrower = await Borrower.findOne({
            where: { borrower_id: id },
            include: [
                { model: BorrowerReference },
                { model: Loan }
            ]
        })
        if (!borrower) {
            return res.status(404).json({ message: "Borrower not found!" })
        }
        res.status(200).json(borrower)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching borrower" })
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    try {
        const newBorrower = req.body
        await Borrower.create(newBorrower)
        res.status(201).json({ message: "Successfully created borrower" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while creating new borrower" })
    }
})

//update borrower data
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { full_name, contact_number, address, valid_id, monthly_income } = req.body

    try {
        const borrower = await Borrower.update(
            { full_name, contact_number, address, valid_id, monthly_income },
            { where: { borrower_id: id } }
        )
        if (borrower[0] === 0) {
            return res.status(404).json({ message: "Borrower data not found!" })
        }
        res.status(200).json({ message: "Successfully updated borrower data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating borrower data" })
    }
})

//delete borrower
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deleted = await Borrower.destroy({ where: { borrower_id: id } })
        if (deleted === 0) {
            return res.status(404).json({ message: "Borrower data not found!" })
        }
        res.status(200).json({ message: "Successfully deleted borrower" })
    } catch (error) {
        res.status(400).json({ message: "Cannot delete borrower, it may still have loans or references" })
    }
})

//last line
module.exports = router
