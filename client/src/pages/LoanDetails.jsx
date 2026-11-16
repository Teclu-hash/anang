import { useState, useEffect } from 'react'
import { Container, Button, Card, Row, Col } from 'react-bootstrap'
import { useParams, Link } from 'react-router'
import api from '../api'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import StatusBadge from '../components/StatusBadge'
import { peso, today } from '../utils'

const paymentFields = [
  { name: 'payment_date', label: 'Payment date', type: 'date', required: true },
  { name: 'amount_paid', label: 'Amount paid', type: 'number', required: true },
  { name: 'payment_method', label: 'Payment method', type: 'select', required: true,
    options: ['cash', 'gcash', 'bank transfer'].map((m) => ({ value: m, label: m })) }
]

const penaltyFields = [
  { name: 'penalty_date', label: 'Penalty date', type: 'date', required: true },
  { name: 'penalty_amount', label: 'Penalty amount', type: 'number', required: true },
  { name: 'penalty_reason', label: 'Reason', required: true }
]

const LoanDetails = ({ user }) => {
  const { id } = useParams()
  const [loan, setLoan] = useState(null)
  const [modal, setModal] = useState(null) // "payment" or "penalty"
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  const getLoan = async () => {
    try {
      const res = await api.get(`/loan/${id}`)
      setLoan(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get(`/loan/${id}`)
      .then((res) => setLoan(res.data))
      .catch((error) => console.log(error))
  }, [id])

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openPayment = () => {
    setForm({ payment_date: today(), amount_paid: '', payment_method: 'cash' })
    setError('')
    setModal('payment')
  }

  const openPenalty = () => {
    setForm({ penalty_date: today(), penalty_amount: '', penalty_reason: '' })
    setError('')
    setModal('penalty')
  }

  const handleSave = async () => {
    try {
      if (modal === 'payment') {
        await api.post('/loan-payment/new', {
          ...form,
          loan_id: id,
          user_id: user.user_id
        })
      } else {
        await api.post('/loan-penalty/new', { ...form, loan_id: id })
      }
      setModal(null)
      getLoan()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const deletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment? The amount goes back to the balance.')) return
    try {
      await api.delete(`/loan-payment/${paymentId}`)
      getLoan()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const deletePenalty = async (penaltyId) => {
    if (!window.confirm('Delete this penalty?')) return
    try {
      await api.delete(`/loan-penalty/${penaltyId}`)
      getLoan()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  if (!loan) {
    return <Container>Loading...</Container>
  }

  const paymentColumns = [
    { label: 'Date', key: 'payment_date' },
    { label: 'Amount paid', render: (p) => peso(p.amount_paid) },
    { label: 'Principal', render: (p) => peso(p.principal_paid) },
    { label: 'Interest', render: (p) => peso(p.interest_paid) },
    { label: 'Method', key: 'payment_method' },
    { label: 'Status', render: (p) => <StatusBadge status={p.payment_status} /> }
  ]

  const penaltyColumns = [
    { label: 'Date', key: 'penalty_date' },
    { label: 'Amount', render: (p) => peso(p.penalty_amount) },
    { label: 'Reason', key: 'penalty_reason' },
    { label: 'Status', render: (p) => <StatusBadge status={p.penalty_status} /> }
  ]

  return (
    <Container>
      <Link to="/loans">&larr; Back to loans</Link>
      <h3 className="my-3">Loan #{loan.loan_id} <StatusBadge status={loan.loan_status} /></h3>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <strong>Borrower:</strong>{' '}
              <Link to={`/borrowers/${loan.borrower_id}`}>{loan.Borrower?.full_name}</Link>
            </Col>
            <Col md={6}><strong>Handled by:</strong> {loan.User?.full_name}</Col>
            <Col md={6}><strong>Principal:</strong> {peso(loan.principal_amount)}</Col>
            <Col md={6}><strong>Interest:</strong> {loan.interest_rate}% per month ({loan.interest_type})</Col>
            <Col md={6}><strong>Term:</strong> {loan.loan_term} months</Col>
            <Col md={6}><strong>Loan date:</strong> {loan.loan_date}</Col>
            <Col md={6}><strong>Due date:</strong> {loan.due_date}</Col>
            <Col md={6}><strong>Total amount:</strong> {peso(loan.total_amount)}</Col>
            <Col md={6}><strong>Remaining balance:</strong> {peso(loan.remaining_balance)}</Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Payments</h5>
        <Button size="sm" onClick={openPayment} disabled={loan.loan_status !== 'active'}>Add payment</Button>
      </div>
      <DataTable
        columns={paymentColumns}
        rows={loan.LoanPayments || []}
        rowKey="payment_id"
        actions={(p) => (
          <Button size="sm" variant="outline-danger" onClick={() => deletePayment(p.payment_id)}>Delete</Button>
        )}
      />

      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h5 className="m-0">Penalties</h5>
        <Button size="sm" onClick={openPenalty} disabled={loan.loan_status !== 'active'}>Add penalty</Button>
      </div>
      <DataTable
        columns={penaltyColumns}
        rows={loan.LoanPenalties || []}
        rowKey="penalty_id"
        actions={(p) => (
          <Button size="sm" variant="outline-danger" onClick={() => deletePenalty(p.penalty_id)}>Delete</Button>
        )}
      />

      <FormModal
        show={modal !== null}
        title={modal === 'payment' ? 'Add payment' : 'Add penalty'}
        fields={modal === 'payment' ? paymentFields : penaltyFields}
        values={form}
        onChange={handleChange}
        onSave={handleSave}
        onClose={() => setModal(null)}
        error={error}
      />
    </Container>
  )
}

export default LoanDetails
