import React, { useEffect, useRef, useState } from 'react';
import { getState as getApiState, saveState as saveApiState } from './api.js';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign,
  Clock3, CreditCard, Dumbbell, Download, Edit3, Ellipsis, FileText, Filter,
  LayoutDashboard, LogOut, Menu, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound,
  Users, X, Zap,
} from 'lucide-react';

const STORAGE_KEY = 'fitcontrol-data-v1';
const PENDING_SYNC_KEY = 'fitcontrol-pending-sync-v1';
const publicDemo = import.meta.env.VITE_DATA_MODE === 'local';
const today = new Date();
const dateOffset = (days) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days).toISOString().slice(0, 10);
const monthOffset = (months, day = 8) => new Date(today.getFullYear(), today.getMonth() + months, day).toISOString().slice(0, 10);
const dateForPlan = (date, plan) => {
  const result = new Date(`${date}T12:00:00`);
  result.setMonth(result.getMonth() + (plan === 'Anual' ? 12 : plan === 'Trimestral' ? 3 : 1));
  return result.toISOString().slice(0, 10);
};

const demoData = {
  members: [
    { id: 'm1', firstName: 'Sofía', lastName: 'Martínez', dni: '38.245.190', phone: '11 5842-9012', email: 'sofia.martinez@email.com', joinedAt: monthOffset(-5, 12), nextDueAt: dateOffset(2), plan: 'Mensual', status: 'Activo', routine: 'Fuerza & potencia' },
    { id: 'm2', firstName: 'Mateo', lastName: 'García', dni: '41.092.834', phone: '11 6091-2240', email: 'mateo.garcia@email.com', joinedAt: monthOffset(-3, 4), nextDueAt: dateOffset(20), plan: 'Trimestral', status: 'Activo', routine: 'Full body inicial' },
    { id: 'm3', firstName: 'Valentina', lastName: 'López', dni: '36.718.055', phone: '11 3320-7814', email: 'valen.lopez@email.com', joinedAt: monthOffset(-8, 20), nextDueAt: dateOffset(29), plan: 'Anual', status: 'Activo', routine: 'Hipertrofia A/B' },
    { id: 'm4', firstName: 'Tomás', lastName: 'Fernández', dni: '39.504.621', phone: '11 4470-1198', email: 'tomas.fernandez@email.com', joinedAt: monthOffset(-1, 9), nextDueAt: dateOffset(-4), plan: 'Mensual', status: 'Activo', routine: 'Sin asignar' },
    { id: 'm5', firstName: 'Camila', lastName: 'Rodríguez', dni: '42.301.765', phone: '11 7018-3462', email: 'camila.rodriguez@email.com', joinedAt: monthOffset(-6, 15), nextDueAt: dateOffset(-20), plan: 'Trimestral', status: 'Inactivo', routine: 'Sin asignar' },
    { id: 'm6', firstName: 'Benjamín', lastName: 'Torres', dni: '35.864.210', phone: '11 2284-5503', email: 'b.torres@email.com', joinedAt: monthOffset(-11, 7), nextDueAt: dateOffset(15), plan: 'Anual', status: 'Activo', routine: 'Fuerza & potencia' },
    { id: 'm7', firstName: 'Lucía', lastName: 'Romero', dni: '40.116.592', phone: '11 5390-2881', email: 'lucia.romero@email.com', joinedAt: monthOffset(-2, 17), nextDueAt: dateOffset(6), plan: 'Mensual', status: 'Activo', routine: 'Movilidad & core' },
    { id: 'm8', firstName: 'Joaquín', lastName: 'Díaz', dni: '37.930.478', phone: '11 6215-0374', email: 'joaquin.diaz@email.com', joinedAt: monthOffset(-4, 1), nextDueAt: dateOffset(12), plan: 'Mensual', status: 'Activo', routine: 'Full body inicial' },
  ],
  payments: [
    { id: 'p1', memberId: 'm1', amount: 28000, date: dateOffset(0), dueDate: dateOffset(2), method: 'Mercado Pago', status: 'Pagado', plan: 'Mensual' },
    { id: 'p2', memberId: 'm2', amount: 72000, date: dateOffset(-1), dueDate: dateOffset(20), method: 'Transferencia', status: 'Pagado', plan: 'Trimestral' },
    { id: 'p3', memberId: 'm3', amount: 240000, date: dateOffset(-2), dueDate: dateOffset(29), method: 'Tarjeta', status: 'Pagado', plan: 'Anual' },
    { id: 'p4', memberId: 'm4', amount: 28000, date: dateOffset(-4), dueDate: dateOffset(-4), method: 'Efectivo', status: 'Pendiente', plan: 'Mensual' },
    { id: 'p5', memberId: 'm6', amount: 240000, date: dateOffset(-5), dueDate: dateOffset(15), method: 'Transferencia', status: 'Pagado', plan: 'Anual' },
    { id: 'p6', memberId: 'm7', amount: 28000, date: dateOffset(-7), dueDate: dateOffset(6), method: 'Mercado Pago', status: 'Pendiente', plan: 'Mensual' },
    { id: 'p7', memberId: 'm8', amount: 28000, date: monthOffset(-1, 19), dueDate: dateOffset(12), method: 'Tarjeta', status: 'Pagado', plan: 'Mensual' },
    { id: 'p8', memberId: 'm1', amount: 28000, date: monthOffset(-1, 12), dueDate: dateOffset(-28), method: 'Mercado Pago', status: 'Pagado', plan: 'Mensual' },
    { id: 'p9', memberId: 'm3', amount: 240000, date: monthOffset(-2, 20), dueDate: dateOffset(-336), method: 'Tarjeta', status: 'Pagado', plan: 'Anual' },
    { id: 'p10', memberId: 'm2', amount: 72000, date: monthOffset(-3, 4), dueDate: dateOffset(-70), method: 'Transferencia', status: 'Pagado', plan: 'Trimestral' },
  ],
  routines: [
    { id: 'r1', name: 'Fuerza & potencia', days: 'Lun · Mié · Vie', exercises: [{ name: 'Sentadilla', sets: 4, reps: '8-10' }, { name: 'Press banca', sets: 4, reps: '8-10' }, { name: 'Peso muerto', sets: 3, reps: '8' }] },
    { id: 'r2', name: 'Full body inicial', days: 'Mar · Jue · Sáb', exercises: [{ name: 'Prensa', sets: 3, reps: '12' }, { name: 'Jalón al pecho', sets: 3, reps: '12' }, { name: 'Press con mancuernas', sets: 3, reps: '12' }] },
    { id: 'r3', name: 'Hipertrofia A/B', days: 'Lun · Mar · Jue · Vie', exercises: [{ name: 'Hip thrust', sets: 4, reps: '10-12' }, { name: 'Remo con barra', sets: 4, reps: '10' }] },
    { id: 'r4', name: 'Movilidad & core', days: 'Lun · Mié · Vie', exercises: [{ name: 'Plancha', sets: 3, reps: '45 seg' }, { name: 'Bird dog', sets: 3, reps: '12' }] },
  ],
  activities: [
    { id: 'a1', text: 'Sofía Martínez renovó su membresía', time: 'Hace 12 min', icon: 'payment' },
    { id: 'a2', text: 'Nuevo socio: Tomás Fernández', time: 'Hace 48 min', icon: 'member' },
    { id: 'a3', text: 'Rutina actualizada para Lucía Romero', time: 'Hace 2 h', icon: 'routine' },
    { id: 'a4', text: 'Mateo García registró un pago', time: 'Hace 3 h', icon: 'payment' },
  ],
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members', label: 'Socios', icon: Users },
  { id: 'memberships', label: 'Membresías', icon: ShieldCheck },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'routines', label: 'Rutinas', icon: Dumbbell },
  { id: 'reports', label: 'Estadísticas', icon: BarChart3 },
];
const planPrice = { Mensual: 28000, Trimestral: 72000, Anual: 240000 };
const money = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value || 0);
const displayDate = (date) => date ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`)) : '—';
const getMemberName = (member) => member ? `${member.firstName} ${member.lastName}` : 'Socio eliminado';
const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return demoData;
    const parsed = JSON.parse(stored);
    if (!parsed || !Array.isArray(parsed.members) || !Array.isArray(parsed.payments) || !Array.isArray(parsed.routines)) throw new Error('Formato de datos inválido');
    return { ...demoData, ...parsed };
  } catch (error) {
    console.error('No se pudieron cargar los datos locales de FitControl:', error);
    return demoData;
  }
};

function IconButton({ label, onClick, children, className = '' }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}><i />{children}</span>;
}

function Modal({ title, subtitle, onClose, children, size = '' }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal ${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><h2 id="modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><IconButton label="Cerrar" onClick={onClose}><X size={19} /></IconButton></div>
      {children}
    </section>
  </div>;
}

function Field({ label, children, className = '' }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}</label>;
}

function MemberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { firstName: '', lastName: '', dni: '', phone: '', email: '', joinedAt: dateOffset(0), plan: 'Mensual', status: 'Activo', routine: 'Sin asignar' });
  const [error, setError] = useState('');
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dni.trim() || !form.phone.trim() || !form.email.trim()) return setError('Completá todos los campos obligatorios.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Ingresá un correo electrónico válido.');
    onSave({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), dni: form.dni.trim(), phone: form.phone.trim(), email: form.email.trim() });
  };
  return <Modal title={initial ? 'Editar socio' : 'Nuevo socio'} subtitle="Completá los datos para mantener tu comunidad al día." onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-grid">
        <Field label="Nombre *"><input autoFocus value={form.firstName} onChange={update('firstName')} placeholder="Ej. Martina" /></Field>
        <Field label="Apellido *"><input value={form.lastName} onChange={update('lastName')} placeholder="Ej. Pérez" /></Field>
        <Field label="DNI *"><input value={form.dni} onChange={update('dni')} placeholder="00.000.000" /></Field>
        <Field label="Teléfono *"><input value={form.phone} onChange={update('phone')} placeholder="11 1234-5678" /></Field>
        <Field label="Correo electrónico *" className="span-2"><input type="email" value={form.email} onChange={update('email')} placeholder="nombre@email.com" /></Field>
        <Field label="Fecha de ingreso"><input type="date" value={form.joinedAt} onChange={update('joinedAt')} /></Field>
        <Field label="Membresía"><select value={form.plan} onChange={update('plan')}><option>Mensual</option><option>Trimestral</option><option>Anual</option></select></Field>
        <Field label="Estado"><select value={form.status} onChange={update('status')}><option>Activo</option><option>Inactivo</option></select></Field>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions"><button className="button button-ghost" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={16} />{initial ? 'Guardar cambios' : 'Crear socio'}</button></div>
    </form>
  </Modal>;
}

function PaymentForm({ members, onSave, onClose, memberId }) {
  const [form, setForm] = useState({ memberId: memberId || members[0]?.id || '', amount: '', date: dateOffset(0), dueDate: dateForPlan(dateOffset(0), members.find((item) => item.id === memberId)?.plan || 'Mensual'), method: 'Transferencia', status: 'Pagado', plan: members.find((item) => item.id === memberId)?.plan || 'Mensual' });
  const [error, setError] = useState('');
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setMember = (value) => setForm((prev) => {
    const plan = members.find((member) => member.id === value)?.plan || 'Mensual';
    return { ...prev, memberId: value, plan, dueDate: dateForPlan(prev.date, plan) };
  });
  const setPaymentDate = (value) => setForm((prev) => ({ ...prev, date: value, dueDate: dateForPlan(value, prev.plan) }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.memberId) return setError('Primero agregá un socio para registrar un pago.');
    if (!Number(form.amount) || Number(form.amount) <= 0) return setError('Ingresá un importe mayor a cero.');
    if (!form.dueDate) return setError('Indicá la fecha del próximo vencimiento.');
    onSave({ ...form, amount: Number(form.amount), plan: members.find((item) => item.id === form.memberId)?.plan || 'Mensual' });
  };
  return <Modal title="Registrar pago" subtitle="El pago se reflejará en tu resumen de ingresos." onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-grid">
        <Field label="Socio *" className="span-2"><select value={form.memberId} onChange={(e) => setMember(e.target.value)}>{members.length ? members.map((member) => <option key={member.id} value={member.id}>{getMemberName(member)}</option>) : <option value="">No hay socios disponibles</option>}</select></Field>
        <Field label="Importe (ARS) *"><input type="number" min="1" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="28000" /></Field>
        <Field label="Fecha de pago"><input type="date" value={form.date} onChange={(e) => setPaymentDate(e.target.value)} /></Field>
        <Field label="Próximo vencimiento"><input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></Field>
        <Field label="Método de pago"><select value={form.method} onChange={(e) => set('method', e.target.value)}><option>Transferencia</option><option>Mercado Pago</option><option>Tarjeta</option><option>Efectivo</option></select></Field>
        <Field label="Estado"><select value={form.status} onChange={(e) => set('status', e.target.value)}><option>Pagado</option><option>Pendiente</option></select></Field>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions"><button className="button button-ghost" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Plus size={16} />Guardar pago</button></div>
    </form>
  </Modal>;
}

function Chart({ data, color = '#b5f43d', height = 200, currency = false, showBars = false }) {
  const width = 680;
  const padding = { left: 42, right: 12, top: 12, bottom: 30 };
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1) * 1.18;
  const min = Math.min(0, ...values);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => ({
    x: padding.left + (data.length === 1 ? innerWidth / 2 : (index * innerWidth) / (data.length - 1)),
    y: padding.top + innerHeight - ((item.value - min) / (max - min || 1)) * innerHeight,
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${points.at(-1)?.x || padding.left} ${height - padding.bottom} L ${points[0]?.x || padding.left} ${height - padding.bottom} Z`;
  const ticks = [0, .5, 1];
  return <div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={currency ? 'Gráfico de ingresos por período' : 'Gráfico de evolución de socios'}>
    <defs><linearGradient id={`fill-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {ticks.map((tick) => { const y = padding.top + innerHeight * tick; return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#292d28" strokeDasharray="4 6" /><text x={padding.left - 9} y={y + 4} textAnchor="end" className="chart-axis">{currency ? `${Math.round((max - (max - min) * tick) / 1000)}k` : Math.round(max - (max - min) * tick)}</text></g>; })}
    {showBars ? data.map((item, index) => { const barWidth = Math.min(26, innerWidth / data.length * .45); const point = points[index]; return <rect key={item.label} x={point.x - barWidth / 2} y={point.y} width={barWidth} height={Math.max(0, height - padding.bottom - point.y)} rx="5" fill={color} opacity={index === data.length - 1 ? 1 : .46}><title>{`${item.label}: ${currency ? money(item.value) : item.value}`}</title></rect>; }) : <><path d={area} fill={`url(#fill-${color.replace('#', '')})`} /><path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{points.map((point, index) => <circle key={data[index].label} cx={point.x} cy={point.y} r="3.5" fill="#141714" stroke={color} strokeWidth="2"><title>{`${data[index].label}: ${currency ? money(data[index].value) : data[index].value}`}</title></circle>)}</>}
    {data.map((item, index) => <text key={item.label} x={points[index].x} y={height - 8} textAnchor="middle" className="chart-axis">{item.label}</text>)}
  </svg></div>;
}

function App() {
  const [data, setData] = useState(loadData);
  const [storageMode, setStorageMode] = useState('checking');
  const [section, setSection] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState('Todos');
  const [paymentFilter, setPaymentFilter] = useState('Todos');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('Todos');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('Todos');
  const [reportRange, setReportRange] = useState('6');
  const [toast, setToast] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberMenu, setMemberMenu] = useState('');
  const importInput = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let cancelled = false;
    if (publicDemo) {
      setStorageMode('local');
      return () => { cancelled = true; };
    }
    const synchronize = async () => {
      try {
        const remote = await getApiState();
        const pending = localStorage.getItem(PENDING_SYNC_KEY);
        if (pending) {
          const pendingData = JSON.parse(pending);
          await saveApiState(pendingData);
          if (cancelled) return;
          setData({ ...demoData, ...pendingData });
        } else if (remote) {
          if (cancelled) return;
          setData({ ...demoData, ...remote });
        } else {
          await saveApiState(dataRef.current);
          if (cancelled) return;
        }
        localStorage.removeItem(PENDING_SYNC_KEY);
        if (!cancelled) setStorageMode('mongo');
      } catch (error) {
        console.info('FitControl continúa en modo local:', error.message);
        if (!cancelled) setStorageMode('local');
      }
    };
    synchronize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (storageMode === 'local' && !publicDemo) localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('No se pudieron guardar los datos locales de FitControl:', error);
      setToast('No se pudo guardar en este dispositivo.');
    }
  }, [data, storageMode]);

  useEffect(() => {
    if (storageMode !== 'mongo') return undefined;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      saveApiState(data).catch((error) => {
        console.error('No se pudieron sincronizar los cambios con MongoDB:', error);
        if (cancelled) return;
        try { localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data)); }
        catch (storageError) { console.error('No se pudo guardar la copia local pendiente:', storageError); }
        setStorageMode('local');
        setToast('Cambios guardados localmente; la API no está disponible.');
      });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [data, storageMode]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const dismiss = () => setMemberMenu('');
    window.addEventListener('click', dismiss);
    return () => window.removeEventListener('click', dismiss);
  }, []);

  const members = data.members;
  const paidPayments = data.payments.filter((item) => item.status === 'Pagado');
  const thisMonth = new Date().toISOString().slice(0, 7);
  const incomeThisMonth = paidPayments.filter((item) => item.date?.slice(0, 7) === thisMonth).reduce((sum, item) => sum + Number(item.amount), 0);
  const activeMembers = members.filter((item) => item.status === 'Activo').length;
  const pendingPayments = data.payments.filter((item) => item.status === 'Pendiente');
  const dateInDays = (days) => dateOffset(days);
  const endingSoon = members.filter((member) => member.status === 'Activo' && member.nextDueAt >= dateOffset(0) && member.nextDueAt <= dateInDays(7));
  const expiredMembers = members.filter((member) => member.status === 'Activo' && member.nextDueAt && member.nextDueAt < dateOffset(0));
  const filteredMembers = members.filter((member) => {
    const matchesQuery = `${member.firstName} ${member.lastName} ${member.dni} ${member.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = memberFilter === 'Todos' || member.status === memberFilter;
    return matchesQuery && matchesStatus;
  });
  const filteredPayments = [...data.payments].filter((item) => (paymentFilter === 'Todos' || item.status === paymentFilter) && (paymentMethodFilter === 'Todos' || item.method === paymentMethodFilter)).sort((a, b) => b.date.localeCompare(a.date));
  const filteredPaymentHistory = filteredPayments.filter((item) => paymentMonthFilter === 'Todos' || item.date?.slice(0, 7) === paymentMonthFilter);
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const offset = 11 - index;
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const label = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', '');
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const value = paidPayments.filter((item) => item.date?.slice(0, 7) === key).reduce((sum, item) => sum + Number(item.amount), 0);
    return { label, value };
  });
  const memberHistory = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return { label: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(month).replace('.', ''), value: members.filter((item) => new Date(`${item.joinedAt}T12:00:00`) <= end).length };
  });
  const reportMonths = monthlyData.slice(-Number(reportRange));
  const periodIncome = reportMonths.reduce((sum, item) => sum + item.value, 0);
  const pageTitle = navItems.find((item) => item.id === section)?.label || (section === 'settings' ? 'Configuración' : 'Dashboard');
  const gymName = data.gymName || 'FitControl Gym';
  const addActivity = (text, icon = 'member') => ({ id: crypto.randomUUID(), text, time: 'Ahora mismo', icon });

  const saveMember = (member) => {
    const isEdit = Boolean(member.id);
    const saved = { ...member, id: member.id || crypto.randomUUID() };
    setData((prev) => ({ ...prev, members: isEdit ? prev.members.map((item) => item.id === saved.id ? saved : item) : [saved, ...prev.members], activities: [addActivity(`${getMemberName(saved)} ${isEdit ? 'actualizó sus datos' : 'se sumó como nuevo socio'}`), ...prev.activities].slice(0, 8) }));
    setModal(null); setToast(isEdit ? 'Datos del socio actualizados.' : '¡Socio agregado correctamente!');
  };
  const removeMember = (member) => {
    if (!window.confirm(`¿Eliminar a ${getMemberName(member)}? Esta acción no se puede deshacer.`)) return;
    setData((prev) => ({ ...prev, members: prev.members.filter((item) => item.id !== member.id), activities: [addActivity(`${getMemberName(member)} fue eliminado`), ...prev.activities].slice(0, 8) }));
    setToast('Socio eliminado.');
  };
  const savePayment = (payment) => {
    const saved = { ...payment, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, payments: [saved, ...prev.payments], members: payment.status === 'Pagado' ? prev.members.map((member) => member.id === payment.memberId ? { ...member, nextDueAt: payment.dueDate, plan: payment.plan } : member) : prev.members, activities: [addActivity(`${getMemberName(prev.members.find((member) => member.id === payment.memberId))} registró un pago`, 'payment'), ...prev.activities].slice(0, 8) }));
    setModal(null); setToast('Pago registrado correctamente.');
  };
  const markPaid = (payment) => {
    const nextDueAt = payment.dueDate && payment.dueDate >= dateOffset(0) ? payment.dueDate : dateForPlan(dateOffset(0), payment.plan);
    setData((prev) => ({ ...prev, payments: prev.payments.map((item) => item.id === payment.id ? { ...item, status: 'Pagado', date: dateOffset(0), dueDate: nextDueAt } : item), members: prev.members.map((member) => member.id === payment.memberId ? { ...member, nextDueAt } : member), activities: [addActivity(`Pago de ${getMemberName(prev.members.find((member) => member.id === payment.memberId))} confirmado`, 'payment'), ...prev.activities].slice(0, 8) }));
    setToast('Cuota marcada como pagada.');
  };
  const saveRoutine = (routine) => {
    setData((prev) => ({ ...prev, routines: routine.id ? prev.routines.map((item) => item.id === routine.id ? routine : item) : [{ ...routine, id: crypto.randomUUID() }, ...prev.routines] }));
    setModal(null); setToast(routine.id ? 'Rutina actualizada.' : 'Rutina creada correctamente.');
  };
  const assignRoutine = (memberId, routineName) => {
    setData((prev) => ({ ...prev, members: prev.members.map((member) => member.id === memberId ? { ...member, routine: routineName } : member), activities: [addActivity(`Rutina asignada a ${getMemberName(prev.members.find((member) => member.id === memberId))}`, 'routine'), ...prev.activities].slice(0, 8) }));
    setToast('Rutina asignada al socio.');
  };

  const exportData = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `fitcontrol-backup-${dateOffset(0)}.json`; link.click(); URL.revokeObjectURL(url);
      setToast('Respaldo descargado correctamente.');
    } catch (error) { console.error('Error al exportar los datos:', error); setToast('No se pudo crear el respaldo.'); }
  };
  const resetData = () => {
    if (!window.confirm('¿Restablecer la demo? Se reemplazarán tus datos locales por los datos de ejemplo.')) return;
    setData(demoData); setToast('Demo restablecida con datos de ejemplo.');
  };
  const editGymName = () => {
    const name = window.prompt('Nombre del gimnasio:', gymName);
    if (name === null) return;
    if (!name.trim()) return setToast('El nombre del gimnasio no puede quedar vacío.');
    setData((prev) => ({ ...prev, gymName: name.trim() }));
    setToast('Nombre del gimnasio actualizado.');
  };
  const importData = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.members) || !Array.isArray(imported.payments) || !Array.isArray(imported.routines) || !Array.isArray(imported.activities)) throw new Error('El archivo no tiene el formato de FitControl.');
      if (!window.confirm('Importar este respaldo reemplazará los datos actuales. ¿Querés continuar?')) return;
      setData({ ...demoData, ...imported });
      setToast('Respaldo importado correctamente.');
    } catch (error) {
      console.error('No se pudo importar el respaldo de FitControl:', error);
      setToast(error instanceof SyntaxError ? 'El archivo seleccionado no es un JSON válido.' : error.message || 'No se pudo importar el respaldo.');
    }
  };
  const retrySync = async () => {
    if (publicDemo) {
      setToast('Esta demo guarda los cambios solo en este navegador.');
      return;
    }
    try {
      const pending = localStorage.getItem(PENDING_SYNC_KEY);
      if (pending) {
        const pendingData = JSON.parse(pending);
        await saveApiState(pendingData);
        setData({ ...demoData, ...pendingData });
        localStorage.removeItem(PENDING_SYNC_KEY);
      } else {
        const remote = await getApiState();
        if (!remote) await saveApiState(dataRef.current);
        else setData({ ...demoData, ...remote });
      }
      setStorageMode('mongo');
      setToast('Conexión con MongoDB restablecida.');
    } catch (error) {
      console.error('No se pudo conectar con la API:', error);
      setToast(error.message);
    }
  };

  const heading = (eyebrow, title, description, action) => <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
  const actionButton = (label, onClick) => <button className="button button-primary" onClick={onClick}><Plus size={16} />{label}</button>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection('dashboard'); setMobileOpen(false); }}>
        <span className="brand-mark"><Activity size={20} strokeWidth={2.6} /></span><span className="brand-copy"><strong>fit<span>control</span></strong><small>GESTIÓN INTELIGENTE</small></span>
      </a>
      <div className="nav-caption">MENÚ PRINCIPAL</div>
      <nav className="sidebar-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${section === id ? 'active' : ''}`} onClick={() => { setSection(id); setMobileOpen(false); }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'memberships' && pendingPayments.length > 0 && <small className="nav-count">{pendingPayments.length}</small>}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="upgrade-card"><div className="upgrade-icon"><Zap size={17} /></div><strong>Tu gimnasio, en orden.</strong><p>Todo bajo control desde un solo lugar.</p><button onClick={() => setSection('reports')}>Ver estadísticas <ArrowUpRight size={14} /></button><div className="upgrade-orb" /></div>
      <button className={`nav-link settings-link ${section === 'settings' ? 'active' : ''}`} onClick={() => setSection('settings')}><Settings size={18} /><span>Configuración</span></button>
      <div className="sidebar-user"><div className="avatar avatar-admin">FC</div><div className="user-details"><strong>{gymName}</strong><span>Plan administrador</span></div><button className="user-more" aria-label="Opciones de cuenta"><MoreHorizontal size={19} /></button></div>
    </aside>
    {mobileOpen && <button className="mobile-overlay" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><IconButton label="Abrir menú" className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></IconButton><div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{pageTitle}</strong></div></div>
        <div className="topbar-right"><div className="today-label"><CalendarDays size={15} />{new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).format(today)}</div><span className="topbar-divider" /><IconButton label="Notificaciones" className="notification-button" onClick={() => { setSection('memberships'); setToast(`${pendingPayments.length} cuotas pendientes de pago.`); }}><Bell size={18} />{pendingPayments.length > 0 && <i />}</IconButton><div className="top-avatar">F</div></div>
      </header>
      <div className="content">
        {section === 'dashboard' && <>
          {heading('VISTA GENERAL', 'Hola, equipo 👋', 'Este es el resumen de tu gimnasio hoy.', <div className="heading-date"><span className="live-dot" /> Datos actualizados</div>)}
          <div className="stats-grid">
            <article className="stat-card"><div className="stat-card-top"><span className="stat-icon green"><Users size={18} /></span><span className="stat-period">Este mes</span></div><div className="stat-label">Socios totales</div><div className="stat-value">{members.length}<span className="stat-suffix">socios</span></div><div className="stat-foot"><span className="trend up"><ArrowUpRight size={14} />{activeMembers} activos</span><span className="muted">· {members.length - activeMembers} inactivos</span></div><div className="stat-spark spark-green"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-top"><span className="stat-icon yellow"><CircleDollarSign size={18} /></span><span className="stat-period">Este mes</span></div><div className="stat-label">Ingresos del mes</div><div className="stat-value stat-money">{money(incomeThisMonth)}</div><div className="stat-foot"><span className="trend up"><TrendingUp size={14} />Ingresos confirmados</span></div><div className="stat-spark spark-yellow"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-top"><span className="stat-icon purple"><CreditCard size={18} /></span><span className="stat-period">Por cobrar</span></div><div className="stat-label">Cuotas pendientes</div><div className="stat-value">{pendingPayments.length}<span className="stat-suffix">cuotas</span></div><div className="stat-foot"><span className={pendingPayments.length ? 'trend warning' : 'trend up'}>{pendingPayments.length ? `${money(pendingPayments.reduce((sum, item) => sum + Number(item.amount), 0))} por cobrar` : 'Todo al día'}</span></div><div className="stat-spark spark-purple"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-card-top"><span className="stat-icon blue"><Clock3 size={18} /></span><span className="stat-period">Próximos 7 días</span></div><div className="stat-label">Membresías por vencer</div><div className="stat-value">{endingSoon.length}<span className="stat-suffix">socios</span></div><div className="stat-foot"><span className="trend neutral-trend"><CalendarDays size={13} />Vencimientos próximos</span></div><div className="stat-spark spark-blue"><i /><i /><i /><i /><i /><i /><i /></div></article>
          </div>
          <div className="dashboard-charts">
            <section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">RENDIMIENTO</span><h2>Ingresos mensuales</h2></div><button className="select-button" onClick={() => setSection('reports')}>Últimos 6 meses <ChevronDown size={14} /></button></div><div className="chart-summary"><strong>{money(monthlyData.slice(-6).reduce((sum, item) => sum + item.value, 0))}</strong><span><span className="positive-dot" />Ingresos registrados</span></div><Chart data={monthlyData.slice(-6)} currency height={220} /></section>
            <section className="panel chart-panel member-chart"><div className="panel-heading"><div><span className="panel-kicker">COMUNIDAD</span><h2>Evolución de socios</h2></div><span className="chart-legend"><i />Socios</span></div><div className="chart-summary"><strong>{activeMembers} <small>activos</small></strong><span className="muted">en tu gimnasio</span></div><Chart data={memberHistory} color="#8c7cf6" height={220} /></section>
          </div>
          <div className="dashboard-bottom">
            <section className="panel activity-panel"><div className="panel-heading"><div><span className="panel-kicker">AL DÍA</span><h2>Actividad reciente</h2></div><button className="text-button" onClick={() => setSection('payments')}>Ver pagos <ArrowUpRight size={14} /></button></div>{data.activities.length ? <div className="activity-list">{data.activities.slice(0, 4).map((activity) => <div className="activity-row" key={activity.id}><span className={`activity-icon ${activity.icon}`}>{activity.icon === 'payment' ? <CreditCard size={15} /> : activity.icon === 'routine' ? <Dumbbell size={15} /> : <UserRound size={15} />}</span><div className="activity-copy"><strong>{activity.text}</strong><span>{activity.time}</span></div><ChevronRight size={15} className="activity-chevron" /></div>)}</div> : <EmptyState icon={Activity} title="Sin actividad reciente" text="Las novedades aparecerán acá." />}</section>
            <section className="panel due-panel"><div className="panel-heading"><div><span className="panel-kicker">ATENCIÓN</span><h2>Cuotas pendientes</h2></div><span className="count-pill">{pendingPayments.length}</span></div>{pendingPayments.length ? <div className="due-list">{pendingPayments.slice(0, 3).map((payment) => <div className="due-row" key={payment.id}><div className="avatar">{(data.members.find((member) => member.id === payment.memberId)?.firstName || '?')[0]}</div><div className="due-info"><strong>{getMemberName(data.members.find((member) => member.id === payment.memberId))}</strong><span>Vence {displayDate(payment.dueDate || payment.date)}</span></div><strong className="due-amount">{money(payment.amount)}</strong></div>)}</div> : <EmptyState icon={CheckCircle2} title="¡Todo al día!" text="No hay cuotas pendientes." />}<button className="panel-bottom-link" onClick={() => { setSection('memberships'); setPaymentFilter('Pendiente'); }}>Gestionar cuotas <ArrowUpRight size={14} /></button></section>
          </div>
        </>}

        {section === 'members' && <>
          {heading('TU COMUNIDAD', 'Gestión de socios', 'Administrá los perfiles, estados y membresías de tus socios.', actionButton('Agregar socio', () => setModal({ type: 'member' })))}
          <section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, DNI o email..." /><kbd>⌘ K</kbd></div><div className="toolbar-actions"><div className="filter-select"><Filter size={15} /><select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}><option>Todos</option><option>Activo</option><option>Inactivo</option></select><ChevronDown size={13} /></div><span className="results-count">{filteredMembers.length} socios</span></div></div>
            {filteredMembers.length ? <div className="table-scroll"><table><thead><tr><th>SOCIO</th><th>DNI</th><th>CONTACTO</th><th>MEMBRESÍA</th><th>INGRESO</th><th>ESTADO</th><th></th></tr></thead><tbody>{filteredMembers.map((member, index) => <tr key={member.id}><td><div className="member-cell"><div className={`avatar avatar-${index % 5}`}>{member.firstName[0]}{member.lastName[0]}</div><div><strong>{getMemberName(member)}</strong><span>{member.email}</span></div></div></td><td className="table-muted">{member.dni}</td><td><span className="contact-phone">{member.phone}</span></td><td><span className="plan-tag">{member.plan}</span></td><td className="table-muted">{displayDate(member.joinedAt)}</td><td><Badge tone={member.status === 'Activo' ? 'success' : 'neutral'}>{member.status}</Badge></td><td><div className="row-actions"><IconButton label="Editar socio" onClick={() => setModal({ type: 'member', member })}><Edit3 size={15} /></IconButton><div className="relative-menu"><IconButton label="Más opciones" onClick={(event) => { event.stopPropagation(); setMemberMenu(memberMenu === member.id ? '' : member.id); }}><Ellipsis size={17} /></IconButton>{memberMenu === member.id && <div className="action-menu" onClick={(event) => event.stopPropagation()}><button onClick={() => { setModal({ type: 'payment', memberId: member.id }); setMemberMenu(''); }}><CreditCard size={14} />Registrar pago</button><button className="danger-text" onClick={() => { removeMember(member); setMemberMenu(''); }}><Trash2 size={14} />Eliminar socio</button></div>}</div></div></td></tr>)}</tbody></table></div> : <EmptyState icon={Users} title="No encontramos socios" text={query ? 'Probá con otro nombre, DNI o correo.' : 'Agregá tu primer socio para empezar.'} action={!query && actionButton('Agregar socio', () => setModal({ type: 'member' }))} />}
            <div className="table-footer"><span>Mostrando <strong>{filteredMembers.length}</strong> de <strong>{members.length}</strong> socios</span><div className="pagination"><button disabled aria-label="Página anterior"><ChevronLeft size={16} /></button><button className="current-page">1</button><button disabled aria-label="Página siguiente"><ChevronRight size={16} /></button></div></div>
          </section>
        </>}

        {section === 'memberships' && <>
          {heading('PLANES Y CUOTAS', 'Membresías', 'Controlá vencimientos y mantené tus cuotas al día.', actionButton('Registrar pago', () => setModal({ type: 'payment' })))}
          <div className="plans-grid">{Object.entries(planPrice).map(([plan, price], index) => <article className={`plan-card plan-card-${index}`} key={plan}><div className="plan-card-top"><span className="plan-icon">{index === 0 ? <Zap size={18} /> : index === 1 ? <TrendingUp size={18} /> : <Sparkles size={18} />}</span><span className="plan-members">{members.filter((member) => member.plan === plan && member.status === 'Activo').length} socios</span></div><h3>{plan}</h3><p>{index === 0 ? 'Flexibilidad para entrenar' : index === 1 ? 'Constancia que se nota' : 'El compromiso definitivo'}</p><div className="plan-price">{money(price)}<span> / {index === 0 ? 'mes' : index === 1 ? '3 meses' : 'año'}</span></div><span className="plan-includes">Acceso completo al gimnasio</span></article>)}</div>
          <div className="membership-alerts"><div><span className="alert-dot alert-overdue" /><strong>{expiredMembers.length} vencidas</strong><span>membresías activas con vencimiento pasado</span></div><div><span className="alert-dot alert-soon" /><strong>{endingSoon.length} por vencer</strong><span>en los próximos 7 días</span></div></div>
          <section className="panel table-panel"><div className="panel-heading table-panel-heading"><div><span className="panel-kicker">SEGUIMIENTO</span><h2>Estado de cuotas</h2></div><div className="filter-select"><SlidersHorizontal size={15} /><select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}><option>Todos</option><option>Pagado</option><option>Pendiente</option></select><ChevronDown size={13} /></div></div>
            {filteredPayments.length ? <div className="table-scroll"><table><thead><tr><th>SOCIO</th><th>PLAN</th><th>IMPORTE</th><th>FECHA / VENCIMIENTO</th><th>MÉTODO</th><th>ESTADO</th><th></th></tr></thead><tbody>{filteredPayments.map((payment, index) => <tr key={payment.id}><td><div className="member-cell"><div className={`avatar avatar-${index % 5}`}>{(data.members.find((member) => member.id === payment.memberId)?.firstName || '?')[0]}</div><div><strong>{getMemberName(data.members.find((member) => member.id === payment.memberId))}</strong><span>Cuota de membresía</span></div></div></td><td><span className="plan-tag">{payment.plan}</span></td><td className="amount-cell">{money(payment.amount)}</td><td className="table-muted">{displayDate(payment.dueDate || payment.date)}</td><td className="table-muted">{payment.method}</td><td><Badge tone={payment.status === 'Pagado' ? 'success' : 'warning'}>{payment.status === 'Pendiente' && (payment.dueDate || payment.date) < dateOffset(0) ? 'Vencida' : payment.status}</Badge></td><td>{payment.status === 'Pendiente' && <button className="table-action" onClick={() => markPaid(payment)}><Check size={14} />Confirmar</button>}</td></tr>)}</tbody></table></div> : <EmptyState icon={CreditCard} title="Sin cuotas para mostrar" text="Registrá un pago para comenzar." />}</section>
        </>}

        {section === 'payments' && <>
          {heading('MOVIMIENTOS', 'Historial de pagos', 'Consultá y administrá todos los ingresos de tu gimnasio.', actionButton('Nuevo pago', () => setModal({ type: 'payment' })))}
          <div className="payment-overview"><div className="overview-card"><span className="stat-icon green"><CircleDollarSign size={18} /></span><span>Ingresos confirmados</span><strong>{money(paidPayments.reduce((sum, item) => sum + Number(item.amount), 0))}</strong><small>Histórico total</small></div><div className="overview-card"><span className="stat-icon yellow"><CalendarDays size={18} /></span><span>Ingresos este mes</span><strong>{money(incomeThisMonth)}</strong><small>Pagos recibidos en {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(today)}</small></div><div className="overview-card"><span className="stat-icon purple"><Clock3 size={18} /></span><span>Pendiente de cobro</span><strong>{money(pendingPayments.reduce((sum, item) => sum + Number(item.amount), 0))}</strong><small>{pendingPayments.length} cuotas pendientes</small></div></div>
          <section className="panel table-panel"><div className="table-toolbar"><div><span className="panel-kicker">REGISTRO</span><h2 className="toolbar-title">Todos los movimientos</h2></div><div className="toolbar-actions"><div className="filter-select"><CalendarDays size={14} /><select value={paymentMonthFilter} onChange={(e) => setPaymentMonthFilter(e.target.value)}><option value="Todos">Todos los períodos</option>{Array.from({ length: 12 }, (_, index) => { const date = new Date(today.getFullYear(), today.getMonth() - index, 1); const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; return <option value={value} key={value}>{new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date)}</option>; })}</select><ChevronDown size={13} /></div><div className="filter-select"><Filter size={15} /><select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}><option>Todos</option><option>Pagado</option><option>Pendiente</option></select><ChevronDown size={13} /></div><div className="filter-select"><CreditCard size={14} /><select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}><option>Todos</option><option>Transferencia</option><option>Mercado Pago</option><option>Tarjeta</option><option>Efectivo</option></select><ChevronDown size={13} /></div></div></div>
            {filteredPaymentHistory.length ? <div className="table-scroll"><table><thead><tr><th>SOCIO</th><th>FECHA</th><th>MÉTODO DE PAGO</th><th>IMPORTE</th><th>ESTADO</th><th></th></tr></thead><tbody>{filteredPaymentHistory.map((payment, index) => <tr key={payment.id}><td><div className="member-cell"><div className={`avatar avatar-${index % 5}`}>{(data.members.find((member) => member.id === payment.memberId)?.firstName || '?')[0]}</div><div><strong>{getMemberName(data.members.find((member) => member.id === payment.memberId))}</strong><span>{payment.plan} · Membresía</span></div></div></td><td className="table-muted">{displayDate(payment.date)}</td><td><span className="method-cell"><span className={`method-icon method-${payment.method.toLowerCase().replace(' ', '-')}`}><CreditCard size={14} /></span>{payment.method}</span></td><td className="amount-cell">{money(payment.amount)}</td><td><Badge tone={payment.status === 'Pagado' ? 'success' : 'warning'}>{payment.status}</Badge></td><td>{payment.status === 'Pendiente' && <button className="table-action" onClick={() => markPaid(payment)}><Check size={14} />Confirmar</button>}</td></tr>)}</tbody></table></div> : <EmptyState icon={CreditCard} title="No hay pagos con estos filtros" text="Ajustá los filtros o registrá un nuevo pago." />}</section>
        </>}

        {section === 'routines' && <>
          {heading('ENTRENAMIENTO', 'Rutinas', 'Diseñá planes de entrenamiento y asigná rutinas a tus socios.', actionButton('Nueva rutina', () => setModal({ type: 'routine' })))}
          <div className="routines-summary"><div><Dumbbell size={19} /><strong>{data.routines.length}</strong><span>rutinas disponibles</span></div><div><Users size={19} /><strong>{members.filter((member) => member.routine && member.routine !== 'Sin asignar').length}</strong><span>socios con plan asignado</span></div><div><Activity size={19} /><strong>{data.routines.reduce((sum, routine) => sum + routine.exercises.length, 0)}</strong><span>ejercicios planificados</span></div></div>
          {data.routines.length ? <div className="routine-grid">{data.routines.map((routine, index) => <article className="panel routine-card" key={routine.id}><div className="routine-card-top"><span className={`routine-icon routine-icon-${index % 4}`}><Dumbbell size={19} /></span><div className="routine-menu"><span className="routine-count">{routine.exercises.length} ejercicios</span><IconButton label="Editar rutina" onClick={() => setModal({ type: 'routine', routine })}><Edit3 size={15} /></IconButton></div></div><h2>{routine.name}</h2><div className="routine-days"><CalendarDays size={14} />{routine.days}</div><div className="exercise-list">{routine.exercises.slice(0, 4).map((exercise, index) => <div className="exercise-row" key={`${exercise.name}-${index}`}><span>{exercise.name}</span><strong>{exercise.sets} × {exercise.reps}</strong></div>)}</div><div className="assign-row"><select defaultValue="" onChange={(event) => { if (event.target.value) assignRoutine(event.target.value, routine.name); event.target.value = ''; }}><option value="">Asignar a un socio...</option>{members.filter((member) => member.status === 'Activo').map((member) => <option key={member.id} value={member.id}>{getMemberName(member)}</option>)}</select><ChevronDown size={14} /></div></article>)}</div> : <section className="panel"><EmptyState icon={Dumbbell} title="Todavía no hay rutinas" text="Creá tu primera rutina y asignala a tus socios." action={actionButton('Crear rutina', () => setModal({ type: 'routine' }))} /></section>}
        </>}

        {section === 'reports' && <>
          {heading('DATOS QUE IMPULSAN', 'Estadísticas', 'Entendé el rendimiento de tu gimnasio y tomá mejores decisiones.', <div className="filter-select report-range"><CalendarDays size={15} /><select value={reportRange} onChange={(event) => setReportRange(event.target.value)}><option value="3">Últimos 3 meses</option><option value="6">Últimos 6 meses</option><option value="12">Últimos 12 meses</option></select><ChevronDown size={13} /></div>)}
          <div className="report-stats"><div><span>Ingresos del período</span><strong>{money(periodIncome)}</strong><small><span className="positive-dot" />Ingresos de los meses seleccionados</small></div><div><span>Socios activos</span><strong>{activeMembers}</strong><small><span className="positive-dot purple-dot" />{members.length} socios registrados</small></div><div><span>Cuota promedio</span><strong>{money(paidPayments.length ? Math.round(paidPayments.reduce((sum, item) => sum + Number(item.amount), 0) / paidPayments.length) : 0)}</strong><small><span className="positive-dot" />Por pago confirmado</small></div></div>
          <div className="dashboard-charts reports-charts"><section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">FINANZAS</span><h2>Ingresos por mes</h2></div><span className="chart-legend"><i />ARS</span></div><Chart data={reportMonths} currency height={270} showBars /></section><section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">CRECIMIENTO</span><h2>Evolución de socios</h2></div><span className="chart-legend purple-legend"><i />Socios</span></div><Chart data={memberHistory.slice(-Number(reportRange))} color="#8c7cf6" height={270} /></section></div>
          <section className="panel membership-report"><div className="panel-heading"><div><span className="panel-kicker">PREFERENCIAS</span><h2>Membresías más elegidas</h2></div><span className="report-total">{members.length} socios</span></div>{Object.entries(planPrice).map(([plan], index) => { const count = members.filter((member) => member.plan === plan).length; const percent = members.length ? count / members.length * 100 : 0; return <div className="membership-bar-row" key={plan}><div><span className={`membership-dot membership-dot-${index}`} /><strong>{plan}</strong><span>{count} socios</span><b>{Math.round(percent)}%</b></div><div className="progress-track"><i className={`progress-fill progress-fill-${index}`} style={{ width: `${percent}%` }} /></div></div>; })}</section>
        </>}

        {section === 'settings' && <>
          {heading('PREFERENCIAS', 'Configuración', 'Administrá tus datos y preferencias de FitControl.')}
          <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importData} />
          <div className="settings-layout"><section className="panel settings-panel"><div className="settings-section-title"><span className="settings-icon"><Settings size={17} /></span><div><h2>Datos del gimnasio</h2><p>Información general de tu espacio.</p></div></div><div className="settings-field"><span>Nombre del gimnasio</span><strong>{gymName}</strong><button className="text-button" onClick={editGymName}>Editar</button></div><div className="settings-field"><span>Moneda</span><strong>ARS — Peso argentino</strong><span className="setting-fixed">Predeterminada</span></div><div className="settings-field"><span>Zona horaria</span><strong>Buenos Aires (GMT−3)</strong><span className="setting-fixed">Automática</span></div></section>
            <section className="panel settings-panel"><div className="settings-section-title"><span className="settings-icon green-setting"><Download size={17} /></span><div><h2>Datos y respaldo</h2><p>{publicDemo ? 'Demo pública: cada visitante guarda sus propios cambios.' : 'Sincronizá los cambios con MongoDB o usá el respaldo local.'}</p></div></div><div className="storage-notice"><ShieldCheck size={17} /><span><strong>{publicDemo ? 'Demo local por navegador' : storageMode === 'mongo' ? 'MongoDB conectado' : storageMode === 'checking' ? 'Verificando conexión' : 'Almacenamiento local activo'}</strong><small>{publicDemo ? 'Los datos son privados de este navegador y no se envían a una base compartida.' : storageMode === 'mongo' ? 'Los cambios se guardan en la base de datos.' : storageMode === 'checking' ? 'Comprobando la API y sincronizando tus datos.' : 'Los cambios quedan pendientes en este navegador hasta conectar la API.'}</small></span><Badge tone={storageMode === 'mongo' ? 'success' : 'warning'}>{storageMode === 'mongo' ? 'MongoDB' : storageMode === 'checking' ? 'Conectando' : 'Local'}</Badge></div>{!publicDemo && <button className="settings-action" onClick={retrySync}><span><Activity size={16} />Conexión con MongoDB</span><span>Reintentar conexión <ChevronRight size={15} /></span></button>}<button className="settings-action" onClick={exportData}><span><Download size={16} />Exportar datos</span><span>Descargar respaldo JSON <ChevronRight size={15} /></span></button><button className="settings-action" onClick={() => importInput.current?.click()}><span><FileText size={16} />Importar datos</span><span>Desde archivo JSON <ChevronRight size={15} /></span></button><button className="settings-action reset-action" onClick={resetData}><span><LogOut size={16} />Restablecer demo</span><span>Recuperar datos de ejemplo <ChevronRight size={15} /></span></button></section></div>
          <div className="settings-footnote"><ShieldCheck size={16} /><span>FitControl Demo · Tus datos están protegidos en el almacenamiento local de tu navegador.</span></div>
        </>}
        <footer className="app-footer"><span>FitControl <i>·</i> Gestión inteligente para gimnasios</span><span>Hecho para moverte <span className="footer-heart">♥</span></span></footer>
      </div>
    </main>
    {modal?.type === 'member' && <MemberForm initial={modal.member} onSave={saveMember} onClose={() => setModal(null)} />}
    {modal?.type === 'payment' && <PaymentForm members={members} memberId={modal.memberId} onSave={savePayment} onClose={() => setModal(null)} />}
    {modal?.type === 'routine' && <RoutineForm initial={modal.routine} onSave={saveRoutine} onClose={() => setModal(null)} />}
    {toast && <div className="toast"><span><CheckCircle2 size={17} /></span>{toast}<button aria-label="Cerrar notificación" onClick={() => setToast('')}><X size={15} /></button></div>}
  </div>;
}

