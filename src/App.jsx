import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Transactions from './components/Transactions'
import Settings from './components/Settings'
import Budget from './components/Budget'
import { create } from "./services/user.service";
import { login } from "./services/auth.service";
import { MySwal } from "./constants/mySwal";

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [registeredUsers, setRegisteredUsers] = useState([])

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

      // Guardar usuario con valores por defecto para evitar undefined
      const userObj = {
        ...results.data,
        password: results.data?.password || '',
        twoFA: results.data?.twoFA || false
      };
      setUser(userObj);

      setIsLoggedIn(true);
      setCurrentPage('transactions');

    } catch (error) {
      await MySwal.fire({
        title: 'Error',
        text: 'Error al iniciar sesión. Intenta más tarde.',
        icon: 'error',
      });
      console.error(error);
    }
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
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setCurrentPage('login')
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

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

  return (
    <div className="App">
      <nav className="top-navbar desktop-navbar">
        <div className="nav-left">
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
        {currentPage === 'settings' && (
          <Settings 
            user={user} 
            setUser={setUser} 
            registeredUsers={registeredUsers} 
            setRegisteredUsers={setRegisteredUsers} 
          />
        )}
      </div>
    </div>
  )
}

export default App
