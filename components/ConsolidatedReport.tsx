import React, { useMemo, useState } from 'react';
import { PedidoLog, ContratoItem } from '../types';
import { Button, Card } from './ui';
import { MailIcon } from './icons';

interface ConsolidatedReportProps {
  pedidos: PedidoLog[];
  contratos: ContratoItem[];
  userId?: string;
}

const ConsolidatedReport: React.FC<ConsolidatedReportProps> = ({ pedidos, contratos, userId }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('todos');

  const { title, description } = useMemo(() => ({
    title: userId ? "Mi Consolidado Mensual" : "Programación Consolidada",
    description: userId 
      ? "Consolidado de sus artículos planificados para el mes."
      : "Consolidado de artículos planificados. Seleccione un proveedor para segmentar y exportar el reporte.",
  }), [userId]);

  const { consolidatedData, maxValue, providers, providerMap } = useMemo(() => {
    const data: { [itemId: string]: { days: { [day: number]: number }, provider: string } } = {};
    const providerSet = new Set<string>();
    const provMap = new Map<string, string[]>();
    const today = new Date();
    const currentMonth = today.getMonth();

    contratos.forEach(c => {
      providerSet.add(c.id_proveedor);
      if (!provMap.has(c.id_proveedor)) provMap.set(c.id_proveedor, []);
      provMap.get(c.id_proveedor)!.push(c.id_articulo);
    });

    const relevantPedidos = userId ? pedidos.filter(p => p.id_usuario === userId) : pedidos;

    relevantPedidos.forEach(pedido => {
      const itemContract = contratos.find(c => c.id_articulo === pedido.id_articulo);
      if (!itemContract) return;

      const pedidoDate = new Date(pedido.fecha_programada);
      if (pedidoDate.getMonth() !== currentMonth) return;
      
      const dayOfMonth = pedidoDate.getDate();
      if (!data[pedido.id_articulo]) {
        data[pedido.id_articulo] = { days: {}, provider: itemContract.id_proveedor };
      }
      data[pedido.id_articulo].days[dayOfMonth] = (data[pedido.id_articulo].days[dayOfMonth] || 0) + pedido.cantidad;
    });

    const allValues = Object.values(data).flatMap(item => Object.values(item.days));
    const max = Math.max(0, ...allValues);

    return { 
      consolidatedData: data, 
      maxValue: max, 
      providers: Array.from(providerSet).sort(), 
      providerMap: provMap
    };
  }, [pedidos, userId, contratos]);

  const filteredItems = useMemo(() => {
    if (selectedProvider === 'todos') {
      return Object.keys(consolidatedData);
    }
    const itemsForProvider = providerMap.get(selectedProvider) || [];
    return itemsForProvider.filter(itemId => consolidatedData[itemId]);
  }, [selectedProvider, consolidatedData, providerMap]);
  
  const handleSendEmail = () => {
    if (selectedProvider === 'todos' || filteredItems.length === 0) return;

    const providerItems = filteredItems.map(itemId => {
      const itemContract = contratos.find(c => c.id_articulo === itemId);
      const totalMonth = days
        .reduce((sum, day) => sum + (consolidatedData[itemId]?.days[day] || 0), 0);

      return {
        codigo: itemContract?.codigo_articulo || 'N/A',
        descripcion: itemContract?.descripcion_articulo || 'Desconocido',
        unidad: itemContract?.unidad_medida || 'N/A',
        total: totalMonth
      };
    }).filter(item => item.total > 0);

    const emailBody = `
      <p>Estimado ${selectedProvider},</p>
      <p>A continuación se detalla la programación de pedidos consolidada para los artículos que usted surte:</p>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2; color: #000;">
            <th style="padding: 8px; text-align: left;">Código</th>
            <th style="padding: 8px; text-align: left;">Descripción del Artículo</th>
            <th style="padding: 8px; text-align: center;">Cantidad Total Requerida</th>
            <th style="padding: 8px; text-align: left;">Unidad</th>
          </tr>
        </thead>
        <tbody>
          ${providerItems.map(item => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.codigo}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.descripcion}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${item.total}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.unidad}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Gracias por su colaboración.</p>
    `;

    const subject = `Programación de Pedidos Consolidada - ${selectedProvider}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  };
  
  const contratosMap = useMemo(() => new Map(contratos.map(c => [c.id_articulo, c])), [contratos]);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hasData = useMemo(() => Object.keys(consolidatedData).length > 0, [consolidatedData]);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
        <p className="text-zinc-500 mt-1">{description}</p>
      </div>

      {/* Panel de Control */}
      {!userId && hasData && (
        <Card className="p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="provider-select" className="text-sm font-medium text-zinc-600">Filtrar por Proveedor:</label>
            <select 
              id="provider-select"
              value={selectedProvider} 
              onChange={e => setSelectedProvider(e.target.value)}
              className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos los Proveedores</option>
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Button 
            onClick={handleSendEmail} 
            disabled={selectedProvider === 'todos' || filteredItems.length === 0} 
            variant="primary" 
            className="flex items-center gap-2"
            title={selectedProvider === 'todos' ? 'Seleccione un proveedor para enviar el correo' : ''}
          >
            <MailIcon className="w-4 h-4"/>
            Enviar a Proveedor
          </Button>
        </Card>
      )}

      <div className="overflow-hidden bg-white border border-zinc-200/80 rounded-2xl shadow-lg shadow-zinc-900/5">
        {!hasData ? (
          <p className="p-16 text-center text-zinc-500">No hay datos de planificación para generar el reporte.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-zinc-50/80 text-xs text-zinc-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="py-3.5 px-4 sticky left-0 bg-inherit z-20 min-w-[280px] border-r border-zinc-200/80 font-medium">Artículo</th>
                  {days.map(day => (
                    <th key={day} scope="col" className="py-3.5 px-2 text-center border-l border-zinc-200/80 w-16 font-medium">{day}</th>
                  ))}
                  <th scope="col" className="py-3.5 px-4 text-center border-l border-zinc-200/80 font-bold min-w-[100px]">Total Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {Object.keys(consolidatedData)
                  .sort((a,b) => {
                    const descA = contratosMap.get(a)?.descripcion_articulo || '';
                    const descB = contratosMap.get(b)?.descripcion_articulo || '';
                    return descA.localeCompare(descB);
                  })
                  .map((itemId) => {
                  const item = contratosMap.get(itemId);
                  if (!item) return null;
                  
                  const totalMonth = days.reduce((sum, day) => sum + (consolidatedData[itemId].days[day] || 0), 0);
                  const isVisible = filteredItems.includes(itemId);

                  if (!isVisible) return null;

                  return (
                    <tr 
                      key={itemId} 
                      className="even:bg-zinc-50/50 hover:bg-zinc-100/80 transition-opacity duration-300"
                    >
                      <td className="py-2.5 px-4 font-semibold text-zinc-800 sticky left-0 bg-inherit z-10 min-w-[280px] border-r border-zinc-200/80">
                        {item.descripcion_articulo}
                        <span className="block text-xs text-zinc-400 font-normal">{item.unidad_medida}</span>
                      </td>
                      {days.map(day => {
                        const value = consolidatedData[itemId].days[day] || 0;
                        const intensity = maxValue > 0 ? (value / maxValue) : 0;
                         const getHeatmapColor = (intensity: number) => {
                            if (intensity <= 0) return 'transparent';
                            if (intensity < 0.2) return 'rgba(199, 210, 254, 0.5)'; // indigo-200
                            if (intensity < 0.4) return 'rgba(165, 180, 252, 0.6)'; // indigo-300
                            if (intensity < 0.6) return 'rgba(129, 140, 248, 0.7)'; // indigo-400
                            if (intensity < 0.8) return 'rgba(99, 102, 241, 0.8)';  // indigo-500
                            return 'rgba(79, 70, 229, 0.9)';   // indigo-600
                        };
                        const cellStyle = { backgroundColor: getHeatmapColor(intensity) };
                        return (
                          <td 
                            key={day} 
                            className="py-2.5 px-2 text-center border-l border-zinc-200/80 transition-colors duration-200" 
                            style={cellStyle}
                          >
                            {value > 0 ? <span className={`font-semibold ${intensity > 0.6 ? 'text-white' : 'text-zinc-800'}`}>{value}</span> : <span className="text-zinc-300">-</span>}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center border-l border-zinc-200/80 font-bold bg-zinc-100 text-indigo-700">
                        {totalMonth}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <p className="p-16 text-center text-zinc-500">No hay datos de planificación para el proveedor seleccionado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedReport;