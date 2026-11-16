import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { NavLink } from 'react-router'

const NavBar = ({ user, onLogout }) => {
  const isAdmin = String(user?.role).toLowerCase() === 'admin'

  return (
    <Navbar bg="dark" variant="dark" expand="md" className="mb-4">
      <Container>
        <Navbar.Brand>Credit</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {isAdmin && <Nav.Link as={NavLink} to="/" end>Dashboard</Nav.Link>}
            <Nav.Link as={NavLink} to="/borrowers">Borrowers</Nav.Link>
            <Nav.Link as={NavLink} to="/loans">Loans</Nav.Link>
            <Nav.Link as={NavLink} to="/payments">Payments</Nav.Link>
            <Nav.Link as={NavLink} to="/penalties">Penalties</Nav.Link>
            {isAdmin && <Nav.Link as={NavLink} to="/users">Users</Nav.Link>}
            {isAdmin && <Nav.Link as={NavLink} to="/settings">Settings</Nav.Link>}
          </Nav>
          <Navbar.Text className="me-3">{user.full_name} ({user.role})</Navbar.Text>
          <Button variant="outline-light" size="sm" onClick={onLogout}>Logout</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
