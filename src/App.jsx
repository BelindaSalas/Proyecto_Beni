import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Transactions from './components/Transactions'
import Settings from './components/Settings'
import Budget from './components/Budget'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [registeredUsers, setRegisteredUsers] = useState([])

  // Cargar usuarios registrados desde localStorage al iniciar
  useEffect(() => {
    const savedUsers = localStorage.getItem('registeredUsers')
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers))
    }
  }, [])

  // Guardar usuarios en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  const handleLogin = (userData) => {
    console.log('Attempting login with:', userData)
    console.log('Registered users:', registeredUsers)
    
    // Verificar si el usuario está registrado
    const userExists = registeredUsers.find(user => user.email === userData.email)
    
    if (!userExists) {
      alert('Debes registrarte primero antes de iniciar sesión')
      return
    }
    
    // Verificar que la contraseña coincida
    if (userExists.password !== userData.password) {
      alert('Contraseña incorrecta')
      return
    }
    
    console.log('Login successful!')
    setIsLoggedIn(true)
    setUser(userExists)
    setCurrentPage('transactions')
  }

  const handleRegister = (userData) => {
    console.log('Attempting registration with:', userData)
    console.log('Current registered users:', registeredUsers)
    
    // Verificar si el usuario ya existe
    const userExists = registeredUsers.find(user => user.email === userData.email)
    
    if (userExists) {
      alert('Este email ya está registrado')
      return
    }
    
    // Agregar el nuevo usuario a la lista
    const newUser = {
      name: userData.name,
      email: userData.email,
      password: userData.password
    }
    
    console.log('Adding new user:', newUser)
    setRegisteredUsers(prevUsers => [...prevUsers, newUser])
    
    // Mostrar mensaje de éxito y redirigir al login
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
    setCurrentPage('login')
    console.log('Registration successful! Redirecting to login...')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setCurrentPage('login')
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  // Si no está logueado, mostrar login o registro
  if (!isLoggedIn) {
    return (
      <div className="App">
        {currentPage === 'login' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        ) : (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
      </div>
    )
  }

  // Si está logueado, mostrar la aplicación principal con navbar arriba
  return (
    <div className="App">
      <nav className="top-navbar desktop-navbar">
        <div className="nav-left">
          <button 
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('transactions')}
          >
            <span role="img" aria-label="home">🏠</span> Hogar
          </button>
          <button 
            className={`nav-btn ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => navigateTo('transactions')}
          >
            <span role="img" aria-label="transacciones">📄</span> Ingresos
          </button>
          <button 
            className={`nav-btn ${currentPage === 'budget' ? 'active' : ''}`}
            onClick={() => navigateTo('budget')}
          >
            <span role="img" aria-label="presupuesto">📊</span> Presupuesto
          </button>
          <button 
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => navigateTo('settings')}
          >
            <span role="img" aria-label="configuracion">⚙️</span> Configuración
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <div className="main-content">
        {currentPage === 'transactions' && <Transactions user={user} />}
        {currentPage === 'budget' && <Budget user={user} />}
        {currentPage === 'settings' && <Settings user={user} setUser={setUser} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} />}
      </div>
    </div>
  )
}

export default App
