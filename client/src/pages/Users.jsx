import { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'
import api from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const emptyForm = { username: '', password: '', full_name: '', role: 'staff' }

const Users = () => {
  const [users, setUsers] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const getUsers = async () => {
    try {
      const res = await api.get('/user')
      setUsers(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    api.get('/user')
      .then((res) => setUsers(res.data))
      .catch((error) => console.log(error))
  }, [])

  //password is optional when editing (blank = keep old password)
  const fields = [
    { name: 'full_name', label: 'Full name', required: true },
    { name: 'username', label: 'Username', required: true },
    { name: 'password', label: editId ? 'New password (leave blank to keep)' : 'Password', type: 'password', required: !editId },
    { name: 'role', label: 'Role', type: 'select', required: true,
      options: [{ value: 'staff', label: 'staff' }, { value: 'admin', label: 'admin' }] }
  ]

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setError('')
    setShow(true)
  }

  const openEdit = (u) => {
    setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role })
    setEditId(u.user_id)
    setError('')
    setShow(true)
  }

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/user/${editId}`, form)
      } else {
        await api.post('/user/new', form)
      }
      setShow(false)
      getUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/user/${id}`)
      getUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const columns = [
    { label: 'ID', key: 'user_id' },
    { label: 'Full name', key: 'full_name' },
    { label: 'Username', key: 'username' },
    { label: 'Role', key: 'role' }
  ]

  return (
    <Container>
      <PageHeader title="Users" buttonLabel="Add user" onButtonClick={openAdd} />
      <DataTable
        columns={columns}
        rows={users}
        rowKey="user_id"
        actions={(u) => (
          <>
            <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(u)}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(u.user_id)}>Delete</Button>
          </>
        )}
      />
      <FormModal
        show={show}
        title={editId ? 'Edit user' : 'Add user'}
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

export default Users
