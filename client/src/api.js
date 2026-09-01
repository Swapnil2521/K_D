const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Customers
  getCustomers: async (search = '') => {
    const res = await fetch(`${API_URL}/customers?search=${search}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addCustomer: async (data) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateCustomer: async (id, data) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Sales
  getTodaySales: async () => {
    const res = await fetch(`${API_URL}/sales/today`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getSales: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/sales?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addSale: async (data) => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Payments
  getPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/payments?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addPayment: async (data) => {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Reports
  getDailyReport: async (date) => {
    const res = await fetch(`${API_URL}/reports/daily?date=${date}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getMonthlyReport: async (month, year) => {
    const res = await fetch(`${API_URL}/reports/monthly?month=${month}&year=${year}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getCustomerReport: async (customerId, startDate, endDate) => {
    let url = `${API_URL}/reports/customer/${customerId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await fetch(url, {
      headers: getHeaders()
    });
    return res.json();
  }
};
