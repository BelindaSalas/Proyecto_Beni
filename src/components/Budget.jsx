import React, { useState, useEffect, useRef } from 'react';
import './Budget.css';
import Modal from './Modal';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaLaptop, FaPlane, FaPiggyBank, FaSuitcase, FaQuestion } from 'react-icons/fa';

const getKey = (email) => `transactions_${email}`;
const getGoalsKey = (email) => `goals_${email}`;

function parseAmount(str) {
  let s = str.replace(/[^\d,.-]/g, '');
  s = s.replace(',', '.');
  return parseFloat(s);
}

// Iconos para metas
const goalIcons = {
  laptop: <FaLaptop size={32} color="#43ea7c" />,
  viaje: <FaPlane size={32} color="#ffa726" />,
  vacaciones: <FaSuitcase size={32} color="#ffa726" />,
  ahorro: <FaPiggyBank size={32} color="#43ea7c" />,
  default: <FaQuestion size={32} color="#bfc8e2" />,
};

function getGoalIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('laptop')) return goalIcons.laptop;
  if (n.includes('viaje')) return goalIcons.viaje;
  if (n.includes('vacaciones')) return goalIcons.vacaciones;
  if (n.includes('ahorro')) return goalIcons.ahorro;
  return goalIcons.default;
}

const Budget = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '', description: '' });
  const [editGoalIdx, setEditGoalIdx] = useState(null);

  const loadedUser = useRef(null);
  const loadedFlag = useRef(false);

  // Cargar transacciones y metas por usuario solo una vez por usuario
  useEffect(() => {
    if (!user || !user.email) return;
    const t = localStorage.getItem(getKey(user.email));
    setTransactions(t ? JSON.parse(t) : []);
    if (!loadedFlag.current || loadedUser.current !== user.email) {
      const g = localStorage.getItem(getGoalsKey(user.email));
      setGoals(g ? JSON.parse(g) : []);
      loadedUser.current = user.email;
      loadedFlag.current = true;
    }
  }, [user && user.email]);

  useEffect(() => {
    if (!user || !user.email) return;
    if (!loadedFlag.current || loadedUser.current !== user.email) return;
    localStorage.setItem(getGoalsKey(user.email), JSON.stringify(goals));
  }, [goals, user && user.email]);

  const openGoalModal = (idx = null) => {
    if (idx !== null) {
      setGoalForm(goals[idx]);
      setEditGoalIdx(idx);
    } else {
      setGoalForm({ name: '', target: '', saved: '', description: '' });
      setEditGoalIdx(null);
    }
    setGoalModalOpen(true);
  };

  const closeGoalModal = () => setGoalModalOpen(false);

  const handleGoalChange = e => {
    const { name, value } = e.target;
    setGoalForm(f => ({ ...f, [name]: value }));
  };

  const handleGoalSubmit = e => {
    e.preventDefault();
    const { name, target, saved, description } = goalForm;
    if (!name || !target || Number(target) <= 0) {
      alert('Completa todos los campos y pon un objetivo válido');
      return;
    }
    const newGoal = {
      name,
      target: Number(target),
      saved: Number(saved) || 0,
      description: description || '',
    };
    if (editGoalIdx !== null) {
      setGoals(goals.map((g, i) => (i === editGoalIdx ? newGoal : g)));
    } else {
      setGoals([...goals, newGoal]);
    }
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = idx => {
    if (window.confirm('¿Eliminar este apartado/meta?')) {
      setGoals(goals.filter((_, i) => i !== idx));
    }
  };

  // Calcular presupuesto total (ingresos - gastos)
  const sumaIngresos = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + parseAmount(tx.amount), 0);
  const sumaGastos = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(parseAmount(tx.amount)), 0);
  const budget = sumaIngresos - sumaGastos;

  // Suma de lo apartado de todas las metas
  const totalApartado = goals.reduce((sum, g) => sum + (g.saved || 0), 0);
  const presupuestoDisponible = budget - totalApartado;

  // Progreso de presupuesto
  const gastoProgreso = sumaIngresos > 0 ? Math.min(100, (sumaGastos / sumaIngresos) * 100) : 0;
  const presupuestoColor = presupuestoDisponible >= 0 ? '#43ea7c' : '#ff5252'; // Cambié el color para mostrar positivo cuando es ahorrado

  return (
    <div className="budget-container">
      <div className="main-section">
        <div className="header-row">
          <h1 className="budget-title">Ahorro total acumulado</h1>
        </div>
        <div className="main-card">
          <h2 className="budget-subtitle">Ahorro total acumulado:</h2>
          <div className="budget-amount">${totalApartado}</div>
          <div className="budget-progress-bar-bg">
            <div
              className="budget-progress-bar"
              style={{
                width: `${gastoProgreso}%`,
                background: presupuestoColor,
                transition: 'width 0.5s'
              }}
            ></div>
          </div>
          <div style={{ color: '#bfc8e2', fontSize: '0.95rem', marginTop: 4 }}>
            El dinero disponible se ajusta conforme ahorras.
          </div>
        </div>
        <div className="goals-section">
          <div className="goals-header-row">
            <h2 className="budget-subtitle">Apartados / Metas</h2>
            <button
              className="budget-btn"
              style={{
                fontSize: '1.1rem',
                background: '#43ea7c',
                color: '#fff',
                padding: '0.8rem 2rem',
                borderRadius: 8,
                fontWeight: 700
              }}
              onClick={() => openGoalModal()}
            >
              ¡Comienza a ahorrar para tu meta!
            </button>
          </div>
          <div style={{ color: '#bfc8e2', fontSize: '0.95rem', marginBottom: 8 }}>
            Cada apartado representa una meta a la que estás ahorrando.
          </div>
          <div className="goals-list">
            {goals.length === 0 && (
              <div style={{ color: '#aaa', margin: '2rem', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '1.1rem' }}>
                No tienes apartados aún. <br /> ¡Crea tu primer objetivo de ahorro!
              </div>
            )}
            {goals.map((g, idx) => {
              const progress = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
              const falta = Math.max(0, g.target - g.saved);
              return (
                <div className="goal-card" key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>{getGoalIcon(g.name)}</div>
                  <div style={{ width: 70, height: 70 }}>
                    <CircularProgressbar
                      value={progress}
                      text={`${Math.round(progress)}%`}
                      styles={buildStyles({
                        pathColor: progress >= 100 ? '#43ea7c' : '#ffa726',
                        textColor: '#222',
                        trailColor: '#eee',
                        backgroundColor: '#fff',
                      })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: '0.98rem', color: '#bfc8e2', fontFamily: 'Roboto, Arial, sans-serif' }}>
                      Meta: ${g.target}. Ahorrado: ${g.saved}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: falta > 0 ? '#ffa726' : '#43ea7c', marginTop: 2 }}>
                      {falta > 0
                        ? `¡Vas muy bien, solo te falta $${falta} para tu meta!`
                        : '¡Meta alcanzada! 🎉'}
                    </div>
                    {g.description && (
                      <div style={{ fontSize: '0.92rem', color: '#43ea7c', marginTop: 2 }}>
                        {g.description}
                      </div>
                    )}
                  </div>
                  <span className="goal-actions">
                    <button className="goal-edit-btn" onClick={() => openGoalModal(idx)}>Editar</button>
                    <button className="goal-delete-btn" onClick={() => handleDeleteGoal(idx)}>Eliminar</button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Modal apartado/meta */}
      <Modal isOpen={goalModalOpen} onClose={closeGoalModal} title={editGoalIdx !== null ? "Editar apartado/meta" : "Nuevo apartado/meta"}>
        <form onSubmit={handleGoalSubmit} className="modal-form">
          <label style={{ alignSelf: 'flex-start', color: '#bfc8e2', fontWeight: 600, marginBottom: 2 }}>Nombre del apartado/meta</label>
          <input name="name" type="text" placeholder="Ej: Viaje, Laptop, Ahorro" value={goalForm.name} onChange={handleGoalChange} required />
          <label style={{ alignSelf: 'flex-start', color: '#bfc8e2', fontWeight: 600, marginBottom: 2 }}>Cantidad objetivo</label>
          <input name="target" type="number" min="1" placeholder="¿Cuánto quieres ahorrar?" value={goalForm.target} onChange={handleGoalChange} required />
          <label style={{ alignSelf: 'flex-start', color: '#bfc8e2', fontWeight: 600, marginBottom: 2 }}>Ahorrado hasta ahora</label>
          <input name="saved" type="number" min="0" placeholder="¿Cuánto llevas ahorrado?" value={goalForm.saved} onChange={handleGoalChange} required />
          <label style={{ alignSelf: 'flex-start', color: '#bfc8e2', fontWeight: 600, marginBottom: 2 }}>Descripción breve</label>
          <input name="description" type="text" placeholder="¿Para qué es esta meta?" value={goalForm.description} onChange={handleGoalChange} />
          <button type="submit" className="budget-btn" style={{ width: '100%', background: '#43ea7c', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>¡Comienza ahora!</button>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;