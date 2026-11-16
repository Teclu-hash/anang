import { useState, useEffect } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import api from '../api'
import { peso } from '../utils'

const Dashboard = () => {
  const [borrowers, setBorrowers] = useState([])
  const [loans, setLoans] = useState([])
  const [payments, setPayments] = useState([])
  const [penalties, setPenalties] = useState([])

  useEffect(() => {
    //each request is handled on its own, so one failing request does not blank the whole dashboard
    const load = async () => {
      const [b, l, pay, pen] = await Promise.allSettled([
        api.get('/borrower'),
        api.get('/loan'),
        api.get('/loan-payment'),
        api.get('/loan-penalty')
      ])
      if (b.status === 'fulfilled') setBorrowers(b.value.data)
      if (l.status === 'fulfilled') setLoans(l.value.data)
      if (pay.status === 'fulfilled') setPayments(pay.value.data)
      if (pen.status === 'fulfilled') setPenalties(pen.value.data)
    }
    load()
  }, [])

  const activeLoans = loans.filter((l) => l.loan_status === 'active')
  const outstanding = activeLoans.reduce((sum, l) => sum + Number(l.remaining_balance), 0)
  const collected = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
  const unpaidPenalties = penalties
    .filter((p) => p.penalty_status === 'unpaid')
    .reduce((sum, p) => sum + Number(p.penalty_amount), 0)

  const cards = [
    { label: 'Borrowers', value: borrowers.length },
    { label: 'Active loans', value: activeLoans.length },
    { label: 'Outstanding balance', value: peso(outstanding) },
    { label: 'Total collected', value: peso(collected) },
    { label: 'Unpaid penalties', value: peso(unpaidPenalties) }
  ]

  return (
    <Container>
      <h3 className="mb-3">Dashboard</h3>
      <Row className="mb-4">
        {cards.map((c) => (
          <Col md={4} className="mb-3" key={c.label}>
            <Card className="stat-card">
              <Card.Body>
                <Card.Subtitle className="text-muted mb-2">{c.label}</Card.Subtitle>
                <Card.Title className="m-0">{c.value}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Dashboard
