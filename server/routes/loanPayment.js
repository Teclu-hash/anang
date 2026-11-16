const express = require('express')
const router = express.Router()

const { LoanPayment, Loan, LoanPenalty, User, sequelize } = require('../models')

//get request => list of payments
router.get("/", async (req, res) => {
    try {
        const paymentList = await LoanPayment.findAll({
            include: [
                { model: Loan, attributes: ["loan_id", "borrower_id", "remaining_balance"] },
                { model: User, attributes: ["user_id", "full_name"] }
            ]
        })
        res.status(200).json(paymentList)
    } catch (error) {
        console.error("Error fetching payments:", error)
        res.status(500).json({ message: error.message || "An error occurred while fetching payments" })
    }
})

//get all payments of one loan
router.get("/loan/:loanId", async (req, res) => {
    const { loanId } = req.params
    try {
        const paymentList = await LoanPayment.findAll({
            where: { loan_id: loanId },
            order: [["payment_date", "ASC"]]
        })
        res.status(200).json(paymentList)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching payments" })
    }
})

//get payment details using payment id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const payment = await LoanPayment.findOne({
            where: { payment_id: id },
            include: [
                { model: Loan },
                { model: User, attributes: ["user_id", "full_name"] }
            ]
        })
        if (!payment) {
            return res.status(404).json({ message: "Payment not found!" })
        }
        res.status(200).json(payment)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching payment" })
    }
})

//creates a POST API route
//also lowers the remaining balance of the loan
router.post("/new", async (req, res) => {
    const {
        loan_id, user_id, payment_date, amount_paid,
        principal_paid = 0, interest_paid = 0, payment_method = "cash",
        payment_status = "paid"
    } = req.body

    const amount = Number(amount_paid)
    let principal = Number(principal_paid)
    let interest = Number(interest_paid)

    if (!loan_id || !user_id || !Number.isFinite(amount) || amount <= 0 ||
        !Number.isFinite(principal) || principal < 0 ||
        !Number.isFinite(interest) || interest < 0) {
        return res.status(400).json({ message: "Enter a valid loan, user, and payment amount. Payment amounts cannot be negative." })
    }

    const t = await sequelize.transaction()
    try {
        const loan = await Loan.findByPk(loan_id, {
            transaction: t,
            lock: t.LOCK.UPDATE
        })
        if (!loan) {
            await t.rollback()
            return res.status(404).json({ message: "Loan not found." })
        }

        const balanceBefore = Number(loan.remaining_balance)
        if (amount > balanceBefore) {
            await t.rollback()
            return res.status(400).json({
                message: `Payment exceeds the remaining balance of ${balanceBefore.toFixed(2)}.`
            })
        }

        if (loan.loan_status !== "active") {
            await t.rollback()
            return res.status(400).json({ message: "Payments can only be added to active loans." })
        }

        //principal/interest not given: split the payment using the loan's interest share
        if (principal === 0 && interest === 0) {
            const total = Number(loan.total_amount)
            const share = total > 0 ? (total - Number(loan.principal_amount)) / total : 0
            interest = Math.round(amount * share * 100) / 100
            principal = Math.round((amount - interest) * 100) / 100
        }

        await LoanPayment.create({
            loan_id, user_id, payment_date: payment_date || new Date(),
            amount_paid: amount.toFixed(2),
            principal_paid: principal.toFixed(2),
            interest_paid: interest.toFixed(2),
            payment_method, payment_status
        }, { transaction: t })

        const balance = Math.max(balanceBefore - amount, 0)
        await loan.update({
            remaining_balance: balance.toFixed(2),
            loan_status: balance === 0 ? "paid" : "active"
        }, { transaction: t })

        //loan fully paid: the penalties were part of the balance, so they are paid too
        if (balance === 0) {
            await LoanPenalty.update(
                { penalty_status: "paid" },
                { where: { loan_id: loan.loan_id, penalty_status: "unpaid" }, transaction: t }
            )
        }

        await t.commit()
        res.status(201).json({ message: "Payment recorded successfully.", remaining_balance: balance.toFixed(2) })
    } catch (error) {
        if (!t.finished) await t.rollback()
        console.error("Error recording payment:", error)
        res.status(400).json({ message: error.message || "Unable to record payment. Check the loan, user, and payment details." })
    }
})

//update payment data (does not change the loan balance)
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { payment_date, payment_method, payment_status } = req.body

    try {
        const payment = await LoanPayment.update(
            { payment_date, payment_method, payment_status },
            { where: { payment_id: id } }
        )
        if (payment[0] === 0) {
            return res.status(404).json({ message: "Payment data not found!" })
        }
        res.status(200).json({ message: "Successfully updated payment data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating payment data" })
    }
})

//delete payment, gives the amount back to the loan balance
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    const t = await sequelize.transaction()
    try {
        const payment = await LoanPayment.findByPk(id, { transaction: t })
        if (!payment) {
            await t.rollback()
            return res.status(404).json({ message: "Payment data not found!" })
        }

        const loan = await Loan.findByPk(payment.loan_id, { transaction: t })
        if (loan) {
            //loan goes back to active, so its penalties are unpaid again
            if (loan.loan_status === "paid") {
                await LoanPenalty.update(
                    { penalty_status: "unpaid" },
                    { where: { loan_id: loan.loan_id, penalty_status: "paid" }, transaction: t }
                )
            }
            const balance = Number(loan.remaining_balance) + Number(payment.amount_paid)
            await loan.update({
                remaining_balance: balance.toFixed(2),
                loan_status: loan.loan_status === "paid" ? "active" : loan.loan_status
            }, { transaction: t })
        }

        await payment.destroy({ transaction: t })
        await t.commit()
        res.status(200).json({ message: "Successfully deleted payment" })
    } catch (error) {
        if (!t.finished) await t.rollback()
        console.error("Error deleting payment:", error)
        res.status(400).json({ message: error.message || "An error occurred while deleting payment" })
    }
})

//last line
module.exports = router
