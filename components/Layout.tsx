
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Painel', icon: '📊' },
    { id: ViewType.SCHEDULE, label: 'Agenda', icon: '📅' },
    { id: ViewType.CLIENTS, label: 'Clientes', icon: '👥' },
    { id: ViewType.SERVICES, label: 'Serviços', icon: '✂️' },
    { id: ViewType.AI_INSIGHTS, label: 'AI Insights', icon: '✨' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-zinc-950 font-bold text-xl brand-font">M</div>
          <h1 className="text-xl font-bold brand-font tracking-tight">MrSanntana</h1>
        </div>
        
        <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto hidden md:block pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">S</div>
            <div>
              <p className="text-sm font-medium">Sr. Santana</p>
              <p className="text-xs text-zinc-500">Dono da Casa</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
