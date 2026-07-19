import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AIAssistantDrawer from './components/AIAssistantDrawer.jsx';

// Pages
import Home from './pages/Home.jsx';
import SearchResults from './pages/SearchResults.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        
        {/* Core Layout Navbar */}
        <Navbar />

        {/* Floating AI assistant widget available globally */}
        <AIAssistantDrawer />

        {/* Router Pages viewport */}
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Private Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;
