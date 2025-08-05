import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Transactions from './components/Transactions'
import Settings from './components/Settings'
import Budget from './components/Budget'
import {create} from "./services/user.service";
import {login} from "./services/auth.service";
import {MySwal} from "./constants/mySwal";

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [registeredUsers, setRegisteredUsers] = useState([])

  // Cargar usuarios registrados desde localStorage al iniciar
  // useEffect(() => {
  //   const savedUsers = localStorage.getItem('registeredUsers')
  //   if (savedUsers) {
  //     setRegisteredUsers(JSON.parse(savedUsers))
  //   }
  // }, [])

  // Guardar usuarios en localStorage cada vez que cambien
  // useEffect(() => {
  //   localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
  // }, [registeredUsers])

  const handleLogin = async (userData) => {
    console.log('Attempting login with:', userData)
  
    try {
      const results = await login(userData);

      if (results.status !== 200) {
        await MySwal.fire({
          title: 'Opps...',
          text: 'Algo salió mal, revise sus credenciales',
          icon: 'error',
        });
        return;
      }

      setCurrentPage('transactions');
      } catch (error) {
          await MySwal.fire({
            title: 'Error',
            text: 'Error al iniciar sesión. Intenta más tarde.',
            icon: 'error',
          });
          console.error(error);
    }

  
    console.log('Login successful!')
    setIsLoggedIn(true)
  }

  const handleRegister = async (userData) => {
    console.log('Attempting registration with:', userData);

    try {
      const results = await create(userData);

      if (results.status !== 200) {
        await MySwal.fire({
          title: 'Opps...',
          text: 'Algo salió mal',
          icon: 'error',
        });
        return;
      }

      await MySwal.fire({
        title: 'Usuario Guardado Exitosamente',
        icon: 'success',
      });

      setCurrentPage('login');
      } catch (error) {
          await MySwal.fire({
            title: 'Error',
            text: 'No se pudo guardar el usuario. Intenta más tarde.',
            icon: 'error',
          });
          console.error(error);
    }
    // console.log('Registration successful! Redirecting to login...')
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
