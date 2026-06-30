# EV Charging Station Platform

A full-stack web application for finding, booking, and managing Electric Vehicle (EV) charging stations. Built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time updates.

## Features

- **User Authentication**: Secure login and registration with JWT and bcrypt.
- **Find Stations**: Interactive map using Leaflet to locate nearby EV charging stations.
- **Real-time Slot Availability**: Live updates of charging slot status using Socket.io.
- **Booking System**: Reserve charging slots in advance.
- **Admin Dashboard**: Manage stations, slots, and view analytics/bookings.
- **Responsive Design**: Mobile-friendly UI built with React Bootstrap and Framer Motion.

## Technology Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Maps**: Leaflet & React-Leaflet
- **Styling**: Bootstrap, React Bootstrap, Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Helmet, Express Rate Limit, CORS
- **Email Services**: Nodemailer / Resend

## Project Structure

The project is structured into two main directories:

- `/frontend`: Contains the React application.
- `/backend`: Contains the Node.js/Express API.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas URI)

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd EV-charging-website
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (or the port provided by Vite).
2. Register a new account or log in.
3. Browse the map to find charging stations and book available slots.

## License

This project is licensed under the ISC License.
