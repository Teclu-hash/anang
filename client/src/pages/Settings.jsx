import { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../api'

//admin only: sets the interest rate used for every new loan
const Settings = ({ user }) => {
  const [form, setForm] = useState({ interest_rate: '', interest_type: 'simple' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/setting')
      .then((res) => setForm({
        interest_rate: res.data.interest_rate ?? '',
        interest_type: res.data.interest_type || 'simple'
      }))
      .catch((err) => console.log(err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.put('/setting', { ...form, user_id: user.user_id })
      setMessage('Interest rate saved. It applies to new loans only.')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <Container>
      <h3 className="mb-3">Settings</h3>
      <Card style={{ maxWidth: 480 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Interest rate (% per month)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                required
                value={form.interest_rate}
                onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Interest type</Form.Label>
              <Form.Select
                value={form.interest_type}
                onChange={(e) => setForm({ ...form, interest_type: e.target.value })}
              >
                <option value="simple">simple</option>
                <option value="compound">compound</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit">Save</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Settings
