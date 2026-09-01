import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [todayData, setTodayData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesData, customerData] = await Promise.all([
        api.getTodaySales(),
        api.getCustomers()
      ]);
      setTodayData(salesData);
      setCustomers(customerData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="date-text">{today}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Today's Milk Sold</h3>
          <div className="value">{todayData?.totalQuantity || 0} L</div>
          <div className="sub">{todayData?.totalSales || 0} sales today</div>
        </div>
        
        <div className="stat-card orange">
          <h3>Today's Revenue</h3>
          <div className="value">₹{todayData?.totalAmount || 0}</div>
          <div className="sub">From today's sales</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="value">{customers.length}</div>
          <div className="sub">Active customers</div>
        </div>
        
        <div className="stat-card orange">
          <h3>Pending Payments</h3>
          <div className="value">
            {todayData?.sales?.filter(s => s.paymentStatus !== 'Paid').length || 0}
          </div>
          <div className="sub">Customers with dues</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Recent Sales Today</h2>
        {todayData?.sales?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Rate/L</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayData.sales.map(sale => (
                  <tr key={sale._id}>
                    <td>{sale.customer?.name}</td>
                    <td>{sale.quantity} L</td>
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
          <p className="no-data">No sales recorded today</p>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <a href="/sell" className="action-btn">
            <span className="action-icon">🛒</span>
            <span>Sell Milk</span>
          </a>
          <a href="/customers" className="action-btn">
            <span className="action-icon">👥</span>
            <span>Add Customer</span>
          </a>
          <a href="/payments" className="action-btn">
            <span className="action-icon">💰</span>
            <span>Record Payment</span>
          </a>
          <a href="/reports" className="action-btn">
            <span className="action-icon">📊</span>
            <span>View Reports</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
