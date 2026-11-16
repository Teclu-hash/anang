import { Modal, Form, Button, Alert } from 'react-bootstrap'

//fields = [{ name, label, type, options: [{ value, label }], required }]
const FormModal = ({ show, title, fields, values, onChange, onSave, onClose, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {fields.map((f) => (
            <Form.Group className="mb-3" key={f.name}>
              <Form.Label>{f.label}</Form.Label>
              {f.type === 'select' ? (
                <Form.Select
                  value={values[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => onChange(f.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Form.Select>
              ) : (
                <Form.Control
                  type={f.type || 'text'}
                  step={f.type === 'number' ? '0.01' : undefined}
                  value={values[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              )}
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default FormModal
