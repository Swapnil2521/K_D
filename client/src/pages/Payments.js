import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Payments.css';

const Payments = () => {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    paymentMethod: 'Cash',
    note: ''
  });
  const [customerStatus, setCustomerStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersData, paymentsData] = await Promise.all([
        api.getCustomers(),
        api.getPayments()
      ]);
      setCustomers(customersData);
      setPayments(paymentsData);
      
      // Fetch status for each customer
      const statusMap = {};
      for (const customer of customersData) {
        const sales = await api.getSales({ customerId: customer._id });
        const customerPayments = paymentsData.filter(p => p.customer?._id === customer._id);
        
        const totalBilled = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);
        const pending = totalBilled - totalPaid;
        
        let status = 'Pending';
        if (pending <= 0 && totalBilled > 0) status = 'Paid';
        else if (totalPaid > 0) status = 'Partial';
        
        statusMap[customer._id] = { totalBilled, totalPaid, pending, status };
      }
      setCustomerStatus(statusMap);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addPayment({
        customer: formData.customer,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        note: formData.note
      });
      setShowModal(false);
      setFormData({ customer: '', amount: '', paymentMethod: 'Cash', note: '' });
      fetchData();
    } catch (err) {
      alert('Error recording payment');
    }
  };

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Payments</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Payment
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Customer Payment Status</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Billed</th>
                <th>Total Paid</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const status = customerStatus[customer._id] || {};
                return (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>₹{status.totalBilled || 0}</td>
                    <td>₹{status.totalPaid || 0}</td>
                    <td>₹{status.pending || 0}</td>
                    <td>
                      <span className={`badge badge-${(status.status || 'pending').toLowerCase()}`}>
                        {status.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Recent Payments</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map(payment => (
                <tr key={payment._id}>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>{payment.customer?.name}</td>
                  <td>₹{payment.amount}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.note || '-'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No payments recorded</td>
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
              <h2>Add Payment</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note (Optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Any note"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
