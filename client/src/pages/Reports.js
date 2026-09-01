import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'daily') {
        const data = await api.getDailyReport(date);
        setReportData(data);
      } else if (reportType === 'monthly') {
        const data = await api.getMonthlyReport(month, year);
        setReportData(data);
      } else if (reportType === 'customer' && selectedCustomer) {
        const data = await api.getCustomerReport(selectedCustomer, startDate, endDate);
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div className="card">
        <div className="report-tabs">
          <button 
            className={`tab ${reportType === 'daily' ? 'active' : ''}`}
            onClick={() => setReportType('daily')}
          >
            Daily Report
          </button>
          <button 
            className={`tab ${reportType === 'monthly' ? 'active' : ''}`}
            onClick={() => setReportType('monthly')}
          >
            Monthly Report
          </button>
          <button 
            className={`tab ${reportType === 'customer' ? 'active' : ''}`}
            onClick={() => setReportType('customer')}
          >
            Customer Report
          </button>
        </div>

        <div className="report-filters">
          {reportType === 'daily' && (
            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="form-row">
              <div className="form-group">
                <label>Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {reportType === 'customer' && (
            <>
              <div className="form-group">
                <label>Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            className="btn btn-primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <h3>Total Milk Sold</h3>
              <div className="value">{reportData.totalMilk || reportData.totalMilk || 0} L</div>
            </div>
            <div className="stat-card orange">
              <h3>Total Revenue</h3>
              <div className="value">₹{reportData.totalRevenue || reportData.totalBilled || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Amount Collected</h3>
              <div className="value">₹{reportData.totalCollected || reportData.totalPaid || 0}</div>
            </div>
            <div className="stat-card orange">
              <h3>Pending Amount</h3>
              <div className="value">₹{reportData.pending || 0}</div>
            </div>
          </div>

          {reportData.sales?.length > 0 && (
            <div className="card">
              <h2 className="section-title">Sales Details</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Quantity (L)</th>
                      <th>Rate</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.sales.map(sale => (
                      <tr key={sale._id}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.customer?.name}</td>
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
            </div>
          )}

          {reportData.customerSummary?.length > 0 && (
            <div className="card">
              <h2 className="section-title">Customer Summary</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Total Milk (L)</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.customerSummary.map((cust, i) => (
                      <tr key={i}>
                        <td>{cust.name}</td>
                        <td>{cust.phone}</td>
                        <td>{cust.totalMilk} L</td>
                        <td>₹{cust.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportData.payments?.length > 0 && (
            <div className="card">
              <h2 className="section-title">Payments</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.payments.map(payment => (
                      <tr key={payment._id}>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>{payment.customer?.name}</td>
                        <td>₹{payment.amount}</td>
                        <td>{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
