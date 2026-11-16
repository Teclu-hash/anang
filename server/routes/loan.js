const express = require('express')
const router = express.Router()

const { Loan, Borrower, User, LoanPayment, LoanPenalty } = require('../models')
const { getLoanSettings } = require('./setting')

//helpers
const round2 = (n) => Math.round(n * 100) / 100

//total amount to pay back. interest_rate is percent per month
const computeTotal = (principal, rate, type, term) => {
    principal = Number(principal)
    rate = Number(rate) / 100
    term = Number(term)
    if (String(type).toLowerCase() === "compound") {
        return round2(principal * Math.pow(1 + rate, term))
    }
    return round2(principal + principal * rate * term)
}

//due date = loan date + loan term (months)
const computeDueDate = (loanDate, term) => {
    const d = new Date(loanDate)
    d.setMonth(d.getMonth() + Number(term))
    return d.toISOString().slice(0, 10)
}

//get request => list of loans
router.get("/", async (req, res) => {
    try {
        const loanList = await Loan.findAll({
            include: [
                { model: Borrower, attributes: ["borrower_id", "full_name"] },
                { model: User, attributes: ["user_id", "full_name"] }
            ]
        })
        res.status(200).json(loanList)
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching loans" })
    }
})

//get all loans of one borrower
router.get("/borrower/:borrowerId", async (req, res) => {
    const { borrowerId } = req.params
    try {
        const loanList = await Loan.findAll({
            where: { borrower_id: borrowerId }
        })
        res.status(200).json(loanList)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching loans" })
    }
})

//get loan details (borrower, payments, penalties) using loan id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const loan = await Loan.findOne({
            where: { loan_id: id },
            include: [
                { model: Borrower },
                { model: User, attributes: ["user_id", "full_name"] },
                { model: LoanPayment },
                { model: LoanPenalty }
            ]
        })
        if (!loan) {
            return res.status(404).json({ message: "Loan not found!" })
        }
        res.status(200).json(loan)
    } catch (error) {
        res.status(500).json({ message: "Database error while fetching loan" })
    }
})

//creates a POST API route
//the interest rate and type always come from the admin settings, not from the request
router.post("/new", async (req, res) => {
    try {
        const settings = await getLoanSettings()
        if (settings.interest_rate === null) {
            return res.status(400).json({ message: "The admin has not set the interest rate yet." })
        }

        const newLoan = req.body
        const loanDate = newLoan.loan_date || new Date().toISOString().slice(0, 10)
        const total = computeTotal(newLoan.principal_amount, settings.interest_rate, settings.interest_type, newLoan.loan_term)

        await Loan.create({
            borrower_id: newLoan.borrower_id,
            user_id: newLoan.user_id,
            principal_amount: newLoan.principal_amount,
            loan_term: newLoan.loan_term,
            interest_rate: settings.interest_rate,
            interest_type: settings.interest_type,
            loan_date: loanDate,
            due_date: computeDueDate(loanDate, newLoan.loan_term),
            total_amount: total,
            remaining_balance: total,
            loan_status: "active"
        })
        res.status(201).json({ message: "Successfully created loan" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while creating new loan" })
    }
})

//update loan data
router.put("/:id", async (req, res) => {
    const { id } = req.params
    const {
        borrower_id, user_id, principal_amount, interest_rate, interest_type,
        loan_term, loan_date, due_date, total_amount, remaining_balance, loan_status
    } = req.body

    try {
        const loan = await Loan.update(
            {
                borrower_id, user_id, principal_amount, interest_rate, interest_type,
                loan_term, loan_date, due_date, total_amount, remaining_balance, loan_status
            },
            { where: { loan_id: id } }
        )
        if (loan[0] === 0) {
            return res.status(404).json({ message: "Loan data not found!" })
        }
        res.status(200).json({ message: "Successfully updated loan data" })
    } catch (error) {
        res.status(400).json({ message: "An error occurred while updating loan data" })
    }
})

//delete loan
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deleted = await Loan.destroy({ where: { loan_id: id } })
        if (deleted === 0) {
            return res.status(404).json({ message: "Loan data not found!" })
        }
        res.status(200).json({ message: "Successfully deleted loan" })
    } catch (error) {
        res.status(400).json({ message: "Cannot delete loan, it may still have payments or penalties" })
    }
})

//last line
module.exports = router
