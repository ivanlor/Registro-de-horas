import React from 'react';
import type { TimeRecord } from '../types';
import { TrashIcon } from './icons';

interface RecentRecordsTableProps {
  records: TimeRecord[];
  onDelete: (recordId: string) => void;
  deletingId: string | null;
}

const formatTimestamp = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Failed to format timestamp", e);
    return isoString;
  }
};

const formatDateOnly = (dateString: string): string => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};


export const RecentRecordsTable: React.FC<RecentRecordsTableProps> = ({ records, onDelete, deletingId }) => {
  const successfulRecords = records.filter(r => r.status === 'success');
  const headers = ['F. INICIO', 'F. FIN', 'H. INICIO', 'H. FIN', 'ACTUACIÓN', 'HORAS', 'NOMBRE', 'OBSERVACIONES', 'FECHA REGISTRO', 'ACCIÓN'];
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 mt-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Últimos Registros Enviados (Copia Local)</h2>
        
        {successfulRecords.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Cuando envíes un registro exitoso, aparecerá aquí.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-indigo-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {successfulRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-indigo-50/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateOnly(record.startDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateOnly(record.endDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.startTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.endTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.calculatedHours.toLocaleString('es-ES')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{record.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.observations || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatTimestamp(record.timestamp)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => onDelete(record.id)}
                                        disabled={deletingId === record.id}
                                        className="text-slate-500 hover:text-red-600 disabled:text-slate-400 disabled:cursor-wait transition-colors p-1 rounded-full"
                                        aria-label={`Eliminar registro de ${record.description}`}
                                    >
                                        {deletingId === record.id ? (
                                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : <TrashIcon className="h-5 w-5" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};