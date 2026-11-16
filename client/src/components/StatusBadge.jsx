import { Badge } from 'react-bootstrap'

const colors = {
  active: 'primary',
  paid: 'success',
  unpaid: 'warning',
  overdue: 'danger',
  defaulted: 'danger'
}

const StatusBadge = ({ status }) => {
  return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>
}

export default StatusBadge
