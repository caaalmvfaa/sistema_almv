
export const DOCUMENT_TEXT = `
title: 'Diseño de Sistema de Gestión de Pedidos y Salidas de Víveres'
document_type: 'Diseño de Base de Datos y Procesos'
summary: 'Define la estructura de datos y el flujo de proceso para automatizar la programación mensual de pedidos y la generación de salidas operativas. Incluye un modelo multi-usuario con preparación dinámica de hojas, un flujo de envío transaccional, un log de pedidos para consolidación y la generación de solicitudes de salida por día, turno y servicio asignado.'
tags:
  - inventario
  - planificación
  - salidas
  - google-sheets
  - diseño-db
  - multi-usuario
  - event-driven
---


# Sistema de Gestión de Pedidos y Salidas de Víveres


---


## Objetivo


Automatizar el ciclo completo de planificación y solicitud de insumos. El sistema abarca desde la preparación dinámica de hojas de planificación para 5 usuarios, pasando por un envío transaccional de sus requerimientos, la consolidación para compras, y finalmente, la generación de solicitudes de **salida** operativas por día, turno y servicio asignado a cada usuario.


---


## Flujo de Proceso Propuesto


1.  **Preparación de Hoja de Planificación (Automático)**: Un proceso (\`prepararHojasDiarias()\`) se ejecuta periódicamente. Lee la hoja \`01_Contratos\`, filtra los artículos con \`cantidad_disponible > 0\` y puebla dinámicamente la lista de artículos en las hojas de planificación de cada uno de los 5 usuarios (ej. \`02_01_ProgDiaria_Usuario1\`). Esto asegura que los usuarios solo puedan planificar sobre artículos disponibles.


2.  **Planificación Diaria por Usuario**: Cada usuario rellena las cantidades requeridas para cada día y turno en su hoja de planificación personal.


3.  **Envío de Planificación (Acción de Usuario)**: Una vez finalizada su planificación, el usuario hace clic en un botón de menú personalizado ("Enviar Planificación Mensual"). Esto ejecuta la función \`enviarProgramacionUsuario()\`.


4.  **Registro de Planificación**: La función \`enviarProgramacionUsuario()\` lee los datos de la hoja del usuario, los transforma a un formato de log y los inserta como nuevos registros en la hoja \`05_RegistroPedidos_Usuario\`. Esta hoja actúa como un log transaccional inmutable de toda la planificación enviada.


5.  **Limpieza de Hoja de Planificación**: Tras registrar exitosamente la planificación en el log, la función borra las cantidades de la hoja del usuario, dejándola limpia para el siguiente ciclo y previniendo envíos duplicados.


6.  **Generación de Salida (Acción de Usuario)**: En cualquier momento, el usuario puede generar una solicitud de salida para un día y turno específicos. A través de un menú ("Generar Salida"), selecciona el día y el turno (ej. "Día 1 - Desayuno"). Esto ejecuta la función \`generarSalidaServicio()\`.


7.  **Registro de Salida**: La función \`generarSalidaServicio()\`:
    *   Identifica al usuario activo y busca su servicio asignado en \`09_Configuracion_Usuarios\` (ej. "Pacientes").
    *   Consulta el log \`05_RegistroPedidos_Usuario\` para obtener todos los artículos y cantidades que ese usuario planificó para el día y turno seleccionados.
    *   Crea un nuevo registro único en la hoja \`08_Salidas_Generadas\`, detallando el servicio, la fecha, el turno y un listado (en formato \`JSON\`) de los artículos y cantidades solicitados. Esta hoja es la que el almacén utilizará para surtir los pedidos.


8.  **Consolidación para Compras (Automático)**: De forma paralela e independiente al flujo de salidas, un proceso de consolidación lee el log \`05_RegistroPedidos_Usuario\` para generar las hojas de reporte \`06_ConsolidadoMensual_Usuario\` y \`07_ProgramacionGeneral_Consolidada\`, que se usan para la gestión de compras a largo plazo.


---


## Entidades de Datos (Hojas)


### \`01_Contratos\`
**Propósito**: Repositorio central de información sobre contratos, proveedores y artículos disponibles.


| Campo | Descripción |
| :--- | :--- |
| \`id_articulo\` | Identificador único del artículo (PK). |
| \`id_licitacion\` | Identificador del proceso de licitación asociado. |
| \`id_contrato\` | Identificador del contrato bajo el cual se adquiere el artículo. |
| \`id_proveedor\` | Identificador del proveedor. |
| \`codigo_articulo\` | Código interno o de catálogo del artículo. |
| \`descripcion_articulo\` | Nombre o descripción completa del artículo. |
| \`unidad_medida\` | Unidad en la que se mide el artículo (ej. KG, PZA, LT). |
| \`grupo_articulo\` | Categoría a la que pertenece el artículo (ej. Lácteos, Abarrotes). |
| \`precio_unitario\` | Costo del artículo por \`unidad_medida\` según el contrato. |
| \`cantidad_maxima\` | Cantidad máxima del artículo que puede ser solicitada bajo el contrato. |
| \`cantidad_consumida\` | Cantidad acumulada del artículo que ya ha sido solicitada. |
| \`cantidad_disponible\` | Cantidad restante del artículo (\`cantidad_maxima\` - \`cantidad_consumida\`). |


### \`02_ProgramacionDiaria_Usuario\` (Plantilla)
**Propósito**: Plantilla para la hoja de trabajo de cada usuario. Su lista de artículos (filas) es poblada dinámicamente por un script basado en la disponibilidad en \`01_Contratos\`. Existirán 5 instancias (ej. \`02_01_ProgDiaria_Usuario1\`).


| Campo | Descripción |
| :--- | :--- |
| \`id_articulo\` | Identificador único del artículo (FK a \`01_Contratos\`). |
| \`grupo_articulo\` | Categoría del artículo (para facilitar el filtrado). |
| \`codigo_articulo\` | Código del artículo. |
| \`descripcion_articulo\` | Nombre del artículo. |
| \`unidad_medida\` | Unidad de medida del artículo. |
| \`dia_XX_desayuno\` | Cantidad requerida para el desayuno del día \`XX\` (donde \`XX\` es de \`01\` a \`31\`). |
| \`dia_XX_comida\` | Cantidad requerida para la comida del día \`XX\`. |
| \`dia_XX_cena\` | Cantidad requerida para la cena del día \`XX\`. |
| \`total_articulo\` | Suma total de las cantidades del artículo para todo el mes. |


### \`05_RegistroPedidos_Usuario\` (Log Transaccional de Planificación)
**Propósito**: Actúa como un log inmutable de toda la planificación enviada por los usuarios. Es la fuente de verdad para las consolidaciones de compra y para la generación de salidas.


| Campo | Descripción |
| :--- | :--- |
| \`id_pedido\` | Identificador único de la fila del pedido (PK). |
| \`timestamp_envio\` | Fecha y hora exactas en que el usuario envió la planificación. |
| \`id_usuario\` | Identificador del usuario que envió la planificación. |
| \`id_articulo\` | Identificador del artículo planificado. |
| \`fecha_programada\` | La fecha para la cual se planificó el artículo (ej. '2023-10-25'). |
| \`tipo_comida\` | Turno de la comida (ej. 'Desayuno', 'Comida', 'Cena'). |
| \`cantidad\` | La cantidad planificada del artículo. |


### \`06_ConsolidadoMensual_Usuario\` (Reporte de Planificación)
**Propósito**: Hoja de reporte generada automáticamente a partir de \`05_RegistroPedidos_Usuario\` que consolida las necesidades de un único usuario por artículo y por día totalizado. Existirán 5 instancias.


| Campo | Descripción |
| :--- | :--- |
| \`id_articulo\` | Identificador único del artículo. |
| \`dia_01\` | Suma total del artículo planificado por el usuario para el día 1 (Des+Com+Cen). |
| \`...\` | ... (El patrón de columnas \`dia_XX\` se repite hasta \`dia_31\`). |


### \`07_ProgramacionGeneral_Consolidada\` (Reporte de Planificación)
**Propósito**: Hoja de reporte final, generada automáticamente a partir de \`05_RegistroPedidos_Usuario\`, que consolida las necesidades de los 5 usuarios para la gestión de compras.


| Campo | Descripción |
| :--- | :--- |
| \`id_articulo\` | Identificador único del artículo. |
| \`dia_01\` | Suma total del artículo planificado por **todos** los usuarios para el día 1. |
| \`...\` | ... (El patrón de columnas \`dia_XX\` se repite hasta \`dia_31\`). |


### \`08_Salidas_Generadas\` (NUEVO - Log de Salidas Operativas)
**Propósito**: Log transaccional de todas las solicitudes de salida generadas por los usuarios. Esta es la hoja que consume el área de Almacén para surtir.


| Campo | Descripción |
| :--- | :--- |
| \`id_salida\` | Identificador único de la solicitud de salida (PK). |
| \`timestamp_generacion\` | Fecha y hora exactas en que se generó la solicitud. |
| \`id_usuario_solicitante\` | Identificador del usuario que generó la salida. |
| \`nombre_servicio\` | Nombre del servicio al que se destina la salida (ej. "Pacientes"). |
| \`fecha_salida\` | Fecha para la cual se solicita la entrega (ej. '2023-10-25'). |
| \`tipo_comida\` | Turno de la comida para la cual se solicita la entrega. |
| \`detalle_articulos\` | Un objeto \`JSON\` con la lista de artículos y cantidades. \`[{"id_articulo": "123", "cantidad": 10}, {"id_articulo": "456", "cantidad": 5}]\` |
| \`estado_salida\` | Estado del proceso de surtido (ej. \`PENDIENTE\`, \`EN_PROCESO\`, \`SURTIDA\`). |


### \`09_Configuracion_Usuarios\` (NUEVO - Mapeo de Servicios)
**Propósito**: Tabla de configuración para mapear a cada usuario con su servicio asignado.


| Campo | Descripción |
| :--- | :--- |
| \`id_usuario\` | Identificador único del usuario (PK). |
| \`nombre_usuario\` | Nombre completo del usuario. |
| \`email_usuario\` | Email del usuario, usado para \`Session.getActiveUser().getEmail()\`. |
| \`nombre_servicio_asignado\` | El único servicio que este usuario puede solicitar (ej. "Pacientes", "Comedor Empleados"). |

`;
