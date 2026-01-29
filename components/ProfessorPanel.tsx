
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import { CheckinRecord, CheckinConfig } from '../types';

type ViewMode = 'day' | 'month' | 'year';
type SortMode = 'name_asc' | 'date_desc' | 'date_asc';

const ProfessorPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [config, setConfig] = useState<CheckinConfig>(storage.getConfig());
  const [records, setRecords] = useState<CheckinRecord[]>(storage.getRecords());
  
  // State for filtering and sorting
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // YYYY
  const [sortMode, setSortMode] = useState<SortMode>('date_desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'professor' && password === '2020') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas. Tente novamente.');
    }
  };

  const toggleCheckin = (enabled: boolean) => {
    const newConfig: CheckinConfig = {
      checkin_enabled: enabled,
      updated_at: new Date().toISOString(),
      updated_by: 'professor'
    };
    storage.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja apagar o registro de ${name}?`)) {
      storage.deleteRecord(id);
      setRecords(storage.getRecords());
    }
  };

  // Memoized filtered and sorted records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(r => {
      // 1. Period Filter
      const date = new Date(r.timestamp);
      if (viewMode === 'day') {
        return r.data === selectedDate;
      } else if (viewMode === 'month') {
        return r.data.startsWith(selectedMonth);
      } else if (viewMode === 'year') {
        return date.getFullYear().toString() === selectedYear;
      }
      return true;
    });

    // 2. Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.nome_completo.toLowerCase().includes(lowerSearch) || 
        r.matricula.includes(searchTerm)
      );
    }

    // 3. Sorting
    return [...filtered].sort((a, b) => {
      if (sortMode === 'name_asc') {
        return a.nome_completo.localeCompare(b.nome_completo);
      } else if (sortMode === 'date_desc') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortMode === 'date_asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });
  }, [records, viewMode, selectedDate, selectedMonth, selectedYear, sortMode, searchTerm]);

  const exportToCSV = () => {
    if (filteredAndSortedRecords.length === 0) return;

    const headers = ['Data', 'Hora', 'Nome Completo', 'Matricula', 'Status', 'IP', 'Dispositivo'];
    const rows = filteredAndSortedRecords.map(r => [
      r.data,
      r.hora,
      r.nome_completo,
      r.matricula,
      r.status,
      r.ip,
      r.device_hint
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `presencas_export_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setRecords(storage.getRecords());
  }, [config]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Acesso do Professor</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Usuário</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {loginError && <p className="text-red-600 text-sm font-medium">{loginError}</p>}
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AREA A: Controle */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Controle do Check-in</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.checkin_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {config.checkin_enabled ? 'HABILITADO' : 'DESABILITADO'}
            </span>
            <span className="text-sm text-slate-500 italic">Atualizado em: {new Date(config.updated_at).toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleCheckin(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${config.checkin_enabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              disabled={config.checkin_enabled}
            >
              Habilitar
            </button>
            <button
              onClick={() => toggleCheckin(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!config.checkin_enabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              disabled={!config.checkin_enabled}
            >
              Desabilitar
            </button>
          </div>
        </div>
      </section>

      {/* AREA B: Relatório Avançado */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800">Visualização de Registros</h3>
            <button
              onClick={exportToCSV}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors text-sm"
            >
              Exportar Lista Atual (CSV)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            {/* Period Toggle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Período</label>
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="w-full p-2 border rounded-md text-sm outline-none bg-white"
              >
                <option value="day">Diário</option>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
              </select>
            </div>

            {/* Date Picker based on mode */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Seleção</label>
              {viewMode === 'day' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm outline-none bg-white"
                />
              )}
              {viewMode === 'month' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm outline-none bg-white"
                />
              )}
              {viewMode === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm outline-none bg-white"
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Sorting */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ordenar por</label>
              <select 
                value={sortMode} 
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full p-2 border rounded-md text-sm outline-none bg-white"
              >
                <option value="date_desc">Data de Registro (Mais recente)</option>
                <option value="date_asc">Data de Registro (Mais antiga)</option>
                <option value="name_asc">Nome do Aluno (A-Z)</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Buscar Aluno</label>
              <input
                type="text"
                placeholder="Nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md text-sm outline-none bg-white"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Hora</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Nome Completo</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Matrícula</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-center">Auditoria</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map(r => (
                  <tr key={r.id} className="border-b hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{r.hora}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.nome_completo}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{r.matricula}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" title={`${r.ip} | ${r.device_hint}`}>
                        INFO OK
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteRecord(r.id, r.nome_completo)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        title="Apagar registro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os critérios selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center text-sm">
          <div className="text-slate-500">
            Mostrando <strong>{filteredAndSortedRecords.length}</strong> registros
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 font-bold">
            Total na Visualização: {filteredAndSortedRecords.length}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessorPanel;
