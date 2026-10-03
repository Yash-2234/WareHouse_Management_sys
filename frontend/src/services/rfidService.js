import api from './api';

export const rfidService = {
  getTags: async (params) => {
    const res = await api.get('/rfid', { params });
    return res.data;
  },

  getTagById: async (id) => {
    const res = await api.get(`/rfid/${id}`);
    return res.data;
  },

  registerTag: async (tagData) => {
    const res = await api.post('/rfid', tagData);
    return res.data;
  },

  updateTag: async (id, tagData) => {
    const res = await api.put(`/rfid/${id}`, tagData);
    return res.data;
  },

  deleteTag: async (id) => {
    const res = await api.delete(`/rfid/${id}`);
    return res.data;
  },

  scanRFID: async (scannedValue, readerId = 'READER-GATEWAY-01') => {
    const res = await api.post('/rfid/scan', { scannedValue, readerId });
    return res.data;
  },

  getScans: async (limit = 50) => {
    const res = await api.get('/rfid/scans', { params: { limit } });
    return res.data;
  }
};
