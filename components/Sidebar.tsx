
import React, { useState } from 'react';
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LogoutIcon,
  ChartBarSquareIcon,
  MenuIcon,
  XMarkIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  GavelIcon
} from './icons';
import { Button } from './ui';
import { AppView, UsuarioConfig } from '../types';


interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeView: AppView | null;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  currentUser: UsuarioConfig | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'contracts', label: 'Contratos', icon: <DocumentTextIcon className="h-5 w-5 text-teal-500" /> },
    { id: 'planning', label: 'Planificación', icon: <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" /> },
    { id: 'warehouse-calendar', label: 'Recepción Almacén', icon: <CalendarDaysIcon className="h-5 w-5 text-red-500" /> },
    { id: 'dispatch', label: 'Salidas', icon: <TruckIcon className="h-5 w-5 text-orange-500" /> },
    { id: 'user_report', label: 'Mi Consolidado', icon: <ChartBarSquareIcon className="h-5 w-5 text-purple-500" /> },
    { id: 'reports', label: 'Programación', icon: <ChartBarIcon className="h-5 w-5 text-lime-500" /> },
    { id: 'penalties', label: 'Penalizaciones', icon: <GavelIcon className="h-5 w-5 text-gray-500" /> },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`no-print flex flex-col h-screen bg-white shadow-md transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between p-4 h-20 border-b border-slate-200">
        <div className={`flex items-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-indigo-600 mr-2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-xl font-bold text-indigo-700 whitespace-nowrap">Almacén</span>
        </div>
        <button onClick={toggleCollapse} className="focus:outline-none rounded-md p-1 hover:bg-slate-100">
          {isCollapsed ? <MenuIcon className="h-6 w-6 text-slate-500" /> : <XMarkIcon className="h-6 w-6 text-slate-500" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`group flex items-center w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${activeView === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
                {item.icon}
            </div>
            <span className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        {currentUser && (
          <div className={`flex items-center mb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
            <UserCircleIcon className="h-9 w-9 text-slate-400 mr-3 flex-shrink-0" />
            <div>
                <p className="text-sm text-slate-700 font-semibold truncate">{currentUser.nombre_usuario}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.nombre_servicio_asignado}</p>
            </div>
          </div>
        )}
        <Button 
          onClick={onLogout} 
          variant="secondary" 
          className="w-full flex justify-center items-center"
          title="Cerrar Sesión"
        >
          {isCollapsed ? (
            <LogoutIcon className="h-5 w-5 text-slate-500" />
          ) : (
            <>
              <LogoutIcon className="h-5 w-5 mr-2 text-slate-500" />
              <span>Cerrar Sesión</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
