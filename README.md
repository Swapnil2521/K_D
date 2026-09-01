# Milk Selling Management System

A complete Milk Selling Management System built with React.js, Node.js/Express, and MongoDB.

## Features

- **Login System** - Secure login with hardcoded credentials
- **Dashboard** - Overview of today's sales, revenue, and customers
- **Customer Management** - Add, edit, delete, and search customers
- **Sell Milk** - Record milk sales with auto-calculation
- **Bills** - View and print customer bills
- **Payments** - Record payments and track status
- **Reports** - Daily, monthly, and customer-wise reports

## Credentials

- **Username:** Panu
- **Password:** Panu@123

## Project Structure

```
K_D/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api.js
│   └── package.json
└── server/          # Node.js Backend
    ├── models/
    ├── routes/
    ├── middleware/
    └── server.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or Atlas URI)

### 1. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 2. Start Backend Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend
```bash
cd client
npm install
npm start
# App runs on http://localhost:3000
```

## API Endpoints

### Auth
- POST `/api/auth/login` - Login

### Customers
- GET `/api/customers` - Get all customers
- POST `/api/customers` - Add customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer

### Sales
- GET `/api/sales` - Get all sales
- GET `/api/sales/today` - Get today's sales
- POST `/api/sales` - Add sale

### Payments
- GET `/api/payments` - Get all payments
- POST `/api/payments` - Add payment

### Reports
- GET `/api/reports/daily` - Daily report
- GET `/api/reports/monthly` - Monthly report
- GET `/api/reports/customer/:id` - Customer report

## Tech Stack

- **Frontend:** React.js, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)

## Theme

- Blue + White + Soft Orange
- Clean, minimal, responsive design
