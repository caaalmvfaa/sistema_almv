
import React, { useMemo, useState } from 'react';
import { SalidaGenerada, UsuarioConfig, ContratoItem, EstadoSalida, MealType, PedidoLog } from '../types';
import { useAppStore } from '../store';
import { Card, Modal, Button } from './ui';
import { CheckCircleIcon, ClockIcon, TruckIcon, PrinterIcon } from './icons';

interface DispatchLogProps {
    salidas: SalidaGenerada[];
    usuarios: UsuarioConfig[];
    contratos: ContratoItem[];
    onGenerateDispatch: (day: number, meal: MealType) => void;
    isLoading: boolean;
    pedidos: PedidoLog[];
    onPrint: (salida: SalidaGenerada) => void;
}

const DispatchLog: React.FC<DispatchLogProps> = ({ salidas, usuarios, contratos, onGenerateDispatch, isLoading, pedidos, onPrint }) => {
    const currentUser = useAppStore(state => state.currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSalida, setSelectedSalida] = useState<SalidaGenerada | null>(null);
  
  const [day, setDay] = useState<number>(1);
  const [meal, setMeal] = useState<MealType>('Desayuno');

  const usuariosMap = useMemo(() => new Map(usuarios.map(u => [u.id_usuario, u.nombre_usuario])), [usuarios]);
  const contratosMap = useMemo(() => new Map(contratos.map(c => [c.id_articulo, c])), [contratos]);

  const hasPlannedItems = useMemo(() => {
    if (!currentUser) return false;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const targetDate = new Date(year, month, day);

    return pedidos.some(p => {
        const pedidoDate = new Date(p.fecha_programada);
        return p.id_usuario === currentUser.id_usuario &&
               pedidoDate.getDate() === targetDate.getDate() &&
               pedidoDate.getMonth() === targetDate.getMonth() &&
               pedidoDate.getFullYear() === targetDate.getFullYear() &&
               p.tipo_comida === meal;
    });
  }, [day, meal, pedidos, currentUser]);

  const handleGenerateClick = () => {
      onGenerateDispatch(day, meal);
      setIsModalOpen(false);
  };
  
  const handleViewDetails = (salida: SalidaGenerada) => {
      setSelectedSalida(salida);
      setIsDetailModalOpen(true);
  };

  const handlePrintClick = () => {
    if (selectedSalida) {
      onPrint(selectedSalida);
      setIsDetailModalOpen(false);
    }
  };

  const getStatusPill = (status: EstadoSalida) => {
    switch (status) {
      case EstadoSalida.PENDIENTE: return {
          style: 'bg-amber-100 text-amber-800',
          icon: <ClockIcon className="w-3.5 h-3.5" />,
      };
      case EstadoSalida.EN_PROCESO: return {
          style: 'bg-blue-100 text-blue-800',
          icon: <TruckIcon className="w-3.5 h-3.5" />,
      };
      case EstadoSalida.SURTIDA: return {
          style: 'bg-emerald-100 text-emerald-800',
          icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
      };
      default: return {
          style: 'bg-zinc-100 text-zinc-800',
          icon: null
      };
    }
  };

  return (
    <div className="animate-fade-in-up">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Mis Salidas Generadas</h1>
                <p className="text-zinc-500 mt-1">Genere y visualice las solicitudes de salida para el almacén.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Generar Salida</Button>
        </div>
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-200/80">
                      <tr>
                          <th scope="col" className="py-3 px-6 font-medium">ID Salida</th>
                          <th scope="col" className="py-3 px-6 font-medium">Fecha Generación</th>
                          <th scope="col" className="py-3 px-6 font-medium">Servicio</th>
                          <th scope="col" className="py-3 px-6 font-medium">Para Fecha y Turno</th>
                          <th scope="col" className="py-3 px-6 font-medium">Estado</th>
                          <th scope="col" className="py-3 px-6 font-medium">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80">
                      {salidas.length === 0 ? (
                          <tr>
                              <td colSpan={6} className="text-center py-16 text-zinc-500">No ha generado ninguna salida.</td>
                          </tr>
                      ) : (
                          salidas.map((salida, index) => {
                            const statusInfo = getStatusPill(salida.estado_salida);
                            return (
                              <tr key={salida.id_salida} className="even:bg-zinc-50/50 hover:bg-zinc-100/80 transition-colors duration-150" style={{ animationDelay: `${index * 20}ms`, animationDuration: '300ms' }}>
                                  <td className="py-4 px-6 font-mono text-xs text-zinc-500">{salida.id_salida.substring(0,8)}...</td>
                                  <td className="py-4 px-6 text-zinc-600">{new Date(salida.timestamp_generacion).toLocaleString()}</td>
                                  <td className="py-4 px-6 font-semibold text-zinc-800">{salida.nombre_servicio}</td>
                                  <td className="py-4 px-6 text-zinc-600">{new Date(salida.fecha_salida).toLocaleDateString()} - {salida.tipo_comida}</td>
                                  <td className="py-4 px-6">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>
                                          {statusInfo.icon}
                                          {salida.estado_salida}
                                      </span>
                                  </td>
                                  <td className="py-4 px-6">
                                      <Button variant="secondary" onClick={() => handleViewDetails(salida)}>Ver Detalles</Button>
                                  </td>
                              </tr>
                            )
                          })
                      )}
                  </tbody>
              </table>
            </div>
        </Card>

        {/* Generate Dispatch Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generar Solicitud de Salida">
            <div className="space-y-6">
                <p className="text-zinc-600">Seleccione el día y turno para generar la solicitud de salida basada en su planificación.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="day-select" className="block text-sm font-medium text-zinc-700 mb-1">Día</label>
                        <select id="day-select" value={day} onChange={e => setDay(Number(e.target.value))} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="meal-select" className="block text-sm font-medium text-zinc-700 mb-1">Turno</label>
                        <select id="meal-select" value={meal} onChange={e => setMeal(e.target.value as MealType)} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="Desayuno">Desayuno</option>
                            <option value="Comida">Comida</option>
                            <option value="Cena">Cena</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleGenerateClick} disabled={isLoading || !hasPlannedItems} title={!hasPlannedItems ? "No hay items planificados para esta selección" : ""}>
                        {isLoading ? 'Generando...' : 'Confirmar y Generar'}
                    </Button>
                </div>
            </div>
        </Modal>

        {/* Dispatch Details Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detalles de Salida #${selectedSalida?.id_salida.substring(0,8)}...`}>
             {selectedSalida && (
                <>
                    <div className="max-h-[50vh] overflow-y-auto -mr-6 pr-6">
                        <table className="min-w-full text-sm text-left">
                           <thead className="text-xs text-zinc-500 uppercase">
                                <tr>
                                    <th className="py-2 px-4 font-medium">Código</th>
                                    <th className="py-2 px-4 font-medium">Descripción</th>
                                    <th className="py-2 px-4 font-medium text-right">Cantidad</th>
                                    <th className="py-2 px-4 font-medium">Unidad</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-200">
                               {(JSON.parse(selectedSalida.detalle_articulos) as { id_articulo: string, cantidad: number }[]).map(det => {
                                   const contract = contratosMap.get(det.id_articulo);
                                   return (
                                       <tr key={det.id_articulo} className="hover:bg-zinc-50">
                                           <td className="py-3 px-4 text-zinc-500">{contract?.codigo_articulo || 'N/A'}</td>
                                           <td className="py-3 px-4 font-semibold text-zinc-800">{contract?.descripcion_articulo || 'Artículo no encontrado'}</td>
                                           <td className="py-3 px-4 text-right font-semibold text-lg text-indigo-600">{det.cantidad}</td>
                                           <td className="py-3 px-4 text-zinc-500">{contract?.unidad_medida || 'N/A'}</td>
                                       </tr>
                                   );
                               })}
                           </tbody>
                        </table>
                    </div>
                     <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-200">
                        <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
                        <Button onClick={handlePrintClick}>
                            <PrinterIcon className="w-4 h-4 mr-2"/> Imprimir
                        </Button>
                    </div>
                </>
             )}
        </Modal>

    </div>
  );
};

export default DispatchLog;
