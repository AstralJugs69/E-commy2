import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import the layout
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
// Import other pages as needed

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> {/* Apply layout to all routes */}
          {/* Index route for the homepage */}
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          {/* Order Success page - needs parameter later */}
          <Route path="order/success/:orderId" element={<OrderSuccessPage />} />
          {/* Add other routes like product detail later */}

          {/* Optional: Catch-all within layout? Or handle outside? */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
        {/* Add routes outside the main layout if needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
