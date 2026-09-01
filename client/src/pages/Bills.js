import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Bills.css';

const Bills = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(true);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesData, customersData] = await Promise.all([
        api.getSales(),
        api.getCustomers()
      ]);
      setSales(salesData);
      setCustomers(customersData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredSales = selectedCustomer 
    ? sales.filter(s => s.customer?._id === selectedCustomer)
    : sales;

  // Group sales by customer
  const customerBills = {};
  filteredSales.forEach(sale => {
    const custId = sale.customer?._id;
    if (!custId) return;
    
    if (!customerBills[custId]) {
      customerBills[custId] = {
        customer: sale.customer,
        totalMilk: 0,
        totalAmount: 0,
        paidAmount: 0,
        sales: [],
        status: 'Pending'
      };
    }
    customerBills[custId].totalMilk += sale.quantity;
    customerBills[custId].totalAmount += sale.totalAmount;
    customerBills[custId].paidAmount += sale.paidAmount || 0;
    customerBills[custId].sales.push(sale);
  });

  // Calculate status for each customer
  Object.values(customerBills).forEach(bill => {
    const pending = bill.totalAmount - bill.paidAmount;
    if (pending <= 0) bill.status = 'Paid';
    else if (bill.paidAmount > 0) bill.status = 'Partial';
    else bill.status = 'Pending';
  });

  const bills = Object.values(customerBills);

  const handlePrint = (bill) => {
    setPrintBill(bill);
    setTimeout(() => window.print(), 100);
  };

  if (loading) return <div className="loading">Loading bills...</div>;

  return (
    <div className="bills-page">
      <div className="page-header">
        <h1>Bills</h1>
        <select 
          className="filter-select"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">All Customers</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total Milk (L)</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.customer._id}>
                <td>{bill.customer.name}</td>
                <td>{bill.customer.phone}</td>
                <td>{bill.totalMilk} L</td>
                <td>₹{bill.totalAmount}</td>
                <td>₹{bill.paidAmount}</td>
                <td>₹{bill.totalAmount - bill.paidAmount}</td>
                <td>
                  <span className={`badge badge-${bill.status.toLowerCase()}`}>
                    {bill.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => setPrintBill(bill)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-orange"
                      onClick={() => handlePrint(bill)}
                    >
                      Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan="8" className="no-data">No bills found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {printBill && (
        <div className="modal-overlay" onClick={() => setPrintBill(null)}>
          <div className="modal bill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bill-print">
              <div className="bill-header">
                <h2>🥛 Milk Shop</h2>
                <p>Bill</p>
              </div>
              <div className="bill-info">
                <p><strong>Customer:</strong> {printBill.customer.name}</p>
                <p><strong>Phone:</strong> {printBill.customer.phone}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Qty (L)</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {printBill.sales.map(sale => (
                    <tr key={sale._id}>
                      <td>{new Date(sale.date).toLocaleDateString()}</td>
                      <td>{sale.quantity}</td>
                      <td>₹{sale.ratePerLitre}</td>
                      <td>₹{sale.totalAmount}</td>
                      <td>{sale.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bill-summary">
                <p><strong>Total Milk:</strong> {printBill.totalMilk} L</p>
                <p><strong>Total Amount:</strong> ₹{printBill.totalAmount}</p>
                <p><strong>Paid:</strong> ₹{printBill.paidAmount}</p>
                <p><strong>Pending:</strong> ₹{printBill.totalAmount - printBill.paidAmount}</p>
              </div>
              <div className="bill-actions no-print">
                <button className="btn btn-primary" onClick={() => window.print()}>
                  Print Bill
                </button>
                <button className="btn btn-outline" onClick={() => setPrintBill(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
