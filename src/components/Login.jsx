import React, { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.jpeg';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí normalmente harías una llamada a la API
    // Por ahora simulamos un login exitoso
    onLogin({
      email: formData.email,
      password: formData.password,
      name: 'Usuario Demo'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="logo" />

      <input
        type="text"
          name="email"
        placeholder="Ingresa tu usuario o correo electronico"
        className="input-field"
          value={formData.email}
          onChange={handleChange}
          required
      />
      <input
        type="password"
          name="password"
        placeholder="Contraseña"
        className="input-field"
          value={formData.password}
          onChange={handleChange}
          required
      />

        <button className="login-button" onClick={handleSubmit}>Iniciar Sesión</button>

        <a href="#" className="create-account-link" onClick={onSwitchToRegister}>
        Crear cuenta nueva
      </a>
      </div>
    </div>
  );
};

export default Login;
