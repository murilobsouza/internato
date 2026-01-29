
export interface CheckinRecord {
  id: string;
  nome_completo: string;
  matricula: string;
  timestamp: string; // ISO 8601
  data: string;      // YYYY-MM-DD
  hora: string;      // HH:MM
  ip: string;
  user_agent: string;
  device_hint: string;
  status: 'registrado' | 'duplicado';
}

export interface CheckinConfig {
  checkin_enabled: boolean;
  updated_at: string;
  updated_by: string;
}

export type UserRole = 'ALUNO' | 'PROFESSOR';
