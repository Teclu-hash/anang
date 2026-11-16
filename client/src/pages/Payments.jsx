import { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router'
import api from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import StatusBadge from '../components/StatusBadge'
import { peso, today } from '../utils'

//payment transactions. a payment can only be added to an active loan
const Payments = ({ user }) => {
  const [payments, setPayments] = useState([])
  const [loans, setLoans] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  const getLoans = async () => {
    try {
      const res = await api.get('/loan')
      setLoans(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getPayments = async () => {
    try {
      const res = await api.get('/loan-payment')
      setPayments(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPayments()
    getLoans()
  }, [])

  const activeLoans = loans.filter((l) => l.loan_status === 'active')

  const fields = [
    { name: 'loan_id', label: 'Active loan', type: 'select', required: true,
      options: activeLoans.map((l) => ({
        value: l.loan_id,
        label: `#${l.loan_id} - ${l.Borrower?.full_name} (balance ${peso(l.remaining_balance)})`
      })) },
    { name: 'payment_date', label: 'Payment date', type: 'date', required: true },
    { name: 'amount_paid', label: 'Amount paid', type: 'number', required: true },
    { name: 'payment_method', label: 'Payment method', type: 'select', required: true,
      options: ['cash', 'gcash', 'bank transfer'].map((m) => ({ value: m, label: m })) }
  ]

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm({ loan_id: '', payment_date: today(), amount_paid: '', payment_method: 'cash' })
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      await api.post('/loan-payment/new', { ...form, user_id: user.user_id })
      setShow(false)
      getPayments()
      getLoans()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment? The amount goes back to the balance.')) return
    try {
      await api.delete(`/loan-payment/${id}`)
      getPayments()
      getLoans()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const columns = [
    { label: 'ID', key: 'payment_id' },
    { label: 'Loan #', render: (p) => <Link to={`/loans/${p.loan_id}`}>{p.loan_id}</Link> },
    { label: 'Date', key: 'payment_date' },
    { label: 'Amount paid', render: (p) => peso(p.amount_paid) },
    { label: 'Principal', render: (p) => peso(p.principal_paid) },
    { label: 'Interest', render: (p) => peso(p.interest_paid) },
    { label: 'Method', key: 'payment_method' },
    { label: 'Received by', render: (p) => p.User?.full_name },
    { label: 'Status', render: (p) => <StatusBadge status={p.payment_status} /> }
  ]

  return (
    <Container>
      <PageHeader title="Payments" buttonLabel="Add payment" onButtonClick={openAdd} />
      <DataTable
        columns={columns}
        rows={payments}
        rowKey="payment_id"
        actions={(p) => (
          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.payment_id)}>Delete</Button>
        )}
      />
      <FormModal
        show={show}
        title="Add payment"
        fields={fields}
        values={form}
        onChange={handleChange}
        onSave={handleSave}
        onClose={() => setShow(false)}
        error={error}
      />
    </Container>
  )
}

export default Payments
