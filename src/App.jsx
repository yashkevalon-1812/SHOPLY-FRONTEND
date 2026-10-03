import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CompareFloatingBar } from './components/common/CompareFloatingBar';
import { CompareModal } from './components/product/CompareModal';

// Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SellerLogin } from './pages/SellerLogin';
import { SellerRegister } from './pages/SellerRegister';
import { ForgotPassword } from './pages/ForgotPassword';
import { Offers } from './pages/Offers';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminSellerProducts } from './pages/admin/AdminSellerProducts';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminAddProduct } from './pages/admin/AdminAddProduct';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminRegister } from './pages/admin/AdminRegister';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminMegaSale } from './pages/admin/AdminMegaSale';
import { AdminBroadcast } from './pages/admin/AdminBroadcast';

// Seller Pages 
import { SellerLayout } from './pages/seller/SellerLayout';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProducts } from './pages/seller/SellerProducts';
import { SellerAddProduct } from './pages/seller/SellerAddProduct';
import { SellerCoupons } from './pages/seller/SellerCoupons';
import { SellerOrders } from './pages/seller/SellerOrders';

// Public Layout wrapper with Navbar and Footer
const StorefrontLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CompareFloatingBar />
      <CompareModal />
    </div>
  );
};

// 404 Page
const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-[#0b1120] text-zinc-900 dark:text-white text-center px-4 transition-colors">
    <h1 className="text-6xl font-black text-blue-600 mb-2">404</h1>
    <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">Page Not Found in Store</h2>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
      The requested destination does not exist or has been relocated to another gallery.
    </p>
    <a href="/" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md">
      Return to Home
    </a>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <BrowserRouter>
                <Routes>
                  {/* Storefront Layout */}
                  <Route element={<StorefrontLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:id" element={<OrderSuccess />} />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/coupons" element={<Offers />} />
      <Route path="/login" element={<Login />} />
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller/register" element={<SellerRegister />} />
      <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Portal (Protected) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="broadcast" element={<AdminBroadcast />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="mega-sale" element={<AdminMegaSale />} />
                  <Route path="sellers" element={<AdminSellers />} />
                  <Route path="seller-products" element={<AdminSellerProducts />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminAddProduct />} />
                  <Route path="products/edit/:id" element={<AdminAddProduct />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="messages" element={<AdminMessages />} />
                </Route>

                {/* Seller Studio (Protected) */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute role="seller">
                      <SellerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<SellerDashboard />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="products/new" element={<SellerAddProduct />} />
                  <Route path="products/edit/:id" element={<SellerAddProduct />} />
                  <Route path="coupons" element={<SellerCoupons />} />
                  <Route path="discounts" element={<SellerCoupons />} />
                  <Route path="orders" element={<SellerOrders />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);
}

export default App;
