import React, { useState, useEffect } from 'react';
import './Settings.css';
import Modal from './Modal';

const LOCAL_PREFS = 'userPrefs';

const defaultPrefs = {
  theme: 'Oscuro',
  language: 'Español',
  currency: 'MXN',
};

const Settings = ({ user, setUser, registeredUsers, setRegisteredUsers }) => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [modal, setModal] = useState(null); // 'profile', 'password', '2fa'
  const [form, setForm] = useState({});

  // Proteger si user no está definido
  if (!user) {
    return (
      <div style={{ padding: '20px', color: 'white' }}>
        No hay datos de usuario para mostrar configuración.
      </div>
    );
  }

  useEffect(() => {
    const savedPrefs = localStorage.getItem(LOCAL_PREFS);
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_PREFS, JSON.stringify(prefs));
  }, [prefs]);

  // Editar perfil
  const openProfileModal = () => {
    setForm({ name: user.name || '', email: user.email || '' });
    setModal('profile');
  };
  const handleProfileSave = e => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Completa todos los campos');
      return;
    }
    setRegisteredUsers(users => users.map(u =>
      u.email === user.email ? { ...u, name: form.name, email: form.email } : u
    ));
    setUser(u => ({ ...u, name: form.name, email: form.email }));
    setModal(null);
  };

  // Cambiar contraseña
  const openPasswordModal = () => {
    setForm({ old: '', new1: '', new2: '' });
    setModal('password');
  };
  const handlePasswordSave = e => {
    e.preventDefault();
    if (form.old !== user.password) {
      alert('Contraseña actual incorrecta');
      return;
    }
    if (!form.new1 || form.new1.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.new1 !== form.new2) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    setRegisteredUsers(users => users.map(u =>
      u.email === user.email ? { ...u, password: form.new1 } : u
    ));
    setUser(u => ({ ...u, password: form.new1 }));
    setModal(null);
    alert('Contraseña cambiada con éxito');
  };

  // 2FA
  const toggle2FA = () => {
    setUser(u => ({ ...u, twoFA: !u.twoFA }));
    setRegisteredUsers(users => users.map(u =>
      u.email === user.email ? { ...u, twoFA: !u.twoFA } : u
    ));
  };

  // Preferencias
  const handlePref = (key, value) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="settings-container">
      <div className="main-section">
        <div className="header-row">
          <h1>Configuración</h1>
        </div>
        <div className="main-card">
          <main className="settings-content">
            <section className="section">
              <h2>Perfil de Usuario</h2>
              <div className="section-box">
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <button className="orange-btn" onClick={openProfileModal}>Editar perfil</button>
              </div>
            </section>

            <section className="section">
              <h2>Seguridad</h2>
              <div className="section-box column">
                <div className="row">
                  <span>Cambiar contraseña</span>
                  <button className="orange-btn small" onClick={openPasswordModal}>Cambiar</button>
                </div>
                <div className="row">
                  <span>Autenticación de dos factores</span>
                  <button className="orange-btn small" onClick={toggle2FA}>
                    {user.twoFA ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </section>

            <section className="section">
              <h2>Preferencias de aplicación</h2>
              <div className="section-box column">
                <div className="row">
                  <span>Tema</span>
                  <button className="selector-btn" onClick={() => handlePref('theme', prefs.theme === 'Oscuro' ? 'Claro' : 'Oscuro')}>
                    {prefs.theme} ▸
                  </button>
                </div>
                <div className="row">
                  <span>Idioma</span>
                  <button className="selector-btn" onClick={() => handlePref('language', prefs.language === 'Español' ? 'English' : 'Español')}>
                    {prefs.language} ▸
                  </button>
                </div>
                <div className="row">
                  <span>Moneda</span>
                  <div className="currency-options">
                    {['MXN','USD','EUR'].map(cur => (
                      <button
                        key={cur}
                        className={`currency${prefs.currency === cur ? ' selected' : ''}`}
                        onClick={() => handlePref('currency', cur)}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <h2>Privacidad</h2>
              <div className="section-box">
                <span>🔘</span>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={modal==='profile'} onClose={()=>setModal(null)} title="Editar perfil">
        <form onSubmit={handleProfileSave} className="modal-form">
          <input name="name" type="text" placeholder="Nombre" value={form.name||''} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Correo" value={form.email||''} onChange={handleChange} required />
          <button type="submit" className="orange-btn" style={{width:'100%'}}>Guardar</button>
        </form>
      </Modal>
      <Modal isOpen={modal==='password'} onClose={()=>setModal(null)} title="Cambiar contraseña">
        <form onSubmit={handlePasswordSave} className="modal-form">
          <input name="old" type="password" placeholder="Contraseña actual" value={form.old||''} onChange={handleChange} required />
          <input name="new1" type="password" placeholder="Nueva contraseña" value={form.new1||''} onChange={handleChange} required />
          <input name="new2" type="password" placeholder="Repetir nueva contraseña" value={form.new2||''} onChange={handleChange} required />
          <button type="submit" className="orange-btn" style={{width:'100%'}}>Guardar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
