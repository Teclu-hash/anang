const express = require('express');
const cors = require('cors');
const app = express();
const port = 3006;
const db = require('./models')
const userRouter = require('./routes/user')
const borrowerRouter = require('./routes/borrower')
const borrowerReferenceRouter = require('./routes/borrowerReference')
const loanRouter = require('./routes/loan')
const loanPaymentRouter = require('./routes/loanPayment')
const loanPenaltyRouter = require('./routes/loanPenalty')
const settingRouter = require('./routes/setting')

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use('/api/user', userRouter)
app.use('/api/borrower', borrowerRouter)
app.use('/api/borrower-reference', borrowerReferenceRouter)
app.use('/api/loan', loanRouter)
app.use('/api/loan-payment', loanPaymentRouter)
app.use('/api/loan-penalty', loanPenaltyRouter)
app.use('/api/setting', settingRouter)

db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
})
