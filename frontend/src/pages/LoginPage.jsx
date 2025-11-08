import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowLeft, Loader } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        const { login, loading } = useUserStore();
        const { t } = useTranslation();

        const handleSubmit = (event) => {
                event.preventDefault();
                login(email, password);
        };

        return (
                <div className='flex min-h-screen flex-col justify-center bg-kingdom-ivory py-16 sm:px-6 lg:px-8'>
                        <motion.div
                                className='sm:mx-auto sm:w-full sm:max-w-md'
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                        >
                                <h2 className='mt-6 text-center text-3xl font-semibold tracking-[0.18em] text-kingdom-purple'>
                                        {t("auth.login.title")}
                                </h2>
                        </motion.div>

                        <motion.div
                                className='mt-12 sm:mx-auto sm:w-full sm:max-w-md'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                        >
                                <div className='rounded-[2rem] border border-kingdom-purple/15 bg-white/90 py-10 px-6 text-kingdom-charcoal shadow-[0_24px_60px_-40px_rgba(34,18,40,0.45)] backdrop-blur-sm sm:px-12'>
                                        <form onSubmit={handleSubmit} className='space-y-6'>
                                                <div>
                                                        <label htmlFor='email' className='block text-sm font-medium text-kingdom-muted'>
                                                                {t("auth.login.email")}
                                                        </label>
                                                        <div className='relative mt-2 rounded-2xl border border-kingdom-purple/20 bg-white/95 shadow-[0_10px_25px_-22px_rgba(34,18,40,0.4)] focus-within:border-kingdom-gold focus-within:shadow-royal-glow'>
                                                                <input
                                                                        id='email'
                                                                        type='email'
                                                                        required
                                                                        value={email}
                                                                        onChange={(event) => setEmail(event.target.value)}
                                                                        className='block w-full rounded-2xl border-none bg-transparent px-4 py-3 pr-12 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:outline-none'
                                                                        placeholder={t("auth.login.placeholderEmail")}
                                                                />
                                                                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4'>
                                                                        <Mail className='h-5 w-5 text-kingdom-muted/70' aria-hidden='true' />
                                                                </div>
                                                        </div>
                                                </div>

                                                <div>
                                                        <label htmlFor='password' className='block text-sm font-medium text-kingdom-muted'>
                                                                {t("auth.login.password")}
                                                        </label>
                                                        <div className='relative mt-2 rounded-2xl border border-kingdom-purple/20 bg-white/95 shadow-[0_10px_25px_-22px_rgba(34,18,40,0.4)] focus-within:border-kingdom-gold focus-within:shadow-royal-glow'>
                                                                <input
                                                                        id='password'
                                                                        type='password'
                                                                        required
                                                                        value={password}
                                                                        onChange={(event) => setPassword(event.target.value)}
                                                                        className='block w-full rounded-2xl border-none bg-transparent px-4 py-3 pr-12 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:outline-none'
                                                                        placeholder={t("auth.login.placeholderPassword")}
                                                                />
                                                                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4'>
                                                                        <Lock className='h-5 w-5 text-kingdom-muted/70' aria-hidden='true' />
                                                                </div>
                                                        </div>
                                                </div>

                                                <button
                                                        type='submit'
                                                        className='flex w-full items-center justify-center gap-2 rounded-full bg-kingdom-gold px-6 py-3 text-sm font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow disabled:opacity-60'
                                                        disabled={loading}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                                        {t("auth.login.loading")}
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <LogIn className='h-5 w-5' aria-hidden='true' />
                                                                        {t("auth.login.button")}
                                                                </>
                                                        )}
                                                </button>
                                        </form>

                                        <p className='mt-8 text-center text-sm text-kingdom-muted'>
                                                {t("auth.login.prompt")} {" "}
                                                <Link to='/signup' className='font-medium text-kingdom-purple transition duration-300 hover:text-kingdom-gold'>
                                                        {t("auth.login.cta")} {" "}
                                                        <ArrowLeft className='mr-1 inline h-4 w-4' />
                                                </Link>
                                        </p>
                                </div>
                        </motion.div>
                </div>
        );
};
export default LoginPage;
