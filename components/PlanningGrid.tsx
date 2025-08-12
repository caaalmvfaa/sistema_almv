import React, { useState, useCallback, useMemo } from 'react';
import { ContratoItem, PlanificacionData, MEALS, MealType } from '../types';
import { Button } from './ui';
import { SearchIcon } from './icons'; // Asegúrate de tener un icono de búsqueda en icons.tsx

const PlanningGrid: React.FC<{
  contracts: ContratoItem[];
  onSubmit: (data: PlanificacionData) => void;
  isLoading: boolean;
}> = ({ contracts, onSubmit, isLoading }) => {
  const [planningData, setPlanningData] = useState<PlanificacionData>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica para días del mes y fines de semana
  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return {
        day,
        isWeekend: date.getDay() === 0 || date.getDay() === 6, // Domingo (0) o Sábado (6)
      };
    });
  }, []);

  // Manejo de cambios en las cantidades
  const handleQuantityChange = useCallback(
    (itemId: string, day: number, meal: MealType, value: string) => {
      const quantity = parseInt(value, 10);
      setPlanningData((prevData) => ({
        ...prevData,
        [itemId]: {
          ...prevData[itemId],
          [day]: {
            ...prevData[itemId]?.[day],
            [meal]: isNaN(quantity) || quantity < 0 ? 0 : quantity,
          },
        },
      }));
    },
    []
  );

  // Envío de datos
  const handleSubmit = () => {
    onSubmit(planningData);
    setPlanningData({});
  };

  // Filtros y datos disponibles
  const availableContracts = useMemo(
    () => contracts.filter((c) => c.cantidad_disponible > 0),
    [contracts]
  );

  const filteredContracts = useMemo(() => {
    if (!searchTerm) return availableContracts;
    return availableContracts.filter((c) =>
      c.descripcion_articulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      c.codigo_articulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableContracts, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Planificación Mensual</h1>
        <p className="text-zinc-500 mt-1">Rellene las cantidades requeridas para cada día y turno.</p>
      </div>

      <div className="relative overflow-x-auto bg-white border border-zinc-200/80 rounded-xl shadow-lg shadow-zinc-900/5">
        <table className="min-w-full text-sm text-left text-zinc-600 border-collapse">
          <thead className="bg-zinc-50/80 text-xs text-zinc-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-4 sticky left-0 bg-inherit z-20 min-w-[280px] border-r border-zinc-200/80 font-medium"
              >
                Artículo
              </th>
              {monthDays.map(({ day, isWeekend }) => (
                <th
                  key={day}
                  scope="col"
                  colSpan={3}
                  className={`py-2 px-2 text-center border-l border-zinc-200/80 font-semibold text-zinc-700 ${isWeekend ? 'bg-zinc-100/80' : ''}`}
                >
                  Día {day}
                </th>
              ))}
            </tr>
            <tr>
              <th
                scope="col"
                className="py-2 px-4 sticky left-0 bg-inherit z-20 border-r border-zinc-200/80"
              ></th>
              {monthDays.flatMap(({ day, isWeekend }) =>
                MEALS.map((meal) => (
                  <th
                    key={`${day}-${meal}`}
                    scope="col"
                    className={`py-1.5 px-2 text-center font-normal border-l border-b border-zinc-200/80 w-20 
                      ${isWeekend ? 'bg-zinc-100/50' : ''}
                      ${meal === 'Desayuno' ? 'border-t-2 border-t-amber-300' : ''}
                      ${meal === 'Comida' ? 'border-t-2 border-t-sky-300' : ''}
                      ${meal === 'Cena' ? 'border-t-2 border-t-indigo-300' : ''}
                    `}
                  >
                    {meal[0]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {filteredContracts.map((item) => (
              <tr
                key={item.id_articulo}
                className="even:bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors duration-150"
              >
                <td
                  className="py-2.5 px-4 font-semibold text-zinc-800 sticky left-0 bg-inherit z-10 min-w-[280px] border-r border-zinc-200/80"
                >
                  {item.descripcion_articulo}
                  <span className="block text-xs text-zinc-400 font-normal mt-0.5">
                    {item.codigo_articulo} - {item.unidad_medida}
                  </span>
                </td>
                {monthDays.flatMap(({ day, isWeekend }) =>
                  MEALS.map((meal) => {
                    const value = planningData[item.id_articulo]?.[day]?.[meal] || 0;
                    return (
                      <td
                        key={`${day}-${meal}`}
                        className={`p-1 border-l border-zinc-200/80 align-middle transition-colors duration-200 group/cell hover:bg-indigo-50/50 ${isWeekend ? 'bg-zinc-100/50' : ''}`}
                      >
                        <input
                          type="number"
                          min="0"
                          className={`w-16 h-10 text-center rounded-md border transition-all duration-200 [appearance:textfield] 
                            [&::-webkit-outer-spin-button]:appearance-none 
                            [&::-webkit-inner-spin-button]:appearance-none
                            ${value > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold' : 'bg-transparent border-zinc-300/80 text-zinc-700'}
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white
                            group-hover/cell:border-indigo-300`}
                          value={value === 0 ? '' : value}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id_articulo,
                              day,
                              meal,
                              e.target.value
                            )
                          }
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                        />
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContracts.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="font-semibold text-lg">No hay artículos disponibles para la planificación</p>
            <p className="text-sm mt-1">Verifique los contratos o ajuste su búsqueda.</p>
          </div>
        )}
      </div>

      {/* Panel de acciones flotante */}
      <div className="sticky bottom-4 mt-6 z-20 flex justify-center">
        <div className="bg-white/80 backdrop-blur-lg border border-zinc-200/80 rounded-xl shadow-2xl p-2.5 flex items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <SearchIcon className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/50 border border-zinc-300/80 rounded-lg pl-10 pr-4 py-2 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-colors duration-200"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(planningData).length === 0}
            variant="primary-glow"
          >
            {isLoading ? 'Enviando...' : 'Enviar Planificación'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanningGrid;