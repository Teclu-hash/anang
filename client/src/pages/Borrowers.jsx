import { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router'
import api from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { peso } from '../utils'

const emptyForm = { full_name: '', contact_number: '', address: '', valid_id: '', monthly_income: '' }

const fields = [
  { name: 'full_name', label: 'Full name', required: true },
  { name: 'contact_number', label: 'Contact number', required: true },
  { name: 'address', label: 'Address', required: true },
  { name: 'valid_id', label: 'Valid ID', required: true },
  { name: 'monthly_income', label: 'Monthly income', type: 'number', required: true }
]

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const getBorrowers = async () => {
    try {
      const res = await api.get('/borrower')
      setBorrowers(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get('/borrower')
      .then((res) => setBorrowers(res.data))
      .catch((error) => console.log(error))
  }, [])

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setError('')
    setShow(true)
  }

  const openEdit = (b) => {
    setForm(b)
    setEditId(b.borrower_id)
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/borrower/${editId}`, form)
      } else {
        await api.post('/borrower/new', form)
      }
      setShow(false)
      getBorrowers()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this borrower?')) return
    try {
      await api.delete(`/borrower/${id}`)
      getBorrowers()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const columns = [
    { label: 'ID', key: 'borrower_id' },
    { label: 'Full name', render: (b) => <Link to={`/borrowers/${b.borrower_id}`}>{b.full_name}</Link> },
    { label: 'Contact', key: 'contact_number' },
    { label: 'Address', key: 'address' },
    { label: 'Valid ID', key: 'valid_id' },
    { label: 'Monthly income', render: (b) => peso(b.monthly_income) },
    { label: 'Registered', key: 'date_registered' }
  ]

  return (
    <Container>
      <PageHeader title="Borrowers" buttonLabel="Add borrower" onButtonClick={openAdd} />
      <DataTable
        columns={columns}
        rows={borrowers}
        rowKey="borrower_id"
        actions={(b) => (
          <>
            <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(b)}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(b.borrower_id)}>Delete</Button>
          </>
        )}
      />
      <FormModal
        show={show}
        title={editId ? 'Edit borrower' : 'Add borrower'}
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

export default Borrowers
