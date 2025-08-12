import { useAppStore } from '../store';
import { PedidoLog, PlanificacionData, MealType, UsuarioConfig } from '../types';

export function usePedidos() {
  const appData = useAppStore(state => state.appData);
  const setAppData = useAppStore(state => state.setAppData);
  const currentUser = useAppStore(state => state.currentUser) as UsuarioConfig;

  function crearPedidos(data: PlanificacionData) {
    if (!currentUser || !appData) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const newPedidos: PedidoLog[] = [];
    Object.entries(data).forEach(([itemId, days]) => {
      Object.entries(days).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([meal, quantity]) => {
          if (quantity > 0) {
            newPedidos.push({
              id_pedido: `PED-${Date.now()}-${Math.random()}`,
              timestamp_envio: new Date().toISOString(),
              id_usuario: currentUser.id_usuario,
              id_articulo: itemId,
              fecha_programada: new Date(year, month, parseInt(day)).toISOString(),
              tipo_comida: meal as MealType,
              cantidad: quantity,
            });
          }
        });
      });
    });
    setAppData(prevData => prevData ? { ...prevData, pedidos: [...prevData.pedidos, ...newPedidos] } : null);
  }

  return { crearPedidos };
}
