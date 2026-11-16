import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Borrowers from './pages/Borrowers'
import BorrowerDetails from './pages/BorrowerDetails'
import Loans from './pages/Loans'
import LoanDetails from './pages/LoanDetails'
import Payments from './pages/Payments'
import Penalties from './pages/Penalties'
import Users from './pages/Users'
import Settings from './pages/Settings'

function App() {
  //logged in user is kept in localStorage so refresh will not log out
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  const handleLogin = (data) => {
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  //not logged in, only the login page
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const isAdmin = String(user.role).toLowerCase() === 'admin'
  const homePath = isAdmin ? '/' : '/borrowers'

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/borrowers" replace />} />
        <Route path="/borrowers" element={<Borrowers />} />
        <Route path="/borrowers/:id" element={<BorrowerDetails />} />
        <Route path="/loans" element={<Loans user={user} />} />
        <Route path="/loans/:id" element={<LoanDetails user={user} />} />
        <Route path="/payments" element={<Payments user={user} />} />
        <Route path="/penalties" element={<Penalties />} />
        <Route path="/settings" element={isAdmin ? <Settings user={user} /> : <Navigate to="/borrowers" replace />} />
        <Route path="/users" element={isAdmin ? <Users /> : <Navigate to="/borrowers" replace />} />
        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
    </>
  )
}

export default App
