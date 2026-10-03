import api from './api';

export const reportService = {
  getDashboardAnalytics: async () => {
    const res = await api.get('/reports/dashboard');
    return res.data;
  },

  getInventoryReport: async () => {
    const res = await api.get('/reports/inventory');
    return res.data;
  },

  getMovementReport: async () => {
    const res = await api.get('/reports/movement');
    return res.data;
  },

  getRfidReport: async () => {
    const res = await api.get('/reports/rfid');
    return res.data;
  }
};

export const userService = {
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};

export const activityService = {
  getActivityLogs: async (limit = 100) => {
    const res = await api.get('/activity', { params: { limit } });
    return res.data;
  }
};
