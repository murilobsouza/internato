
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import CheckinForm from './components/CheckinForm';
import ProfessorPanel from './components/ProfessorPanel';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-indigo-700 text-white shadow-md p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/checkin" className="text-xl font-bold tracking-tight">
              📍 Check-in de Presença
            </Link>
            <nav className="flex gap-4">
              <Link to="/checkin" className="hover:text-indigo-200 transition-colors">Aluno</Link>
              <Link to="/professor" className="hover:text-indigo-200 transition-colors">Professor</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/checkin" replace />} />
              <Route path="/checkin" element={<CheckinForm />} />
              <Route path="/professor" element={<ProfessorPanel />} />
              <Route path="*" element={<div className="text-center py-20">Página não encontrada.</div>} />
            </Routes>
          </div>
        </main>

        <footer className="bg-slate-100 border-t p-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Sistema de Frequência Acadêmica
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
