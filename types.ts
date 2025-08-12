
export interface ContratoItem {
  id_articulo: string;
  id_licitacion: string;
  id_contrato: string;
  id_proveedor: string;
  codigo_articulo: string;
  descripcion_articulo: string;
  unidad_medida: string;
  grupo_articulo: string;
  precio_unitario: number;
  cantidad_maxima: number;
  cantidad_consumida: number;
  cantidad_disponible: number;
}

export interface UsuarioConfig {
  id_usuario: string;
  nombre_usuario: string;
  email_usuario: string;
  nombre_servicio_asignado: string;
}

export interface PedidoLog {
  id_pedido: string;
  timestamp_envio: string;
  id_usuario: string;
  id_articulo: string;
  fecha_programada: string;
  tipo_comida: 'Desayuno' | 'Comida' | 'Cena';
  cantidad: number;
}

export enum EstadoSalida {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  SURTIDA = 'SURTIDA',
}

export interface SalidaGenerada {
  id_salida: string;
  timestamp_generacion: string;
  id_usuario_solicitante: string;
  nombre_servicio: string;
  fecha_salida: string;
  tipo_comida: 'Desayuno' | 'Comida' | 'Cena';
  detalle_articulos: string; // JSON string: '[{"id_articulo": "123", "cantidad": 10}]'
  estado_salida: EstadoSalida;
}

export interface AppData {
    contratos: ContratoItem[];
    usuarios: UsuarioConfig[];
    pedidos: PedidoLog[];
    salidas: SalidaGenerada[];
}

export interface PlanificacionData {
  [itemId: string]: {
    [day: number]: {
      [meal: string]: number;
    };
  };
}

export type MealType = 'Desayuno' | 'Comida' | 'Cena';
export type AppView = 'contracts' | 'planning' | 'dispatch' | 'user_report' | 'reports' | 'warehouse-calendar' | 'penalties';


export const MEALS: MealType[] = ['Desayuno', 'Comida', 'Cena'];

export enum DeliveryStatus {
  PENDIENTE = 'PENDIENTE',
  RECIBIDO = 'RECIBIDO',
  INCOMPLETO = 'INCOMPLETO',
  RECHAZADO = 'RECHAZADO',
}

export interface ConsolidatedDelivery {
  delivery_id: string;
  fecha_entrega: string;
  status: DeliveryStatus;
  items: {
    id_articulo: string;
    descripcion_articulo: string;
    codigo_articulo: string;
    unidad_medida: string;
    cantidad_programada: number;
    cantidad_recibida?: number;
  }[];
  observaciones?: string;
}

export enum ReportStatus {
  PENDIENTE_REVISION = 'Pendiente de Revisión',
  NOTIFICADO_PROVEEDOR = 'Proveedor Notificado',
  EN_DISPUTA = 'En Disputa',
  PENALIZACION_APLICADA = 'Penalización Aplicada',
  RESUELTO = 'Resuelto',
}

export interface NonComplianceReport {
  report_id: string;
  delivery_id: string;
  fecha_incidencia: string;
  id_proveedor: string;
  motivo: DeliveryStatus.RECHAZADO | DeliveryStatus.INCOMPLETO;
  observaciones: string;
  detalle_items: ConsolidatedDelivery['items'];
  status: ReportStatus;
}
