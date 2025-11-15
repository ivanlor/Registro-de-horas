import React, { useState } from 'react';
import type { TimeRecord, NewTimeRecord } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TimeRecordForm } from './components/TimeRecordForm';
import { RecentRecordsTable } from './components/RecentRecordsTable';
import { LogoIcon } from './components/icons';

// URL del script de Google.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygt8_3nGfCvNh4jH_89GmbEZ-ObwdB8V1V1dDm5NQWg2dAULlXUc_oyNe2bi3ukk0y/exec';

export default function App() {
  const [records, setRecords] = useLocalStorage<TimeRecord[]>('timeRecords', []);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (newRecord: NewTimeRecord) => {
    setIsLoading(true);
    setError(null);
    
    const recordWithId: TimeRecord = {
      ...newRecord,
      id: crypto.randomUUID(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    try {
      const registrationDate = new Date(recordWithId.timestamp);
      const formattedRegistrationDate = `${registrationDate.getDate()}-${registrationDate.getMonth() + 1}-${registrationDate.getFullYear()} ${String(registrationDate.getHours()).padStart(2, '0')}:${String(registrationDate.getMinutes()).padStart(2, '0')}`;

      const payload = {
        "action": "add",
        "ID": recordWithId.id, // Se añade el ID único al payload
        "F. Inicio": recordWithId.startDate,
        "F. Fin": recordWithId.endDate,
        "H. Inicio": recordWithId.startTime,
        "H. Fin": recordWithId.endTime,
        "Actuación": recordWithId.description,
        "Horas": recordWithId.calculatedHours,
        "Nombre": recordWithId.name,
        "Observaciones": recordWithId.observations || '',
        "F. Registro": formattedRegistrationDate,
      };
      
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      setRecords(prev => [{ ...recordWithId, status: 'success' }, ...prev]);
      
    } catch (err) {
      console.error('Failed to send data:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error al enviar el registro. Por favor, inténtalo de nuevo. (${errorMessage})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    setDeletingId(recordId);
    setError(null);

    try {
      // El payload para eliminar ahora es mucho más simple y fiable.
      // Solo necesita la acción y el ID único del registro a eliminar.
      const deletePayload = {
        action: 'delete',
        id: recordId,
      };

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(deletePayload),
      });

      // Si la petición no falla, eliminamos el registro del estado local.
      setRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (err) {
      console.error('Failed to delete data:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error al eliminar el registro. Por favor, inténtalo de nuevo. (${errorMessage})`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800 font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <LogoIcon />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Registro de Horas por Período</h1>
            </div>
            <p className="text-slate-600">Introduce el inicio y el fin de tu actuación. Las horas se calcularán automáticamente.</p>
        </header>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <TimeRecordForm onSubmit={handleSubmit} isLoading={isLoading} />
        
        <RecentRecordsTable records={records} onDelete={handleDelete} deletingId={deletingId} />

      </div>
    </div>
  );
}