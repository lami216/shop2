import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TutorProfilePage from "./pages/TutorProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LegacyHomePage from "./pages/LegacyHomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import CheckoutPage from "./pages/CheckoutPage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
        const user = useUserStore((state) => state.user);
        const checkAuth = useUserStore((state) => state.checkAuth);
        const checkingAuth = useUserStore((state) => state.checkingAuth);
        const initializeCart = useCartStore((state) => state.initializeCart);
        const getCartItems = useCartStore((state) => state.getCartItems);

        useEffect(() => {
                document.title = "ملتقى Moltaqa";
        }, []);

        useEffect(() => {
                checkAuth();
        }, [checkAuth]);

        useEffect(() => {
                initializeCart();
        }, [initializeCart]);

        useEffect(() => {
                if (!user) return;

                getCartItems();
        }, [getCartItems, user]);

	if (checkingAuth) return <LoadingSpinner />;

        return (
                <div className='relative min-h-screen bg-[#040107] text-kingdom-charcoal'>
                        <Navbar />
                        <div className='relative z-40 pt-20 lg:pt-24'>
                                <Routes>
                                        <Route path='/' element={<HomePage />} />
                                        <Route path='/search' element={<SearchPage />} />
                                        <Route path='/student/profile' element={<StudentProfilePage />} />
                                        <Route path='/tutor/profile' element={<TutorProfilePage />} />
                                        <Route path='/admin' element={<AdminDashboardPage />} />

                                        {/* TODO: legacy e-commerce entry point */}
                                        <Route path='/legacy-store' element={<LegacyHomePage />} />
                                        <Route path='/signup' element={!user ? <RegisterPage /> : <Navigate to='/' />} />
                                        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
                                        <Route
                                                path='/secret-dashboard'
                                                element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
                                        />
                                        <Route path='/category/:category' element={<CategoryPage />} />
                                        <Route path='/products/:id' element={<ProductDetailPage />} />
                                        <Route path='/cart' element={<CartPage />} />
                                        <Route path='/checkout' element={<CheckoutPage />} />
                                        <Route path='/purchase-success' element={<PurchaseSuccessPage />} />
                                        <Route path='/purchase-cancel' element={<PurchaseCancelPage />} />
                                        <Route path='/chat' element={<ChatPage />} />
                                        <Route path='*' element={<NotFoundPage />} />
                                </Routes>
                        </div>
                        <Toaster />
                        <Footer />
                </div>
        );
}

export default App;
