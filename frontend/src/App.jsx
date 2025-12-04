import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import CheckoutPage from "./pages/CheckoutPage";
import StudentDashboard from "./pages/moltaqa/StudentDashboard";
import EditProfile from "./pages/moltaqa/EditProfile";
import MatchResults from "./pages/moltaqa/MatchResults";
import PublicStudentProfile from "./pages/moltaqa/PublicStudentProfile";
import ConversationsList from "./pages/moltaqa/messages/ConversationsList";
import ChatWindow from "./pages/moltaqa/messages/ChatWindow";

function App() {
        const user = useUserStore((state) => state.user);
        const checkAuth = useUserStore((state) => state.checkAuth);
        const checkingAuth = useUserStore((state) => state.checkingAuth);
        const initializeCart = useCartStore((state) => state.initializeCart);
        const getCartItems = useCartStore((state) => state.getCartItems);

        useEffect(() => {
                checkAuth();
        }, [checkAuth]);

        useEffect(() => {
                initializeCart();
        }, [initializeCart]);

        useEffect(() => {
                if (user) {
                        getCartItems();
                }
        }, [getCartItems, user]);

        if (checkingAuth) {
                return <LoadingSpinner />;
        }

        return (
                <div className='relative min-h-screen bg-payzone-navy text-payzone-white'>
                        <div className='relative z-50 pt-20'>
                                <Navbar />
                                <Routes>
                                        <Route path='/' element={<HomePage />} />
                                        <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
                                        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
                                        <Route
                                                path='/secret-dashboard'
                                                element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
                                        />
                                        <Route path='/category/:category' element={<CategoryPage />} />
                                        <Route path='/products/:id' element={<ProductDetailPage />} />
                                        <Route path='/search' element={<SearchPage />} />
                                        <Route path='/cart' element={<CartPage />} />
                                        <Route path='/checkout' element={<CheckoutPage />} />
                                        <Route path='/purchase-success' element={<PurchaseSuccessPage />} />
                                        <Route path='/purchase-cancel' element={<PurchaseCancelPage />} />
                                        <Route path='/moltaqa/dashboard' element={<StudentDashboard />} />
                                        <Route path='/moltaqa/profile/edit' element={<EditProfile />} />
                                        <Route path='/moltaqa/matches' element={<MatchResults />} />
                                        <Route path='/moltaqa/student/:userId' element={<PublicStudentProfile />} />
                                        <Route path='/moltaqa/messages' element={<ConversationsList />} />
                                        <Route path='/moltaqa/messages/:conversationId' element={<ChatWindow />} />
                                </Routes>
                        </div>
                        <Toaster />
                        <Footer />
                </div>
        );
}

export default App;
