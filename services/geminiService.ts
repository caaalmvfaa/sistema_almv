import { ContratoItem, PedidoLog, SalidaGenerada, UsuarioConfig, AppData } from '../types';

/**
 * Maps a raw data object from contracts.json to the ContratoItem interface.
 * @param item - The raw object from the JSON file.
 * @param index - The index of the item, used for a fallback ID.
 * @returns A formatted ContratoItem object.
 */
const mapContractData = (item: any, index: number): ContratoItem => ({
    id_articulo: String(item["Código Producto"] || `art-id-${index}`),
    id_licitacion: item["Licitacion"] || 'N/A',
    id_contrato: item["Contrato"] || 'N/A',
    id_proveedor: item["Proveedor"] || 'N/A',
    codigo_articulo: String(item["Código Producto"] || 'N/A'),
    descripcion_articulo: item["Descripción"] || 'Sin descripción',
    unidad_medida: item["Unidad"] || 'N/A',
    grupo_articulo: item["Grupo"] || 'Sin grupo',
    precio_unitario: Number(item["Precio Unitario"]) || 0,
    cantidad_maxima: Number(item["Cantidad Maxima"]) || 0,
    cantidad_consumida: Number(item["Cantidad Consumida"]) || 0,
    cantidad_disponible: Number(item["Cantidad Disponible"]) || 0,
});

/**
 * Provides a static list of users for the application.
 * @returns An array of UsuarioConfig objects.
 */
const getUsers = (): UsuarioConfig[] => [
    { id_usuario: 'USR01', nombre_usuario: 'Nutriologa 1', email_usuario: 'ana.garcia@hospital.com', nombre_servicio_asignado: 'Pacientes' },
    { id_usuario: 'USR02', nombre_usuario: 'Nutriologa 2', email_usuario: 'luis.hernandez@hospital.com', nombre_servicio_asignado: 'Comedor' },
    { id_usuario: 'USR03', nombre_usuario: 'Nutriologa 3', email_usuario: 'maria.martinez@hospital.com', nombre_servicio_asignado: 'Jornada' },
    { id_usuario: 'USR04', nombre_usuario: 'Administrador', email_usuario: 'jose.rodriguez@hospital.com', nombre_servicio_asignado: 'Almacen de Viveres' },
    { id_usuario: 'USR05', nombre_usuario: 'Almacenista', email_usuario: 'sofia.perez@hospital.com', nombre_servicio_asignado: 'Almacen de Viveres' },
];

/**
 * Loads and prepares the initial application data from local JSON files.
 * This function has been refactored to use the fetch API to avoid
 * module resolution issues with local JSON files.
 * @returns A promise that resolves with the initial AppData.
 */
export const generateInitialData = async (): Promise<AppData> => {
    // Use fetch to load the JSON data from a path relative to the public root.
    const response = await fetch('/data/contracts.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch contracts data: ${response.status} ${response.statusText}`);
    }
    const typedContractsData: any[] = await response.json();
    
    const data: AppData = {
        contratos: typedContractsData.map(mapContractData),
        usuarios: getUsers(),
        pedidos: [],
        salidas: [],
    };

    return data;
};