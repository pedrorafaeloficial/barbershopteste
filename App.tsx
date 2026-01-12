
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ViewType, Client, Appointment, Service } from './types';
import { generateReminderMessage, getBusinessInsights } from './services/geminiService';
import { db } from './services/db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const REVENUE_DATA = [
  { name: 'Seg', valor: 450 },
  { name: 'Ter', valor: 380 },
  { name: 'Qua', valor: 520 },
  { name: 'Qui', valor: 610 },
  { name: 'Sex', valor: 850 },
  { name: 'Sáb', valor: 1200 },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>(ViewType.DASHBOARD);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'client' | 'appointment' | 'service' | null>(null);

  // Form states
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', loyaltyPoints: 0 });
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 30 });
  const [newApt, setNewApt] = useState({ clientId: '', serviceId: '', date: '', time: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, a, s] = await Promise.all([db.getClients(), db.getAppointments(), db.getServices()]);
      setClients(c);
      setAppointments(a);
      setServices(s);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveService(newService);
    await loadData();
    setShowModal(null);
    setNewService({ name: '', price: 0, duration: 30 });
  };

  const handleAddApt = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === newApt.clientId);
    const service = services.find(s => s.id === newApt.serviceId);
    if (!client || !service) return;

    await db.createAppointment({
      clientId: client.id,
      clientName: client.name,
      serviceId: service.id,
      service: service.name,
      date: newApt.date,
      time: newApt.time,
      price: service.price,
      status: 'scheduled'
    });
    await loadData();
    setShowModal(null);
  };

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold brand-font">Catálogo de Serviços</h2>
        <button onClick={() => setShowModal('service')} className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-xl font-bold hover:bg-amber-400">Novo Serviço</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative group">
            <button onClick={() => db.deleteService(s.id).then(loadData)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4">✂️</div>
            <h3 className="text-xl font-bold mb-1">{s.name}</h3>
            <div className="flex justify-between items-center mt-4">
              <span className="text-amber-500 font-bold text-lg">R$ {s.price.toFixed(2)}</span>
              <span className="text-zinc-500 text-sm">⏱️ {s.duration} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout currentView={view} onViewChange={setView}>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div></div>
      ) : (
        <>
          {view === ViewType.DASHBOARD && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <header className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold brand-font">Painel de Controle</h2>
                    <p className="text-zinc-500 text-lg">Sr. Santana, a casa está pronta.</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-medium bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Postgres Online
                  </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-sm text-zinc-500 mb-1">Receita</p>
                    <h3 className="text-2xl font-bold text-amber-500">R$ {appointments.reduce((a, b) => a + b.price, 0).toFixed(2)}</h3>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-sm text-zinc-500 mb-1">Agendamentos</p>
                    <h3 className="text-2xl font-bold">{appointments.length}</h3>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-sm text-zinc-500 mb-1">Clientes</p>
                    <h3 className="text-2xl font-bold">{clients.length}</h3>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-sm text-zinc-500 mb-1">Serviços</p>
                    <h3 className="text-2xl font-bold">{services.length}</h3>
                  </div>
                </div>
            </div>
          )}
          {view === ViewType.SERVICES && renderServices()}
          {view === ViewType.CLIENTS && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold brand-font">Clientes</h2>
                <button onClick={() => setShowModal('client')} className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-xl font-bold">Novo Cliente</button>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800">
                    <tr><th className="px-6 py-4 text-zinc-400">Nome</th><th className="px-6 py-4 text-zinc-400">Telefone</th><th className="px-6 py-4 text-zinc-400">Ações</th></tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id} className="border-b border-zinc-800">
                        <td className="px-6 py-4">{c.name}</td>
                        <td className="px-6 py-4 text-zinc-500">{c.phone}</td>
                        <td className="px-6 py-4"><button onClick={() => {setNewApt({...newApt, clientId: c.id}); setShowModal('appointment');}} className="text-amber-500">Agendar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {view === ViewType.SCHEDULE && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold brand-font">Agenda</h2>
                <button onClick={() => setShowModal('appointment')} className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-xl font-bold">Novo Horário</button>
              </div>
              <div className="space-y-4">
                {appointments.map(apt => (
                  <div key={apt.id} className="flex gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 items-center">
                    <div className="text-zinc-500 font-mono text-lg w-16">{apt.time}</div>
                    <div className="flex-1">
                      <p className="font-bold">{apt.clientName}</p>
                      <p className="text-sm text-zinc-500">{apt.service} • R$ {apt.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => db.deleteAppointment(apt.id).then(loadData)} className="text-red-500 text-sm">Remover</button>
                  </div>
                ))}
              </div>
             </div>
          )}
        </>
      )}

      {showModal === 'service' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 brand-font">Cadastrar Serviço</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <input placeholder="Nome do Serviço" className="w-full bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
              <div className="flex gap-2">
                <input type="number" placeholder="Preço (R$)" className="flex-1 bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newService.price || ''} onChange={e => setNewService({...newService, price: Number(e.target.value)})} required />
                <input type="number" placeholder="Minutos" className="flex-1 bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newService.duration || ''} onChange={e => setNewService({...newService, duration: Number(e.target.value)})} required />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 bg-zinc-800 py-4 rounded-xl">Voltar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'appointment' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 brand-font">Novo Agendamento</h3>
            <form onSubmit={handleAddApt} className="space-y-4">
              <select className="w-full bg-zinc-800 border-none rounded-xl p-4 text-zinc-400 outline-none" value={newApt.clientId} onChange={e => setNewApt({...newApt, clientId: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="w-full bg-zinc-800 border-none rounded-xl p-4 text-zinc-400 outline-none" value={newApt.serviceId} onChange={e => setNewApt({...newApt, serviceId: e.target.value})} required>
                <option value="">Selecione o Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="date" className="flex-1 bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newApt.date} onChange={e => setNewApt({...newApt, date: e.target.value})} required />
                <input type="time" className="flex-1 bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newApt.time} onChange={e => setNewApt({...newApt, time: e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 bg-zinc-800 py-4 rounded-xl">Voltar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'client' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 brand-font">Novo Cliente</h3>
            <form onSubmit={(e) => { e.preventDefault(); db.saveClient(newClient).then(() => { loadData(); setShowModal(null); setNewClient({name:'', phone:'', email:'', loyaltyPoints:0}); }); }} className="space-y-4">
              <input placeholder="Nome Completo" className="w-full bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
              <input placeholder="WhatsApp" className="w-full bg-zinc-800 border-none rounded-xl p-4 outline-none" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} required />
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 bg-zinc-800 py-4 rounded-xl">Voltar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