function EmptyState({ icon: Icon, title, text, action }) {
  return <div className="empty-state"><span><Icon size={23} /></span><strong>{title}</strong><p>{text}</p>{action}</div>;
}

function RoutineForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [days, setDays] = useState(initial?.days || '');
  const [exercises, setExercises] = useState(initial?.exercises || [{ name: '', sets: 3, reps: '12' }]);
  const [error, setError] = useState('');
  const updateExercise = (index, key, value) => setExercises((prev) => prev.map((exercise, itemIndex) => itemIndex === index ? { ...exercise, [key]: value } : exercise));
  const submit = (event) => {
    event.preventDefault();
    const cleaned = exercises.filter((exercise) => exercise.name.trim());
    if (!name.trim() || !days.trim() || !cleaned.length) return setError('Completá el nombre, los días y al menos un ejercicio.');
    if (cleaned.some((exercise) => Number(exercise.sets) < 1 || !String(exercise.reps).trim())) return setError('Cada ejercicio debe tener series y repeticiones válidas.');
    onSave({ id: initial?.id, name: name.trim(), days: days.trim(), exercises: cleaned.map((exercise) => ({ ...exercise, sets: Number(exercise.sets), name: exercise.name.trim() })) });
  };
  return <Modal title={initial ? 'Editar rutina' : 'Nueva rutina'} subtitle="Armá un plan de entrenamiento claro y fácil de seguir." onClose={onClose} size="modal-wide">
    <form onSubmit={submit}><div className="form-grid"><Field label="Nombre de la rutina *" className="span-2"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Fuerza inicial" /></Field><Field label="Días de entrenamiento *" className="span-2"><input value={days} onChange={(event) => setDays(event.target.value)} placeholder="Ej. Lun · Mié · Vie" /></Field></div>
      <div className="exercise-form-heading"><strong>Ejercicios</strong><button type="button" className="text-button" onClick={() => setExercises((prev) => [...prev, { name: '', sets: 3, reps: '12' }])}><Plus size={14} />Agregar ejercicio</button></div>
      <div className="exercise-form-list">{exercises.map((exercise, index) => <div className="exercise-form-row" key={index}><input aria-label="Nombre del ejercicio" placeholder="Nombre del ejercicio" value={exercise.name} onChange={(event) => updateExercise(index, 'name', event.target.value)} /><input aria-label="Series" type="number" min="1" placeholder="Series" value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', event.target.value)} /><input aria-label="Repeticiones" placeholder="Repeticiones" value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', event.target.value)} /><IconButton label="Eliminar ejercicio" onClick={() => setExercises((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></IconButton></div>)}</div>
      {error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="button button-ghost" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={16} />Guardar rutina</button></div>
    </form>
  </Modal>;
}

export default App;
