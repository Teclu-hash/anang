import { useState, useEffect } from 'react'
import { Container, Alert } from 'react-bootstrap'
import { Link } from 'react-router'
import api from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import StatusBadge from '../components/StatusBadge'
import { peso, today } from '../utils'

const Loans = ({ user }) => {
  const [loans, setLoans] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({})
  const [rate, setRate] = useState(null)
  const [error, setError] = useState('')

  const getLoans = async () => {
    try {
      const res = await api.get('/loan')
      setLoans(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get('/loan')
      .then((res) => setLoans(res.data))
      .catch((error) => console.log(error))
    api.get('/borrower')
      .then((res) => setBorrowers(res.data))
      .catch((error) => console.log(error))
    api.get('/setting')
      .then((res) => setRate(res.data))
      .catch((error) => console.log(error))
  }, [])

  //new loan: the interest rate is set by the admin (Settings page).
  //total, due date and balance are filled by the server
  const addFields = [
    { name: 'borrower_id', label: 'Borrower', type: 'select', required: true,
      options: borrowers.map((b) => ({ value: b.borrower_id, label: b.full_name })) },
    { name: 'principal_amount', label: 'Principal amount', type: 'number', required: true },
    { name: 'loan_term', label: 'Loan term (months)', type: 'number', required: true },
    { name: 'loan_date', label: 'Loan date', type: 'date', required: true }
  ]

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm({ borrower_id: '', principal_amount: '', loan_term: '', loan_date: today() })
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      //user_id is the logged in user
      await api.post('/loan/new', { ...form, user_id: user.user_id })
      setShow(false)
      getLoans()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const columns = [
    { label: 'Loan #', render: (l) => <Link to={`/loans/${l.loan_id}`}>{l.loan_id}</Link> },
    { label: 'Borrower', render: (l) => l.Borrower?.full_name },
    { label: 'Principal', render: (l) => peso(l.principal_amount) },
    { label: 'Rate', render: (l) => `${l.interest_rate}% ${l.interest_type}` },
    { label: 'Term', render: (l) => `${l.loan_term} mo` },
    { label: 'Total', render: (l) => peso(l.total_amount) },
    { label: 'Balance', render: (l) => peso(l.remaining_balance) },
    { label: 'Due date', key: 'due_date' },
    { label: 'Status', render: (l) => <StatusBadge status={l.loan_status} /> }
  ]

  return (
    <Container>
      <PageHeader title="Loans" buttonLabel="Add loan" onButtonClick={openAdd} />
      {rate && rate.interest_rate !== null ? (
        <Alert variant="info" className="py-2">
          Current interest rate (set by admin): <strong>{rate.interest_rate}% per month</strong> ({rate.interest_type})
        </Alert>
      ) : (
        <Alert variant="warning" className="py-2">
          The admin has not set the interest rate yet. Loans cannot be created until it is set.
        </Alert>
      )}
      <DataTable columns={columns} rows={loans} rowKey="loan_id" />
      <FormModal
        show={show}
        title="Add loan"
        fields={addFields}
        values={form}
        onChange={handleChange}
        onSave={handleSave}
        onClose={() => setShow(false)}
        error={error}
      />
    </Container>
  )
}

export default Loans
