import { useAppStore } from '../store';
import { SalidaGenerada, EstadoSalida, MealType, UsuarioConfig } from '../types';

export function useSalidas() {
  const appData = useAppStore(state => state.appData);
  const setAppData = useAppStore(state => state.setAppData);
  const currentUser = useAppStore(state => state.currentUser) as UsuarioConfig;

  function generarSalida(day: number, meal: MealType) {
    if (!currentUser || !appData) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const targetDate = new Date(year, month, day);
    const relevantPedidos = appData.pedidos.filter(p => {
      const pedidoDate = new Date(p.fecha_programada);
      return p.id_usuario === currentUser.id_usuario &&
        pedidoDate.getDate() === targetDate.getDate() &&
        pedidoDate.getMonth() === targetDate.getMonth() &&
        pedidoDate.getFullYear() === targetDate.getFullYear() &&
        p.tipo_comida === meal;
    });
    if (relevantPedidos.length === 0) return;
    const detalleArticulos = relevantPedidos.map(p => ({
      id_articulo: p.id_articulo,
      cantidad: p.cantidad
    }));
    const newSalida: SalidaGenerada = {
      id_salida: `SAL-${Date.now()}`,
      timestamp_generacion: new Date().toISOString(),
      id_usuario_solicitante: currentUser.id_usuario,
      nombre_servicio: currentUser.nombre_servicio_asignado,
      fecha_salida: targetDate.toISOString(),
      tipo_comida: meal,
      detalle_articulos: JSON.stringify(detalleArticulos),
      estado_salida: EstadoSalida.PENDIENTE
    };
    setAppData(prevData => prevData ? { ...prevData, salidas: [newSalida, ...prevData.salidas] } : null);
  }

  return { generarSalida };
}
