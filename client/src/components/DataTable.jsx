import { Table } from 'react-bootstrap'

//columns = [{ label, key, render(row) }]  actions = (row) => buttons
const DataTable = ({ columns, rows, rowKey, actions }) => {
  const colSpan = columns.length + (actions ? 1 : 0)

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map((c) => <th key={c.label}>{c.label}</th>)}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={colSpan} className="text-center text-muted">No records found</td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row[rowKey]}>
            {columns.map((c) => <td key={c.label}>{c.render ? c.render(row) : row[c.key]}</td>)}
            {actions && <td className="text-nowrap">{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default DataTable
