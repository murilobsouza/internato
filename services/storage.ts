
import { CheckinRecord, CheckinConfig } from '../types';

const RECORDS_KEY = 'checkin_records_v1';
const CONFIG_KEY = 'checkin_config_v1';

export const storage = {
  getRecords: (): CheckinRecord[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRecord: (record: CheckinRecord) => {
    const records = storage.getRecords();
    records.push(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  deleteRecord: (id: string) => {
    const records = storage.getRecords();
    const updatedRecords = records.filter(r => r.id !== id);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
  },

  getConfig: (): CheckinConfig => {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : {
      checkin_enabled: true,
      updated_at: new Date().toISOString(),
      updated_by: 'system'
    };
  },

  saveConfig: (config: CheckinConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  hasRecordToday: (matricula: string): CheckinRecord | undefined => {
    const today = new Date().toISOString().split('T')[0];
    const records = storage.getRecords();
    return records.find(r => r.matricula === matricula && r.data === today);
  }
};
