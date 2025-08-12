
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from './store';
import { generateInitialData } from './services/geminiService';
import { 
  ContratoItem, 
  UsuarioConfig, 
  PedidoLog, 
  SalidaGenerada, 
  PlanificacionData, 
  EstadoSalida, 
  MealType,
  AppData,
  AppView,
  ConsolidatedDelivery,
  DeliveryStatus,
  NonComplianceReport,
  ReportStatus
} from './types';
import { Spinner } from './components/ui';
import PlanningGrid from './components/PlanningGrid';
import DispatchLog from './components/DispatchLog';
import ConsolidatedReport from './components/ConsolidatedReport';
import ContractsView from './components/ContractsView';
import LoginScreen from './components/LoginScreen';
import PrintableDispatch from './components/PrintableDispatch';
import Sidebar from './components/Sidebar';
import ErrorScreen from './components/ErrorScreen';
import WarehouseCalendar from './components/WarehouseCalendar';
import PenaltiesView from './components/PenaltiesView';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { usePedidos } from './hooks/usePedidos';
import { useSalidas } from './hooks/useSalidas';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appData = useAppStore(state => state.appData);
  const setAppData = useAppStore(state => state.setAppData);
  const currentUser = useAppStore(state => state.currentUser);
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  // Eliminado: activeView y setActiveView, ahora la navegación es por rutas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [printableSalida, setPrintableSalida] = useState<SalidaGenerada | null>(null);
  const [nonComplianceReports, setNonComplianceReports] = useState<NonComplianceReport[]>([]);

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateInitialData();
  setAppData(data);
      setActiveView('contracts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during initialization.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const handleLogin = useCallback((user: UsuarioConfig) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser(user);
      setIsLoggingIn(false);
    }, 500);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const { crearPedidos } = usePedidos();
  const handlePlanSubmit = useCallback((data: PlanificacionData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      crearPedidos(data);
      setIsSubmitting(false);
      alert('Planificación enviada con éxito!');
    }, 1000);
  }, [crearPedidos]);

    const { generarSalida } = useSalidas(); // Mover la declaración de generarSalida aquí

  const userSalidas = useMemo(() => {
    if (!currentUser || !appData) return [];
    return appData.salidas
      .filter(s => s.id_usuario_solicitante === currentUser.id_usuario)
      .sort((a, b) => new Date(b.timestamp_generacion).getTime() - new Date(a.timestamp_generacion).getTime());
  }, [appData, currentUser]);

  const contratosMap = useMemo(() => new Map<string, ContratoItem>(appData?.contratos.map(c => [c.id_articulo, c]) || []), [appData]);

  const handlePrintDispatch = (salida: SalidaGenerada) => {
    setPrintableSalida(salida);
  };
  
  const handleGenerateReport = useCallback((delivery: ConsolidatedDelivery, reason: DeliveryStatus.RECHAZADO | DeliveryStatus.INCOMPLETO, remarks: string) => {
    if (!appData) return;
    const firstItem = delivery.items[0];
  const contract = contratosMap.get(firstItem.id_articulo) as ContratoItem | undefined;
  const providerId = contract?.id_proveedor || 'Proveedor Desconocido';

    const newReport: NonComplianceReport = {
      report_id: `INC-${Date.now()}`,
      delivery_id: delivery.delivery_id,
      fecha_incidencia: delivery.fecha_entrega,
      id_proveedor: providerId,
      motivo: reason,
      observaciones: remarks,
      detalle_items: delivery.items,
      status: ReportStatus.PENDIENTE_REVISION,
    };

    setNonComplianceReports(prev => [...prev, newReport]);
    alert(`Reporte de incumplimiento ${newReport.report_id} generado para ${providerId}.`);
  }, [appData, contratosMap]);

  const handleUpdateReportStatus = useCallback((reportId: string, status: ReportStatus) => {
    setNonComplianceReports(prev =>
      prev.map(report =>
        report.report_id === reportId ? { ...report, status } : report
      )
    );
  }, []);


  // Eliminado: renderContent, ahora el contenido se maneja por rutas

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-zinc-50"><Spinner message="Cargando aplicación..." /></div>;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={initializeApp} />;
  }

  if (!appData) {
    return <div className="h-screen flex items-center justify-center">Error al cargar datos.</div>;
  }

  if (!currentUser) {
    return <LoginScreen users={appData.usuarios} onLogin={handleLogin} isLoading={isLoggingIn} />;
  }

  // Definir MainRoutes antes del return para evitar error de referencia
  const MainRoutes = () => (
    <Routes>
      <Route path="/" element={<Navigate to="/contracts" replace />} />
      <Route path="/contracts" element={<ContractsView contratos={appData!.contratos} />} />
      <Route path="/planning" element={<PlanningGrid contracts={appData!.contratos} onSubmit={handlePlanSubmit} isLoading={isSubmitting} />} />
      <Route path="/warehouse-calendar" element={<WarehouseCalendar pedidos={appData!.pedidos} contratos={appData!.contratos} onGenerateReport={handleGenerateReport} />} />
    <Route path="/dispatch" element={<DispatchLog salidas={userSalidas} usuarios={appData!.usuarios} contratos={appData!.contratos} onGenerateDispatch={generarSalida} isLoading={false} pedidos={appData!.pedidos} onPrint={handlePrintDispatch} />} />
      <Route path="/user_report" element={<ConsolidatedReport pedidos={appData!.pedidos} contratos={appData!.contratos} userId={currentUser!.id_usuario} />} />
      <Route path="/reports" element={<ConsolidatedReport pedidos={appData!.pedidos} contratos={appData!.contratos} />} />
      <Route path="/penalties" element={<PenaltiesView reports={nonComplianceReports} onUpdateStatus={handleUpdateReportStatus} />} />
      <Route path="*" element={<div className="p-8 text-center text-slate-500">Vista no encontrada</div>} />
    </Routes>
  );
    <Route path="/dispatch" element={<DispatchLog salidas={userSalidas} usuarios={appData!.usuarios} contratos={appData!.contratos} onGenerateDispatch={generarSalida} isLoading={false} pedidos={appData!.pedidos} onPrint={handlePrintDispatch} />} />
  return (
    <Router>
      <div className="flex h-screen bg-zinc-100/50">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <MainRoutes />
          </div>
        </main>
        {printableSalida && (
          <PrintableDispatch 
            salida={printableSalida} 
            user={currentUser} 
            contratosMap={contratosMap} 
            onClose={() => setPrintableSalida(null)}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
