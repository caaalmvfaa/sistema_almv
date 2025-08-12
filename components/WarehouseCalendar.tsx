
import React, { useState, useMemo, useCallback } from 'react';
import { PedidoLog, ContratoItem, ConsolidatedDelivery, DeliveryStatus } from '../types';
import { Button, Card, Modal } from './ui';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon 
} from './icons';

interface WarehouseCalendarProps {
  pedidos: PedidoLog[];
  contratos: ContratoItem[];
  onGenerateReport: (delivery: ConsolidatedDelivery, reason: DeliveryStatus.RECHAZADO | DeliveryStatus.INCOMPLETO, remarks: string) => void;
}

const WarehouseCalendar: React.FC<WarehouseCalendarProps> = ({ pedidos, contratos, onGenerateReport }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deliveries, setDeliveries] = useState<Record<string, ConsolidatedDelivery>>({});
  const [selectedDelivery, setSelectedDelivery] = useState<ConsolidatedDelivery | null>(null);
  const [observations, setObservations] = useState('');

  const contratosMap = useMemo(() => new Map(contratos.map(c => [c.id_articulo, c])), [contratos]);

  const consolidatedData = useMemo(() => {
    const dailyData: Record<string, Omit<ConsolidatedDelivery, 'status' | 'delivery_id' | 'observaciones'>> = {};

    pedidos.forEach(p => {
      const deliveryDate = new Date(p.fecha_programada).toISOString().split('T')[0];
      if (!dailyData[deliveryDate]) {
        dailyData[deliveryDate] = { fecha_entrega: deliveryDate, items: [] };
      }

      const itemIndex = dailyData[deliveryDate].items.findIndex(item => item.id_articulo === p.id_articulo);
      const contract = contratosMap.get(p.id_articulo);

      if (itemIndex > -1) {
        dailyData[deliveryDate].items[itemIndex].cantidad_programada += p.cantidad;
      } else if (contract) {
        dailyData[deliveryDate].items.push({
          id_articulo: p.id_articulo,
          cantidad_programada: p.cantidad,
          descripcion_articulo: contract.descripcion_articulo,
          codigo_articulo: contract.codigo_articulo,
          unidad_medida: contract.unidad_medida,
        });
      }
    });

    return Object.keys(dailyData).reduce((acc, date) => {
      const delivery_id = `del-${date}`;
      acc[date] = {
        delivery_id,
        status: deliveries[delivery_id]?.status || DeliveryStatus.PENDIENTE,
        observaciones: deliveries[delivery_id]?.observaciones,
        ...dailyData[date],
      };
      return acc;
    }, {} as Record<string, ConsolidatedDelivery>);
  }, [pedidos, contratosMap, deliveries]);

  const { days, firstDayOfMonth, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      firstDayOfMonth: (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1, // Adjust so Monday is the first day
      monthName: currentDate.toLocaleDateString('es-ES', { month: 'long' }),
      year,
    };
  }, [currentDate]);

  const changeMonth = useCallback((offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }, []);

  const handleUpdateStatus = useCallback((delivery_id: string, status: DeliveryStatus) => {
    if ((status === DeliveryStatus.RECHAZADO || status === DeliveryStatus.INCOMPLETO) && selectedDelivery && observations) {
      onGenerateReport(selectedDelivery, status, observations);
    }

    setDeliveries(prev => {
        const currentDelivery = consolidatedData[delivery_id.replace('del-','')]
        return {
            ...prev,
            [delivery_id]: {
                ...currentDelivery,
                status,
                observaciones: status === DeliveryStatus.PENDIENTE ? undefined : (observations || prev[delivery_id]?.observaciones),
            },
        }
    });
    setObservations('');
    setSelectedDelivery(null);
  }, [consolidatedData, observations, onGenerateReport, selectedDelivery]);
  
  const handleOpenModal = (delivery: ConsolidatedDelivery) => {
      setSelectedDelivery(delivery);
      setObservations(delivery.observaciones || '');
  }

  const getStatusInfo = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.RECIBIDO:
        return { style: 'bg-teal-100 text-teal-800 border-teal-300', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Recibido' };
      case DeliveryStatus.INCOMPLETO:
        return { style: 'bg-amber-100 text-amber-800 border-amber-300', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'Incompleto' };
      case DeliveryStatus.RECHAZADO:
        return { style: 'bg-rose-100 text-rose-800 border-rose-300', icon: <XCircleIcon className="w-4 h-4" />, label: 'Rechazado' };
      default:
        return { style: 'bg-slate-100 text-slate-500 border-slate-200', icon: <ClockIcon className="w-4 h-4" />, label: 'Pendiente' };
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900">Calendario de Recepción</h2>
        <p className="text-slate-500 text-lg mt-1">Visualice y gestione las entregas programadas para el almacén.</p>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="secondary" onClick={() => changeMonth(-1)}>&lt;</Button>
          <h3 className="text-2xl font-bold text-slate-700 capitalize">{monthName} {year}</h3>
          <Button variant="secondary" onClick={() => changeMonth(1)}>&gt;</Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="font-bold text-slate-500 py-2">{day}</div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border rounded-lg border-transparent"></div>)}

          {days.map(day => {
            const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const delivery = consolidatedData[dateStr];
            const statusInfo = delivery ? getStatusInfo(delivery.status) : null;

            return (
              <div
                key={day}
                className={`border rounded-lg p-2 min-h-[120px] transition-colors duration-200 flex flex-col ${delivery ? 'cursor-pointer hover:bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100'}`}
                onClick={() => delivery && handleOpenModal(delivery)}
              >
                <p className="font-bold text-slate-600 self-start">{day}</p>
                {delivery && statusInfo && (
                  <div className={`mt-2 p-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 ${statusInfo.style}`}>
                    {statusInfo.icon}
                    <span className="hidden sm:inline">{delivery.items.length} Insumos</span>
                    <span className="sm:hidden">{delivery.items.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selectedDelivery && (
        <Modal isOpen={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} title={`Entrega del ${new Date(selectedDelivery.fecha_entrega).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}>
          <div className="space-y-4">
            <div className="font-semibold flex items-center gap-2">
              Estado Actual: 
              <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getStatusInfo(selectedDelivery.status).style}`}>
                 {getStatusInfo(selectedDelivery.status).icon} {getStatusInfo(selectedDelivery.status).label}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg p-1 bg-slate-50/50">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="p-2 font-medium">Insumo</th>
                    <th className="p-2 font-medium text-right">Cantidad Programada</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedDelivery.items.map(item => (
                    <tr key={item.id_articulo}>
                      <td className="p-2 font-semibold text-slate-800">{item.descripcion_articulo} <span className="text-slate-400 font-normal">({item.codigo_articulo})</span></td>
                      <td className="p-2 font-bold text-right">{item.cantidad_programada} <span className="font-normal text-slate-500">{item.unidad_medida}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-slate-700 mb-1">Observaciones (Requerido para Rechazo/Incompleto)</label>
                <textarea 
                    id="observaciones"
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Faltaron 2 cajas de jeringas, el proveedor entregará mañana."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => handleUpdateStatus(selectedDelivery.delivery_id, DeliveryStatus.RECHAZADO)} disabled={!observations}>Rechazar</Button>
              <Button variant="secondary" onClick={() => handleUpdateStatus(selectedDelivery.delivery_id, DeliveryStatus.INCOMPLETO)} disabled={!observations}>Marcar Incompleto</Button>
              <Button variant="primary" onClick={() => handleUpdateStatus(selectedDelivery.delivery_id, DeliveryStatus.RECIBIDO)}>Confirmar Recepción</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WarehouseCalendar;
