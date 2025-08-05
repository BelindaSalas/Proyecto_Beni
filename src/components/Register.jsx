import { useState } from 'react';
import {LuLoaderCircle} from "react-icons/lu";
import './Register.css';


const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [btnDisabled, setBtnDisabled] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Desestructurar campo name del formulario y crear un objeto con los datos a
    // enviar a la API
    const [nombre, apellidos] = formData.name.split(" ");

    const data = {
      email: formData.email,
      password: formData.password,
      nombre: nombre,
      apellidos: apellidos,
    }

    setBtnDisabled(true);
    onRegister(data);
    setBtnDisabled(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Crear nueva cuenta</h1>

      <form className="register-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name"
          placeholder="Nombre" 
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input 
          type="email" 
          name="email"
          placeholder="Ingresa tu correo electrónico" 
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input 
          type="password" 
          name="password"
          placeholder="Contraseña" 
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="Confirmar contraseña" 
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={btnDisabled} >
          {btnDisabled ? <LuLoaderCircle className='spinner' /> : <span>Registrarse</span>}
        </button>
      </form>

      <p className="register-login">
        ¿Ya tienes cuenta?{' '}
        <a href="#" onClick={onSwitchToLogin}>Iniciar sesión</a>
      </p>
    </div>
  );
};

export default Register; 