const express = require('express')
const router = express.Router()

const { LoanPenalty, Loan, sequelize } = require('../models')

//get request => list of penalties
router.get("/", async (req, res) => {
    try {
        const penaltyList = await LoanPenalty.findAll({
            include: {
                model: Loan,
                attributes: ["loan_id", "borrower_id", "loan_status"]
            }
        })
        res.status(200).json(penaltyList)
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching penalties" })
    }
})

//get all penalties of one loan
router.get("/loan/:loanId", async (req, res) => {
    const { loanId } = req.params
    try {
        const penaltyList = await LoanPenalty.findAll({
            where: { loan_id: loanId }
        })
        res.status(200).json(penaltyList)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching penalties" })
    }
})

//get penalty details using penalty id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const penalty = await LoanPenalty.findOne({
            where: { penalty_id: id },
            include: { model: Loan }
        })
        if (!penalty) {
            return res.status(404).json({ message: "Penalty not found!" })
        }
        res.status(200).json(penalty)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching penalty" })
    }
})

//creates a POST API route
//the penalty is added to the loan's remaining balance, so it is paid in the payment module
router.post("/new", async (req, res) => {
    const { loan_id, penalty_amount, penalty_date, penalty_reason } = req.body
    const amount = Number(penalty_amount)

    if (!loan_id || !Number.isFinite(amount) || amount <= 0 || !penalty_reason) {
        return res.status(400).json({ message: "Enter a loan, a penalty amount above zero, and a reason." })
    }

    const t = await sequelize.transaction()
    try {
        const loan = await Loan.findByPk(loan_id, { transaction: t, lock: t.LOCK.UPDATE })
        if (!loan) {
            await t.rollback()
            return res.status(404).json({ message: "Loan not found." })
        }
        if (loan.loan_status !== "active") {
            await t.rollback()
            return res.status(400).json({ message: "Penalties can only be added to active loans." })
        }

        await LoanPenalty.create({
            loan_id,
            penalty_amount: amount.toFixed(2),
            penalty_date: penalty_date || new Date(),
            penalty_reason,
            penalty_status: "unpaid"
        }, { transaction: t })

        await loan.update({
            remaining_balance: (Number(loan.remaining_balance) + amount).toFixed(2)
        }, { transaction: t })

        await t.commit()
        res.status(201).json({ message: "Successfully created penalty and added it to the loan balance" })
    } catch (error) {
        if (!t.finished) await t.rollback()
        res.status(400).json({ message: "An error occurred while creating new penalty" })
    }
})

//update penalty date / reason (the amount is tied to the loan balance, so it is not changed here)
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { penalty_date, penalty_reason } = req.body

    try {
        const penalty = await LoanPenalty.update(
            { penalty_date, penalty_reason },
            { where: { penalty_id: id } }
        )
        if (penalty[0] === 0) {
            return res.status(404).json({ message: "Penalty data not found!" })
        }
        res.status(200).json({ message: "Successfully updated penalty data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating penalty data" })
    }
})

//delete penalty, takes the amount back out of the loan balance if the loan is still active
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    const t = await sequelize.transaction()
    try {
        const penalty = await LoanPenalty.findByPk(id, { transaction: t })
        if (!penalty) {
            await t.rollback()
            return res.status(404).json({ message: "Penalty data not found!" })
        }

        const loan = await Loan.findByPk(penalty.loan_id, { transaction: t, lock: t.LOCK.UPDATE })
        if (loan && loan.loan_status === "active" && penalty.penalty_status === "unpaid") {
            const balance = Math.max(Number(loan.remaining_balance) - Number(penalty.penalty_amount), 0)
            await loan.update({
                remaining_balance: balance.toFixed(2),
                loan_status: balance === 0 ? "paid" : "active"
            }, { transaction: t })
        }

        await penalty.destroy({ transaction: t })
        await t.commit()
        res.status(200).json({ message: "Successfully deleted penalty" })
    } catch (error) {
        if (!t.finished) await t.rollback()
        res.status(400).json({ message: "An error occurred while deleting penalty" })
    }
})

//last line
module.exports = router
