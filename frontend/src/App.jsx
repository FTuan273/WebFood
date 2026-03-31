import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';

// Merchant Components
import MerchantLayout from './components/MerchantLayout';
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantOrders from './pages/merchant/Orders';
import MerchantMenu from './pages/merchant/Menu';
import MerchantStoreInfo from './pages/merchant/StoreInfo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="restaurants" element={<Restaurants />} />
        </Route>

        {/* Merchant Section */}
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route index element={<MerchantDashboard />} />
          <Route path="orders" element={<MerchantOrders />} />
          <Route path="menu" element={<MerchantMenu />} />
          <Route path="store" element={<MerchantStoreInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
