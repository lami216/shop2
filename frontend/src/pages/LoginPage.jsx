import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
        const navigate = useNavigate();
        const { login, user, loading } = useUserStore();
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        useEffect(() => {
                        // TODO: route based on role (student vs tutor vs admin dashboards)
                if (user) {
                        navigate("/");
                }
        }, [user, navigate]);

        const handleSubmit = (event) => {
                event.preventDefault();
                login({ email, password });
        };

        return (
                <div className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12'>
                        <h1 className='mb-6 text-3xl font-bold text-white'>Login – Moltaqa</h1>
                        <p className='mb-6 text-sm text-gray-300'>
                                Access your account to continue learning and teaching.
                        </p>
                        <form onSubmit={handleSubmit} className='space-y-4 rounded-lg bg-[#0e0a1a] p-6 shadow-lg'>
                                <div className='space-y-2'>
                                        <label className='block text-sm text-gray-200' htmlFor='email'>
                                                Email
                                        </label>
                                        <input
                                                id='email'
                                                type='email'
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                                className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                        />
                                </div>
                                <div className='space-y-2'>
                                        <label className='block text-sm text-gray-200' htmlFor='password'>
                                                Password
                                        </label>
                                        <input
                                                id='password'
                                                type='password'
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                required
                                                className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                        />
                                </div>
                                <button
                                        type='submit'
                                        className='w-full rounded-md bg-kingdom-gold px-4 py-2 font-semibold text-kingdom-charcoal transition hover:bg-amber-300'
                                        disabled={loading}
                                >
                                        {loading ? "Signing in..." : "Login"}
                                </button>
                        </form>
                        <div className='mt-4 text-sm text-gray-200'>
                                Need an account? <Link to='/signup' className='text-kingdom-gold underline'>Register</Link>
                        </div>
                </div>
        );
};

export default LoginPage;
