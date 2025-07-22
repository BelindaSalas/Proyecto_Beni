import React, { useState, useEffect, useRef } from 'react';
import './Budget.css';
import Modal from './Modal';

const getKey = (email) => `transactions_${email}`;
const getGoalsKey = (email) => `goals_${email}`;

function parseAmount(str) {
  let s = str.replace(/[^\d,.-]/g, '');
  s = s.replace(',', '.');
  return parseFloat(s);
}

const Budget = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '' });
  const [editGoalIdx, setEditGoalIdx] = useState(null);

  // Bandera para evitar recarga múltiple de metas
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

  // Guardar metas
  useEffect(() => {
    if (!user || !user.email) return;
    if (!loadedFlag.current || loadedUser.current !== user.email) return;
    localStorage.setItem(getGoalsKey(user.email), JSON.stringify(goals));
  }, [goals, user && user.email]);

  // Apartados/metas
  const openGoalModal = (idx = null) => {
    if (idx !== null) {
      setGoalForm(goals[idx]);
      setEditGoalIdx(idx);
    } else {
      setGoalForm({ name: '', target: '', saved: '' });
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
    const { name, target, saved } = goalForm;
    if (!name || !target || Number(target) <= 0) {
      alert('Completa todos los campos y pon un objetivo válido');
      return;
    }
    const newGoal = {
      name,
      target: Number(target),
      saved: Number(saved) || 0,
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

  // Suma de lo apartado
  const totalApartado = goals.reduce((sum, g) => sum + (g.saved || 0), 0);
  const presupuestoDisponible = budget - totalApartado;

  return (
    <div className="budget-container">
      <div className="main-section">
        <div className="header-row">
          <h1 className="budget-title">Presupuesto</h1>
        </div>
        <div className="main-card">
          <h2 className="budget-subtitle">Presupuesto total:</h2>
          <div className="budget-amount">${budget}</div>
          <h2 className="budget-subtitle">Disponible:</h2>
          <div className="budget-amount" style={{color:'#ffa726'}}>${presupuestoDisponible}</div>
        </div>
        <div className="goals-section">
          <div className="goals-header-row">
            <h2 className="budget-subtitle">Apartados / Metas</h2>
            <button className="budget-btn" onClick={() => openGoalModal()}>+ Añadir apartado</button>
          </div>
          <div className="goals-list">
            {goals.length === 0 && <div style={{color:'#aaa',margin:'2rem'}}>No tienes apartados aún.</div>}
            {goals.map((g, idx) => (
              <div className="goal-card" key={idx}>
                <div className="goal-header">
                  <span className="goal-name">{g.name}</span>
                  <span className="goal-actions">
                    <button className="goal-edit-btn" onClick={() => openGoalModal(idx)}>Editar</button>
                    <button className="goal-delete-btn" onClick={() => handleDeleteGoal(idx)}>Eliminar</button>
                  </span>
                </div>
                <div className="goal-progress-row">
                  <div className="goal-progress-bar-bg">
                    <div className="goal-progress-bar" style={{width: `${Math.min(100, (g.saved/g.target)*100)}%`}}></div>
                  </div>
                  <span className="goal-progress-label">${g.saved} / ${g.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal apartado/meta */}
      <Modal isOpen={goalModalOpen} onClose={closeGoalModal} title={editGoalIdx !== null ? "Editar apartado/meta" : "Nuevo apartado/meta"}>
        <form onSubmit={handleGoalSubmit} className="modal-form">
          <label style={{alignSelf:'flex-start', color:'#bfc8e2', fontWeight:600, marginBottom:2}}>Nombre del apartado/meta</label>
          <input name="name" type="text" placeholder="Ej: Viaje, Laptop, Ahorro" value={goalForm.name} onChange={handleGoalChange} required />
          <label style={{alignSelf:'flex-start', color:'#bfc8e2', fontWeight:600, marginBottom:2}}>Cantidad objetivo</label>
          <input name="target" type="number" min="1" placeholder="¿Cuánto quieres ahorrar?" value={goalForm.target} onChange={handleGoalChange} required />
          <label style={{alignSelf:'flex-start', color:'#bfc8e2', fontWeight:600, marginBottom:2}}>Ahorrado hasta ahora</label>
          <input name="saved" type="number" min="0" placeholder="¿Cuánto llevas ahorrado?" value={goalForm.saved} onChange={handleGoalChange} required />
          <button type="submit" className="budget-btn" style={{width:'100%'}}>Guardar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Budget; 