import { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router'
import api from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import StatusBadge from '../components/StatusBadge'
import { peso, today } from '../utils'

const Penalties = () => {
  const [penalties, setPenalties] = useState([])
  const [loans, setLoans] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  const getPenalties = async () => {
    try {
      const res = await api.get('/loan-penalty')
      setPenalties(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get('/loan-penalty')
      .then((res) => setPenalties(res.data))
      .catch((error) => console.log(error))
    api.get('/loan')
      .then((res) => setLoans(res.data))
      .catch((error) => console.log(error))
  }, [])

  const fields = [
    { name: 'loan_id', label: 'Active loan', type: 'select', required: true,
      options: loans.filter((l) => l.loan_status === 'active').map((l) => ({ value: l.loan_id, label: `#${l.loan_id} - ${l.Borrower?.full_name}` })) },
    { name: 'penalty_date', label: 'Penalty date', type: 'date', required: true },
    { name: 'penalty_amount', label: 'Penalty amount', type: 'number', required: true },
    { name: 'penalty_reason', label: 'Reason', required: true }
  ]

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm({ loan_id: '', penalty_date: today(), penalty_amount: '', penalty_reason: '' })
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      await api.post('/loan-penalty/new', form)
      setShow(false)
      getPenalties()
      api.get('/loan').then((res) => setLoans(res.data)).catch((e) => console.log(e))
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this penalty?')) return
    try {
      await api.delete(`/loan-penalty/${id}`)
      getPenalties()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const columns = [
    { label: 'ID', key: 'penalty_id' },
    { label: 'Loan #', render: (p) => <Link to={`/loans/${p.loan_id}`}>{p.loan_id}</Link> },
    { label: 'Date', key: 'penalty_date' },
    { label: 'Amount', render: (p) => peso(p.penalty_amount) },
    { label: 'Reason', key: 'penalty_reason' },
    { label: 'Status', render: (p) => <StatusBadge status={p.penalty_status} /> }
  ]

  return (
    <Container>
      <p className="text-muted">A penalty is added to the loan's remaining balance and is paid through the Payments page.</p>
      <PageHeader title="Penalties" buttonLabel="Add penalty" onButtonClick={openAdd} />
      <DataTable
        columns={columns}
        rows={penalties}
        rowKey="penalty_id"
        actions={(p) => (
          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.penalty_id)}>Delete</Button>
        )}
      />
      <FormModal
        show={show}
        title="Add penalty"
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

export default Penalties
