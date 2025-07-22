import React, { useState, useEffect, useRef } from 'react';
import './Transactions.css';
import Modal from './Modal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const getKey = (email) => `transactions_${email}`;

const defaultTransactions = [
  { name: 'Salario', date: '2024-04-22', amount: '+3000', type: 'income' },
  { name: 'Alquiler', date: '2024-04-22', amount: '-1200', type: 'expense' },
  { name: 'Supermercado', date: '2024-04-21', amount: '-150', type: 'expense' },
  { name: 'Restaurante', date: '2024-04-21', amount: '-45', type: 'expense' },
  { name: 'Independiente', date: '2024-04-20', amount: '+600', type: 'income' },
  { name: 'Transporte', date: '2024-04-20', amount: '-25', type: 'expense' },
];

function parseAmount(str) {
  let s = str.replace(/[^\d,.-]/g, '');
  s = s.replace(',', '.');
  return parseFloat(s);
}

const Transactions = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    amount: '',
    type: 'income',
  });
  const loadedUser = useRef(null);
  const loadedFlag = useRef(false);

  // Load transactions for the current user only once per user
  useEffect(() => {
    if (!user || !user.email) return;
    const key = getKey(user.email);
    const saved = localStorage.getItem(key);
    if (!loadedFlag.current || loadedUser.current !== user.email) {
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        setTransactions(defaultTransactions);
        localStorage.setItem(key, JSON.stringify(defaultTransactions));
      }
      loadedUser.current = user.email;
      loadedFlag.current = true;
    }
  }, [user && user.email]);

  // Save transactions for the current user
  useEffect(() => {
    if (!user || !user.email) return;
    if (!loadedFlag.current || loadedUser.current !== user.email) return; // Only save if loaded
    const key = getKey(user.email);
    localStorage.setItem(key, JSON.stringify(transactions));
  }, [transactions, user && user.email]);

  const openModal = () => {
    setForm({ name: '', date: '', amount: '', type: 'income' });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.date || !form.amount) {
      alert('Completa todos los campos');
      return;
    }
    let amount = form.amount;
    if (!amount.startsWith('+') && !amount.startsWith('-')) {
      amount = (form.type === 'income' ? '+' : '-') + amount;
    }
    setTransactions([
      { ...form, amount, type: form.type },
      ...transactions,
    ]);
    setModalOpen(false);
  };

  // --- GRAFICA LINEAL DOBLE EJE Y ---
  // Agrupar por fecha y sumar ingresos/gastos
  const grouped = {};
  transactions.forEach(tx => {
    const date = tx.date;
    const amt = parseAmount(tx.amount);
    if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Gastos: 0 };
    if (tx.type === 'income') grouped[date].Ingresos += amt;
    if (tx.type === 'expense') grouped[date].Gastos += Math.abs(amt);
  });
  const chartData = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="transactions-container">
      <div className="main-section">
        <div className="header-row">
          <h1>Ingresos y Gastos</h1>
          <button className="add-button" onClick={openModal}>Añadir</button>
        </div>
        <div className="transaction-table-card" style={{padding: '2rem', minHeight: 400}}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis yAxisId="left" stroke="#00e676" tick={{ fill: '#00e676' }} label={{ value: 'Ingresos', angle: -90, position: 'insideLeft', fill: '#00e676', fontWeight: 700 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#ff3c7e" tick={{ fill: '#ff3c7e' }} label={{ value: 'Gastos', angle: 90, position: 'insideRight', fill: '#ff3c7e', fontWeight: 700 }} />
              <Tooltip formatter={(value, name) => [value, name]} labelStyle={{ color: '#222' }} />
              <Legend />
              <Line type="monotone" yAxisId="left" dataKey="Ingresos" stroke="#00e676" strokeWidth={3} dot={{ r: 6, fill: '#00e676' }} activeDot={{ r: 8 }} />
              <Line type="monotone" yAxisId="right" dataKey="Gastos" stroke="#ff3c7e" strokeWidth={3} dot={{ r: 6, fill: '#ff3c7e' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal} title="Añadir ingreso">
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="name" type="text" placeholder="Descripcion" value={form.name} onChange={handleChange} required />
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
          <input name="amount" type="text" placeholder="Cantidad $$$" value={form.amount} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
          <button type="submit" className="add-button" style={{width:'100%'}}>Guardar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions; 