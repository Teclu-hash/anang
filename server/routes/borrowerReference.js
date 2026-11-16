const express = require('express')
const router = express.Router()

const { BorrowerReference, Borrower } = require('../models')

//get request => list of references
router.get("/", async (req, res) => {
    try {
        const referenceList = await BorrowerReference.findAll({
            include: {
                model: Borrower,
                attributes: ["borrower_id", "full_name"]
            }
        })
        res.status(200).json(referenceList)
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching references" })
    }
})

//get all references of one borrower
router.get("/borrower/:borrowerId", async (req, res) => {
    const { borrowerId } = req.params
    try {
        const referenceList = await BorrowerReference.findAll({
            where: { borrower_id: borrowerId }
        })
        res.status(200).json(referenceList)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching references" })
    }
})

//get reference details using reference id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const reference = await BorrowerReference.findOne({
            where: { reference_id: id },
            include: {
                model: Borrower,
                attributes: ["borrower_id", "full_name"]
            }
        })
        if (!reference) {
            return res.status(404).json({ message: "Reference not found!" })
        }
        res.status(200).json(reference)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching reference" })
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    try {
        const newReference = req.body
        await BorrowerReference.create(newReference)
        res.status(201).json({ message: "Successfully created reference" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while creating new reference" })
    }
})

//update reference data
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { reference_name, relationship, contact_number, address } = req.body

    try {
        const reference = await BorrowerReference.update(
            { reference_name, relationship, contact_number, address },
            { where: { reference_id: id } }
        )
        if (reference[0] === 0) {
            return res.status(404).json({ message: "Reference data not found!" })
        }
        res.status(200).json({ message: "Successfully updated reference data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating reference data" })
    }
})

//delete reference
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deleted = await BorrowerReference.destroy({ where: { reference_id: id } })
        if (deleted === 0) {
            return res.status(404).json({ message: "Reference data not found!" })
        }
        res.status(200).json({ message: "Successfully deleted reference" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while deleting reference" })
    }
})

//last line
module.exports = router
