import { useState, useEffect } from 'react'
import { Container, Button, Card, Row, Col } from 'react-bootstrap'
import { useParams, Link } from 'react-router'
import api from '../api'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import StatusBadge from '../components/StatusBadge'
import { peso } from '../utils'

const emptyForm = { reference_name: '', relationship: '', contact_number: '', address: '' }

const fields = [
  { name: 'reference_name', label: 'Reference name', required: true },
  { name: 'relationship', label: 'Relationship', required: true },
  { name: 'contact_number', label: 'Contact number', required: true },
  { name: 'address', label: 'Address', required: true }
]

const BorrowerDetails = () => {
  const { id } = useParams()
  const [borrower, setBorrower] = useState(null)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const getBorrower = async () => {
    try {
      const res = await api.get(`/borrower/${id}`)
      setBorrower(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get(`/borrower/${id}`)
      .then((res) => setBorrower(res.data))
      .catch((error) => console.log(error))
  }, [id])

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setError('')
    setShow(true)
  }

  const openEdit = (r) => {
    setForm(r)
    setEditId(r.reference_id)
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/borrower-reference/${editId}`, form)
      } else {
        await api.post('/borrower-reference/new', { ...form, borrower_id: id })
      }
      setShow(false)
      getBorrower()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (refId) => {
    if (!window.confirm('Delete this reference?')) return
    try {
      await api.delete(`/borrower-reference/${refId}`)
      getBorrower()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  if (!borrower) {
    return <Container>Loading...</Container>
  }

  const referenceColumns = [
    { label: 'Name', key: 'reference_name' },
    { label: 'Relationship', key: 'relationship' },
    { label: 'Contact', key: 'contact_number' },
    { label: 'Address', key: 'address' }
  ]

  const loanColumns = [
    { label: 'Loan #', render: (l) => <Link to={`/loans/${l.loan_id}`}>{l.loan_id}</Link> },
    { label: 'Principal', render: (l) => peso(l.principal_amount) },
    { label: 'Total', render: (l) => peso(l.total_amount) },
    { label: 'Balance', render: (l) => peso(l.remaining_balance) },
    { label: 'Due date', key: 'due_date' },
    { label: 'Status', render: (l) => <StatusBadge status={l.loan_status} /> }
  ]

  return (
    <Container>
      <Link to="/borrowers">&larr; Back to borrowers</Link>
      <h3 className="my-3">{borrower.full_name}</h3>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}><strong>Contact:</strong> {borrower.contact_number}</Col>
            <Col md={6}><strong>Address:</strong> {borrower.address}</Col>
            <Col md={6}><strong>Valid ID:</strong> {borrower.valid_id}</Col>
            <Col md={6}><strong>Monthly income:</strong> {peso(borrower.monthly_income)}</Col>
            <Col md={6}><strong>Registered:</strong> {borrower.date_registered}</Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">References</h5>
        <Button size="sm" onClick={openAdd}>Add reference</Button>
      </div>
      <DataTable
        columns={referenceColumns}
        rows={borrower.BorrowerReferences || []}
        rowKey="reference_id"
        actions={(r) => (
          <>
            <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(r)}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.reference_id)}>Delete</Button>
          </>
        )}
      />

      <h5 className="mt-4">Loans</h5>
      <DataTable columns={loanColumns} rows={borrower.Loans || []} rowKey="loan_id" />

      <FormModal
        show={show}
        title={editId ? 'Edit reference' : 'Add reference'}
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

export default BorrowerDetails
