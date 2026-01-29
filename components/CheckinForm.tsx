
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CheckinRecord } from '../types';

const CheckinForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const config = storage.getConfig();
    setIsEnabled(config.checkin_enabled);
  }, []);

  const validateName = (name: string) => {
    return name.trim().split(/\s+/).length >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isEnabled) {
      setMessage({ text: 'Registro de presença indisponível no momento. Procure o professor.', type: 'error' });
      return;
    }

    if (!validateName(nome)) {
      setMessage({ text: 'Por favor, insira o nome completo (pelo menos duas palavras).', type: 'error' });
      return;
    }

    if (!matricula.trim()) {
      setMessage({ text: 'O número de matrícula é obrigatório.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const existing = storage.hasRecordToday(matricula);
      if (existing) {
        setMessage({ 
          text: `Já existe um registro para esta matrícula hoje às ${existing.hora}.`, 
          type: 'error' 
        });
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      const timestamp = now.toISOString();
      const dateStr = timestamp.split('T')[0];
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Simulate technical info capture
      const newRecord: CheckinRecord = {
        id: crypto.randomUUID(),
        nome_completo: nome.trim(),
        matricula: matricula.trim(),
        timestamp,
        data: dateStr,
        hora: timeStr,
        ip: '127.0.0.1 (simulado)', // Em um ambiente real, o IP seria pego no backend
        user_agent: navigator.userAgent,
        device_hint: `${navigator.platform} / ${navigator.vendor || 'N/A'}`,
        status: 'registrado'
      };

      storage.saveRecord(newRecord);

      setMessage({ 
        text: `Presença registrada com sucesso em ${new Date(dateStr).toLocaleDateString('pt-BR')} às ${timeStr}.`, 
        type: 'success' 
      });
      setNome('');
      setMatricula('');
    } catch (err) {
      setMessage({ text: 'Não foi possível registrar agora. Tente novamente ou contate o professor.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-red-100 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Check-in Desativado</h2>
        <p className="text-slate-600">Registro de presença indisponível no momento. Procure o professor.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-8 bg-white rounded-xl shadow-lg border border-indigo-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Registro de Presença</h2>
      
      {message && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Ex: João Silva Santos"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Número de Matrícula</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Digite sua matrícula"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-500 border border-slate-100">
          <strong>Aviso de Privacidade:</strong> Serão armazenados nome, matrícula, data/hora e informações técnicas do acesso (ex.: IP e navegador) para auditoria de presença.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Enviar Presença'}
        </button>
      </form>
    </div>
  );
};

export default CheckinForm;
