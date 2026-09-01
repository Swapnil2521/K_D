import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="logo">🥛</span>
        <span className="brand-text">Milk Shop</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Customers
        </NavLink>
        <NavLink to="/sell" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Sell Milk
        </NavLink>
        <NavLink to="/bills" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Bills
        </NavLink>
        <NavLink to="/payments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Payments
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Reports
        </NavLink>
      </div>
      <button className="btn-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
