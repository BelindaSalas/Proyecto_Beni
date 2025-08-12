import { useState, useEffect, useRef } from 'react';
import './Transactions.css';
import { crearIngreso, getIngresosByUsuarioId } from "../services/ingreso.service";
import { crearGasto, getGastosByUsuarioId } from "../services/gasto.service";
import { MySwal } from "../constants/mySwal";
import Modal from './Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Label, ResponsiveContainer as ResponsiveContainerPie } from 'recharts';

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

const formatDate = (dateString) => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const [year, month, day] = dateString.split('-');
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} del ${year}`;
};

const Transactions = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', amount: '', type: 'income' });
  const loadedUser = useRef(null);
  const loadedFlag = useRef(false);

  const getData = async () => {
    try {
      const [ingresos, gastos] = await Promise.all([getIngresosByUsuarioId(), getGastosByUsuarioId()]);
      const ingresosArray = Array.from(ingresos).map(ingreso => {
        return {
          name: ingreso.descripcion,
          date: ingreso.fecha.split("T")[0],
          amount: `+${ingreso.monto}`,
          type: "income"
        };
      });
      const gastosArray = Array.from(gastos).map(gasto => {
        return {
          name: gasto.descripcion,
          date: gasto.fecha.split("T")[0],
          amount: `-${gasto.monto}`,
          type: "expense"
        };
      });
      setTransactions([...ingresosArray, ...gastosArray]);
    } catch (error) {
      console.error("Error al obtener los datos", error);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      const key = getKey(user.email);
      const savedTransactions = localStorage.getItem(key);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        getData(); // Si no hay datos guardados, carga desde la API
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      const key = getKey(user.email);
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const openModal = () => {
    setForm({ name: '', date: '', amount: '', type: 'income' });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.amount) {
      alert('Completa todos los campos');
      return;
    }
    let amount = form.amount;
    if (!amount.startsWith('+') && !amount.startsWith('-')) {
      amount = (form.type === 'income' ? '+' : '-') + amount;
    }
    const data = {
      monto: parseFloat(form.amount),
      descripcion: form.name,
      fecha: form.date
    };
    if (form.type === "income") {
      try {
        const results = await crearIngreso(data);
        if (results.status !== 200) {
          await MySwal.fire({
            title: 'Opps...',
            text: 'Algo salió mal.',
            icon: 'error',
          });
          return;
        }
        await MySwal.fire({
          title: 'Ingreso Guardado Exitosamente',
          icon: 'success',
        });
        setTransactions(prevTransactions => [
          ...prevTransactions,
          {
            name: form.name,
            date: form.date,
            amount: `+${form.amount}`,
            type: "income",
          }
        ]);
        setModalOpen(false);
      } catch (error) {
        await MySwal.fire({
          title: 'Error',
          text: 'Error al crear el ingreso. Intenta más tarde.',
          icon: 'error',
        });
        console.error(error);
      }
    } else if (form.type === "expense") {
      try {
        const results = await crearGasto(data);
        if (results.status !== 200) {
          await MySwal.fire({
            title: 'Opps...',
            text: 'Algo salió mal.',
            icon: 'error',
          });
          return;
        }
        await MySwal.fire({
          title: 'Gasto Guardado Exitosamente',
          icon: 'success',
        });
        setTransactions(prevTransactions => [
          ...prevTransactions,
          {
            name: form.name,
            date: form.date,
            amount: `-${form.amount}`,
            type: "expense",
          }
        ]);
        setModalOpen(false);
      } catch (error) {
        await MySwal.fire({
          title: 'Error',
          text: 'Error al crear el gasto. Intenta más tarde.',
          icon: 'error',
        });
        console.error(error);
      }
    }
  };

  const grouped = {};
  transactions.forEach(tx => {
    const date = tx.date;
    const amt = parseAmount(tx.amount);
    if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Gastos: 0, descripcion: '' };
    if (tx.type === 'income') {
      grouped[date].Ingresos += amt;
      grouped[date].descripcion = tx.name;
    }
    if (tx.type === 'expense') {
      grouped[date].Gastos += Math.abs(amt);
      grouped[date].descripcion = tx.name;
    }
  });

  const chartData = Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const saldoMensual = chartData.map(data => ({
    ...data,
    estado: data.Ingresos >= data.Gastos ? 'positivo' : 'negativo',
  }));

  const getMonthColor = (month) => {
    const colors = [
      '#5e3b07ff', '#03A9F4', '#4CAF50', '#FF5722', '#9C27B0', '#FF9800', '#795548', '#3F51B5', '#009688', '#E91E63', '#00BCD4', '#FF4081'
    ];
    return colors[month];
  };

  // Cálculo de totales
  const totalIngresos = saldoMensual.reduce((acc, curr) => acc + curr.Ingresos, 0);
  const totalGastos = saldoMensual.reduce((acc, curr) => acc + curr.Gastos, 0);
  const porcentajeGasto = totalIngresos === 0 ? 0 : (totalGastos / totalIngresos) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Ingresos y Gastos</h1>
      <button onClick={openModal}>Añadir</button>
      <div className="transaction-table-card" style={{ padding: '2rem', minHeight: 400, marginBottom: '2rem' }}>
        <ResponsiveContainer width="90%" height={400}>
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
      <div className="table-container">
        <h3>Informes Mensuales</h3>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {saldoMensual.map((data, index) => (
              <tr key={index}>
                <td>{data.descripcion}</td>
                <td style={{ backgroundColor: getMonthColor(new Date(data.date).getMonth()) }}>
                  {formatDate(data.date)}
                </td>
                <td>{data.Ingresos}</td>
                <td>{data.Gastos}</td>
                <td style={{ color: data.estado === 'positivo' ? 'green' : 'red' }}>
                  {data.estado === 'positivo' ? 'Positivo' : 'Negativo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Distribución de Ingresos y Gastos</h3>
        
        <ResponsiveContainerPie width="100%" height={200}>
      
        
          <PieChart>
            <Pie
              data={[
                { name: 'Gastos', value: totalGastos },
                { name: 'Disponible', value: totalIngresos - totalGastos }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              label
            >
              <Cell fill="#FF3C7E" />
              <Cell fill="#00E676" />
            </Pie>
          </PieChart>
        </ResponsiveContainerPie>

        {/* Chips/Badges con colores de la gráfica */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00E676', color: '#fff', padding: '8px 12px', borderRadius: 12, fontWeight: 700 }}>
            <span>Ingresos Disponibles</span>
            
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FF3C7E', color: '#fff', padding: '8px 12px', borderRadius: 12, fontWeight: 700 }}>
            <span>Total Gastos</span>
           
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title="Añadir ingreso">
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="name" type="text" placeholder="Descripción" value={form.name} onChange={handleChange} required />
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
          <input name="amount" type="number" placeholder="Cantidad $$$" value={form.amount} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
          <button type="submit" className="add-button" style={{ width: '100%' }}>Guardar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;