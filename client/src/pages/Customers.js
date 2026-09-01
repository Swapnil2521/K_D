import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    milkType: 'Cow',
    ratePerLitre: 50
  });
  const [viewHistory, setViewHistory] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers(search);
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer._id, formData);
      } else {
        await api.addCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', address: '', milkType: 'Cow', ratePerLitre: 50 });
      loadCustomers();
    } catch (err) {
      alert('Error saving customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      milkType: customer.milkType || 'Cow',
      ratePerLitre: customer.ratePerLitre || 50
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        alert('Error deleting customer');
      }
    }
  };

  const viewCustomerHistory = async (customer) => {
    try {
      const data = await api.getSales({ customerId: customer._id });
      setHistory(data);
      setViewHistory(customer);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '', milkType: 'Cow', ratePerLitre: 50 });
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Milk Type</th>
                <th>Rate/L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address || '-'}</td>
                  <td>{customer.milkType}</td>
                  <td>₹{customer.ratePerLitre}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => viewCustomerHistory(customer)}
                      >
                        History
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(customer._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Milk Type</label>
                  <select
                    value={formData.milkType}
                    onChange={(e) => setFormData({...formData, milkType: e.target.value})}
                  >
                    <option value="Cow">Cow</option>
                    <option value="Buffalo">Buffalo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Rate per Litre (₹)</label>
                  <input
                    type="number"
                    value={formData.ratePerLitre}
                    onChange={(e) => setFormData({...formData, ratePerLitre: e.target.value})}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewHistory && (
        <div className="modal-overlay" onClick={() => setViewHistory(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sales History - {viewHistory.name}</h2>
              <button className="modal-close" onClick={() => setViewHistory(null)}>×</button>
            </div>
            {history.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Qty (L)</th>
                      <th>Rate</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(sale => (
                      <tr key={sale._id}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.quantity}</td>
                        <td>₹{sale.ratePerLitre}</td>
                        <td>₹{sale.totalAmount}</td>
                        <td>
                          <span className={`badge badge-${sale.paymentStatus.toLowerCase()}`}>
                            {sale.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No sales history</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
