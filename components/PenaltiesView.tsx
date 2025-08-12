
import React, { useState } from 'react';
import { NonComplianceReport, ReportStatus } from '../types';
import { Button, Card, Modal } from './ui';

interface PenaltiesViewProps {
  reports: NonComplianceReport[];
  onUpdateStatus: (reportId: string, status: ReportStatus) => void;
}

const PenaltiesView: React.FC<PenaltiesViewProps> = ({ reports, onUpdateStatus }) => {
  const [selectedReport, setSelectedReport] = useState<NonComplianceReport | null>(null);

  const getStatusChipStyle = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDIENTE_REVISION:
        return 'bg-yellow-100 text-yellow-800';
      case ReportStatus.NOTIFICADO_PROVEEDOR:
        return 'bg-blue-100 text-blue-800';
      case ReportStatus.EN_DISPUTA:
        return 'bg-orange-100 text-orange-800';
      case ReportStatus.PENALIZACION_APLICADA:
        return 'bg-red-100 text-red-800';
      case ReportStatus.RESUELTO:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleUpdateAndClose = (reportId: string, status: ReportStatus) => {
      onUpdateStatus(reportId, status);
      setSelectedReport(null);
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900">Gestión de Incumplimientos</h2>
        <p className="text-slate-500 text-lg mt-1">Panel de la Coordinación Jurídica para revisar y dar seguimiento a las incidencias.</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-4 font-semibold">ID Reporte</th>
              <th className="p-4 font-semibold">Proveedor</th>
              <th className="p-4 font-semibold">Fecha Incidencia</th>
              <th className="p-4 font-semibold">Motivo</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-16 text-slate-500">No hay reportes de incumplimiento.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.report_id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs">{report.report_id}</td>
                  <td className="p-4">{report.id_proveedor}</td>
                  <td className="p-4">{new Date(report.fecha_incidencia).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-red-600">{report.motivo}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusChipStyle(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="secondary" onClick={() => setSelectedReport(report)}>Ver Detalles</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Reporte ${selectedReport.report_id}`}
        >
          <div className="space-y-4">
            <p><strong>Proveedor:</strong> {selectedReport.id_proveedor}</p>
            <p><strong>Motivo:</strong> <span className="font-bold text-red-600">{selectedReport.motivo}</span></p>
            <p><strong>Observaciones:</strong> {selectedReport.observaciones || 'N/A'}</p>
            <div>
              <strong>Items Afectados:</strong>
              <ul className="list-disc list-inside bg-slate-50 p-2 rounded-md mt-1 max-h-40 overflow-y-auto">
                {selectedReport.detalle_items.map(item => (
                  <li key={item.id_articulo}>
                    {item.descripcion_articulo} ({item.cantidad_programada} {item.unidad_medida})
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t flex flex-wrap gap-2 justify-end">
              <Button variant="secondary" onClick={() => handleUpdateAndClose(selectedReport.report_id, ReportStatus.NOTIFICADO_PROVEEDOR)}>Notificar Proveedor</Button>
              <Button variant="secondary" onClick={() => handleUpdateAndClose(selectedReport.report_id, ReportStatus.EN_DISPUTA)}>Marcar en Disputa</Button>
              <Button variant="secondary" onClick={() => handleUpdateAndClose(selectedReport.report_id, ReportStatus.PENALIZACION_APLICADA)}>Aplicar Penalización</Button>
              <Button variant="primary" onClick={() => handleUpdateAndClose(selectedReport.report_id, ReportStatus.RESUELTO)}>Marcar como Resuelto</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PenaltiesView;
