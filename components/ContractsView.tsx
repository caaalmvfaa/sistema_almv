import React, { useMemo, useState } from 'react';
import { ContratoItem } from '../types';
import { SearchIcon } from './icons';
import { Card } from './ui';

// Componente para la barra de progreso corregida
const ConsumptionBar: React.FC<{ value: number }> = ({ value }) => {
  const getBarColor = () => {
    if (value >= 90) return "bg-rose-500";
    if (value >= 70) return "bg-amber-500";
    return "bg-teal-500";
  };
  const cappedValue = Math.min(value, 100); // Evitar valores por encima del 100%
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
        style={{ width: `${cappedValue}%` }}
      ></div>
    </div>
  );
};

// Componente de tarjeta de contrato (sin cambios lógicos)
const ContractCard: React.FC<{ contract: ContratoItem; style: React.CSSProperties }> = ({ contract, style }) => {
  const max = contract.cantidad_maxima || 1; // Evitar división por cero
  const consumption = (contract.cantidad_consumida / max) * 100;
  const isAvailable = contract.cantidad_disponible > 0;
  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all duration-300 hover:shadow-2xl hover:border-teal-300 hover:-translate-y-2 transform"
      style={style}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${isAvailable ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
          {isAvailable ? "Activo" : "Agotado"}
        </span>
        <span 
          className="text-xs font-medium text-slate-400 truncate max-w-[100px]" 
          title={contract.grupo_articulo}
        >
          {contract.grupo_articulo}
        </span>
      </div>
      
      <h3 
        className="text-lg font-bold text-slate-800 mb-2 truncate h-7" 
        title={contract.descripcion_articulo}
      >
        {contract.descripcion_articulo}
      </h3>

      <div className="flex items-baseline justify-between mb-4 text-sm">
        <div>
          <span className="text-slate-600">Disponible:</span>
          <span className={`ml-1.5 font-extrabold text-2xl ${isAvailable ? 'text-slate-700' : 'text-rose-600'}`}>
            {contract.cantidad_disponible.toLocaleString()}
          </span>
          <span className="text-slate-500 ml-1">{contract.unidad_medida}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <p className="text-slate-500 text-xs font-medium">Consumo Contrato:</p>
          <p className="text-slate-500 text-xs font-mono">{consumption.toFixed(0)}%</p>
        </div>
        <ConsumptionBar value={consumption} />
      </div>
      
      <div className="text-xs text-slate-400 mt-4 border-t border-slate-200 pt-3 font-mono">
        <p className="truncate" title={contract.id_contrato}>
          Contrato: {contract.id_contrato}
        </p>
        <p>Artículo: {contract.codigo_articulo}</p>
      </div>
    </div>
  );
};

const ContractsView: React.FC<{ contratos: ContratoItem[] }> = ({ contratos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLicitacion, setSelectedLicitacion] = useState('all');
  const [selectedProveedor, setSelectedProveedor] = useState('all');
  const [selectedContrato, setSelectedContrato] = useState('all');

  // Opciones únicas para los filtros
  const { licitaciones, proveedores, contratosOptions } = useMemo(() => {
    const licitacionSet = new Set<string>();
    const proveedorSet = new Set<string>();
    const contratoSet = new Set<string>();

    contratos.forEach(c => {
      c.id_licitacion && licitacionSet.add(c.id_licitacion);
      c.id_proveedor && proveedorSet.add(c.id_proveedor);
      c.id_contrato && contratoSet.add(c.id_contrato);
    });

    return {
      licitaciones: Array.from(licitacionSet).sort(),
      proveedores: Array.from(proveedorSet).sort(),
      contratosOptions: Array.from(contratoSet).sort(),
    };
  }, [contratos]);

  // Lógica de filtrado y agrupación
  const groupedAndFilteredContracts = useMemo(() => {
    const filtered = contratos.filter(c => {
      const lowercasedTerm = searchTerm.toLowerCase();
      return (
        (searchTerm === '' || 
          c.descripcion_articulo.toLowerCase().includes(lowercasedTerm) || 
          c.codigo_articulo.toLowerCase().includes(lowercasedTerm)) &&
        (selectedLicitacion === 'all' || c.id_licitacion === selectedLicitacion) &&
        (selectedProveedor === 'all' || c.id_proveedor === selectedProveedor) &&
        (selectedContrato === 'all' || c.id_contrato === selectedContrato)
      );
    });

    // Agrupar solo si no hay un proveedor seleccionado
    if (selectedProveedor !== 'all') {
      const group = filtered.length > 0 ? { [selectedProveedor]: filtered } : {};
      return group;
    }

    return filtered.reduce<Record<string, ContratoItem[]>>(
      (acc, contract) => {
        const key = contract.id_proveedor || 'Sin Proveedor';
        acc[key] = acc[key] || [];
        acc[key].push(contract);
        return acc;
      },
      {}
    );
  }, [contratos, searchTerm, selectedLicitacion, selectedProveedor, selectedContrato]);

  return (
    <div className="animate-fade-in-up">
      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900">Panel de Contratos</h2>
        <p className="text-slate-500 text-lg mt-1">Filtre, agrupe y explore los insumos de forma interactiva.</p>
      </div>

      {/* Panel de Filtros (sticky) */}
      <Card className="p-4 mb-8 sticky top-4 z-30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Buscador */}
          <div className="relative md:col-span-1">
            <SearchIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Buscar insumo..." 
              className="w-full bg-slate-50 rounded-lg border-transparent pl-10 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* Selectores de Filtros */}
          <select 
            value={selectedProveedor} 
            onChange={e => setSelectedProveedor(e.target.value)} 
            className="w-full bg-slate-50 rounded-lg border-transparent px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">Todos los Proveedores</option>
            {proveedores.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select 
            value={selectedLicitacion} 
            onChange={e => setSelectedLicitacion(e.target.value)} 
            className="w-full bg-slate-50 rounded-lg border-transparent px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">Todas las Licitaciones</option>
            {licitaciones.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select 
            value={selectedContrato} 
            onChange={e => setSelectedContrato(e.target.value)} 
            className="w-full bg-slate-50 rounded-lg border-transparent px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">Todos los Contratos</option>
            {contratosOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Renderizado de Grupos y Tarjetas */}
      <div className="space-y-10">
        {Object.keys(groupedAndFilteredContracts).sort().map(groupName => {
          const contractsGroup = groupedAndFilteredContracts[groupName];
          if (contractsGroup.length === 0) return null;
          return (
            <div key={groupName} className="animate-fade-in-up">
              {/* Encabezado del Grupo */}
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                <h3 className="text-2xl font-bold text-slate-700">{groupName}</h3>
                <span className="text-sm font-semibold bg-slate-200 text-slate-600 rounded-full px-3 py-1">
                  {contractsGroup.length} insumos
                </span>
              </div>

              {/* Grid de Tarjetas */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
                {contractsGroup.map((contract, index) => (
                  <ContractCard 
                    key={contract.id_articulo} 
                    contract={contract} 
                    style={{ animationDelay: `${index * 40}ms` }} 
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Mensaje de No Resultados */}
        {Object.keys(groupedAndFilteredContracts).length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <p className="font-semibold text-slate-600 text-lg">No se encontraron resultados</p>
            <p className="mt-1 text-sm text-slate-500">Pruebe a cambiar o eliminar algunos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsView;