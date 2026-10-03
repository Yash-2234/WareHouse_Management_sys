import api from './api';

export const inventoryService = {
  getInventory: async (params) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },

  stockIn: async (data) => {
    const res = await api.post('/inventory/stock-in', data);
    return res.data;
  },

  stockOut: async (data) => {
    const res = await api.post('/inventory/stock-out', data);
    return res.data;
  },

  transfer: async (data) => {
    const res = await api.post('/inventory/transfer', data);
    return res.data;
  },

  adjust: async (data) => {
    const res = await api.post('/inventory/adjust', data);
    return res.data;
  },

  getMovements: async () => {
    const res = await api.get('/movements');
    return res.data;
  }
};
