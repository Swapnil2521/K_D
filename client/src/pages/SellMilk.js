import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './SellMilk.css';

const SellMilk = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [ratePerLitre, setRatePerLitre] = useState('');
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      setCustomersLoading(false);
    } catch (err) {
      console.error(err);
      setCustomersLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setRatePerLitre(customer.ratePerLitre);
    }
  };

  const totalAmount = (quantity * ratePerLitre).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.addSale({
        customer: selectedCustomer,
        quantity: parseFloat(quantity),
        ratePerLitre: parseFloat(ratePerLitre),
        totalAmount: parseFloat(totalAmount),
        paymentStatus: 'Pending'
      });
      
      alert('Sale recorded successfully!');
      navigate('/bills');
    } catch (err) {
      alert('Error recording sale');
    }
    setLoading(false);
  };

  if (customersLoading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="sell-milk-page">
      <div className="page-header">
        <h1>Sell Milk</h1>
      </div>

      <div className="card sell-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={handleCustomerChange}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity (Litres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Rate per Litre (₹)</label>
              <input
                type="number"
                step="0.01"
                value={ratePerLitre}
                onChange={(e) => setRatePerLitre(e.target.value)}
                placeholder="Rate"
                required
              />
            </div>
          </div>

          <div className="total-display">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">₹{totalAmount}</span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary sell-btn"
            disabled={loading || !selectedCustomer || !quantity}
          >
            {loading ? 'Recording...' : 'Record Sale'}
          </button>
        </form>
      </div>

      {customers.length === 0 && (
        <div className="card">
          <p className="no-data">
            No customers found. <a href="/customers">Add a customer first</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default SellMilk;
