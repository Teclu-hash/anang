import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../api'

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'staff' })
  const [error, setError] = useState('')

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await api.post('/user/new', form)
      }
      const res = await api.post('/user/login', { username: form.username, password: form.password })
      onLogin(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot connect to the server')
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '24rem' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Credit</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {isRegister && (
              <Form.Group className="mb-3">
                <Form.Label>Full name</Form.Label>
                <Form.Control required value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control required value={form.username} onChange={(e) => handleChange('username', e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
            </Form.Group>
            {isRegister && (
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </Form.Select>
              </Form.Group>
            )}
            <Button type="submit" className="w-100 mb-2">{isRegister ? 'Create account' : 'Login'}</Button>
            <Button variant="link" className="w-100" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Back to login' : 'Create an account'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Login
