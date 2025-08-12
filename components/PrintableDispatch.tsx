
import React, { useMemo } from 'react';
import { SalidaGenerada, UsuarioConfig, ContratoItem } from '../types';
import { Button } from './ui';
import { PrinterIcon, XCircleIcon } from './icons';

const PrintableDispatch: React.FC<{
  salida: SalidaGenerada;
  user: UsuarioConfig | null;
  contratosMap: Map<string, ContratoItem>;
  onClose: () => void;
}> = ({ salida, user, contratosMap, onClose }) => {
  const detalles = useMemo(() => {
    try {
      const parsed = JSON.parse(salida.detalle_articulos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [salida.detalle_articulos]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handlePrint = () => window.print();

  const logoUrl = "https://www.hcg.udg.mx/wp-content/uploads/2020/06/HCG-Logo-1.png";

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex flex-col items-center p-4 sm:p-8 no-print animate-fade-in-up">
        <div className="w-full max-w-4xl flex justify-end gap-4 mb-4">
          <Button variant="secondary" onClick={onClose} className="bg-white/90 text-slate-800">
            <XCircleIcon className="w-5 h-5 mr-2" />
            Cerrar
          </Button>
          <Button onClick={handlePrint}>
            <PrinterIcon className="w-5 h-5 mr-2" />
            Imprimir
          </Button>
        </div>
        <div className="printable-area bg-white shadow-2xl w-full max-w-4xl font-serif text-black">
          <div className="p-8 border-2 border-black min-h-[1056px]">
            {/* --- ENCABEZADO --- */}
            <header className="grid grid-cols-3 items-center mb-4 border-b-2 border-black pb-4">
              <div className="flex justify-start">
                <img src={logoUrl} alt="Logo Hospital Civil" className="h-20 w-auto" />
              </div>
              <div className="text-center col-span-1">
                <h1 className="font-bold text-lg tracking-wider">HOSPITAL CIVIL DE GUADALAJARA</h1>
                <h2 className="font-bold text-base">PEDIDO AL ALMACEN VIVERES</h2>
              </div>
              <div className="flex justify-end" />
            </header>

            {/* --- METADATOS --- */}
            <section className="grid grid-cols-2 text-sm pb-2 mb-2 border-b-2 border-black">
              <div className="space-y-1">
                <p><span className="font-bold">Partida Presupuestal:</span> 2212</p>
                <p><span className="font-bold">FECHA:</span> {formatDate(salida.timestamp_generacion)}</p>
                <p><span className="font-bold">SERVICIO:</span> {salida.nombre_servicio.toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-bold">Unidad Hospitalaria:</span> Fray Antonio Alcalde</p>
                <p><span className="font-bold">CUENTA:</span></p>
              </div>
            </section>

            {/* --- TABLA PRINCIPAL --- */}
            <main className="min-h-[550px]">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-2 border-black">
                    <th className="border-x border-black p-1 font-bold w-[10%]">CÓDIGO</th>
                    <th className="border-x border-black p-1 font-bold w-[35%]">DESCRIPCIÓN DEL ARTÍCULO</th>
                    <th className="border-x border-black p-1 font-bold w-[8%]">UNIDAD</th>
                    <th className="border-x border-black p-1 font-bold w-[10%]">CANTIDAD PEDIDA</th>
                    <th className="border-x border-black p-1 font-bold w-[10%]">CANTIDAD SURTIDA</th>
                    <th className="border-x border-black p-1 font-bold w-[27%]">CANTIDAD SURTIDA CON LETRA/ OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 15 }).map((_, index) => {
                    const item = detalles[index];
                    const contract = item ? contratosMap.get(item.id_articulo) : null;
                    return (
                      <tr key={index} className="border-2 border-black">
                        <td className="border-x border-black p-1 text-center h-10">{contract?.codigo_articulo || ''}</td>
                        <td className="border-x border-black p-1">{contract?.descripcion_articulo || ''}</td>
                        <td className="border-x border-black p-1 text-center">{contract?.unidad_medida || ''}</td>
                        <td className="border-x border-black p-1 text-center font-bold">{item?.cantidad || ''}</td>
                        <td className="border-x border-black p-1"></td>
                        <td className="border-x border-black p-1"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </main>

            {/* --- PIE DE PÁGINA CON FIRMAS --- */}
            <footer className="pt-4 text-[10px]">
              <table className="w-full border-collapse border-2 border-black">
                <thead>
                  <tr>
                    <th className="border border-black p-1 font-bold w-1/4">JEFE DE SERVICIO {salida.nombre_servicio.toUpperCase()}</th>
                    <th className="border border-black p-1 font-bold w-1/4">ALMACÉN DE VÍVERES</th>
                    <th className="border border-black p-1 font-bold w-1/4">ENTREGADO POR</th>
                    <th className="border border-black p-1 font-bold w-1/4">RECIBIDO POR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b-2 border-black">
                    <td className="border border-black h-20"></td>
                    <td className="border border-black h-20"></td>
                    <td className="border border-black h-20"></td>
                    <td className="border border-black h-20"></td>
                  </tr>
                  <tr>
                    <td className="p-1 text-center font-bold">NOMBRE Y FIRMA</td>
                    <td className="p-1 text-center font-bold">NOMBRE Y FIRMA</td>
                    <td className="p-1 text-center font-bold">NOMBRE Y RUD</td>
                    <td className="p-1 text-center font-bold">NOMBRE Y RUD</td>
                  </tr>
                </tbody>
              </table>
            </footer>
          </div>
        </div>
      </div>

      {/* Estilos específicos para impresión */}
      <style>{`
        .printable-area {
            font-family: 'Tinos', 'Times New Roman', serif;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .printable-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
          table {
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
          }
        }
      `}</style>
    </>
  );
};

export default PrintableDispatch;
