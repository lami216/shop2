import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";

const RegisterPage = () => {
        const navigate = useNavigate();
        const { signup, user, loading } = useUserStore();
        const [formData, setFormData] = useState({
                name: "",
                email: "",
                password: "",
                phone: "",
                gender: "",
                language: "ar",
                role: "student",
        });

        useEffect(() => {
                if (user) {
                        navigate("/");
                }
        }, [user, navigate]);

        const handleChange = (event) => {
                const { name, value } = event.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (event) => {
                event.preventDefault();
                signup(formData);
        };

        return (
                <div className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12'>
                        <h1 className='mb-6 text-3xl font-bold text-white'>Register – Moltaqa</h1>
                        <p className='mb-6 text-sm text-gray-300'>
                                Create your Moltaqa account. TODO enforce email verification and onboarding per role.
                        </p>
                        <form onSubmit={handleSubmit} className='space-y-4 rounded-lg bg-[#0e0a1a] p-6 shadow-lg'>
                                <div className='space-y-2'>
                                        <label className='block text-sm text-gray-200' htmlFor='name'>
                                                Name
                                        </label>
                                        <input
                                                id='name'
                                                name='name'
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                        />
                                </div>
                                <div className='space-y-2'>
                                        <label className='block text-sm text-gray-200' htmlFor='email'>
                                                Email
                                        </label>
                                        <input
                                                id='email'
                                                name='email'
                                                type='email'
                                                value={formData.email}
                                                onChange={handleChange}
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
                                                name='password'
                                                type='password'
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                        />
                                </div>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                                <label className='block text-sm text-gray-200' htmlFor='phone'>
                                                        Phone
                                                </label>
                                                <input
                                                        id='phone'
                                                        name='phone'
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                                />
                                        </div>
                                        <div className='space-y-2'>
                                                <label className='block text-sm text-gray-200' htmlFor='gender'>
                                                        Gender
                                                </label>
                                                <input
                                                        id='gender'
                                                        name='gender'
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className='w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white'
                                                />
                                        </div>
                                </div>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                                <label className='block text-sm text-gray-200' htmlFor='role'>
                                                        Role
                                                </label>
                                                <select
                                                        id='role'
                                                        name='role'
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        className='w-full rounded-md border border-gray-700 bg-[#0e0a1a] px-3 py-2 text-white'
                                                >
                                                        <option value='student'>Student</option>
                                                        <option value='tutor'>Tutor</option>
                                                        <option value='admin'>Admin</option>
                                                </select>
                                        </div>
                                        <div className='space-y-2'>
                                                <label className='block text-sm text-gray-200' htmlFor='language'>
                                                        Language
                                                </label>
                                                <select
                                                        id='language'
                                                        name='language'
                                                        value={formData.language}
                                                        onChange={handleChange}
                                                        className='w-full rounded-md border border-gray-700 bg-[#0e0a1a] px-3 py-2 text-white'
                                                >
                                                        <option value='ar'>Arabic</option>
                                                        <option value='fr'>French</option>
                                                        <option value='en'>English</option>
                                                </select>
                                        </div>
                                </div>
                                <button
                                        type='submit'
                                        className='w-full rounded-md bg-kingdom-gold px-4 py-2 font-semibold text-kingdom-charcoal transition hover:bg-amber-300'
                                        disabled={loading}
                                >
                                        {loading ? "Registering..." : "Create Account"}
                                </button>
                        </form>
                        <div className='mt-4 text-sm text-gray-200'>
                                Already have an account? <Link to='/login' className='text-kingdom-gold underline'>Login</Link>
                        </div>
                </div>
        );
};

export default RegisterPage;
