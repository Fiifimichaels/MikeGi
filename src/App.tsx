import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { VendorAuthProvider } from './contexts/VendorAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import RentCar from './pages/RentCar';
import RentHouse from './pages/RentHouse';
import OrderFood from './pages/OrderFood';
import ThankYou from './pages/ThankYou';
import About from './pages/About';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <VendorAuthProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  
                  {/* Vendor Routes */}
                  <Route path="/vendor/login" element={<VendorLogin />} />
                  <Route path="/vendor/register" element={<VendorRegister />} />
                  
                  {/* User Routes */}
                  <Route path="*" element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/rent-car" element={<RentCar />} />
                        <Route path="/rent-house" element={<RentHouse />} />
                        <Route path="/order-food" element={<OrderFood />} />
                        <Route path="/thank-you" element={<ThankYou />} />
                      </Routes>
                      <ChatBot />
                      <Footer />
                    </>
                  } />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </VendorAuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;