import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowLeft, Loader } from "lucide-react";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
        const [formData, setFormData] = useState({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
        });

        const { signup, loading } = useUserStore();
        const { t } = useTranslation();

        const handleSubmit = (event) => {
                event.preventDefault();
                signup(formData);
        };

        const renderField = (id, label, type, Icon, placeholder, valueKey) => (
                <div>
                        <label htmlFor={id} className='block text-sm font-medium text-kingdom-muted'>
                                {label}
                        </label>
                        <div className='relative mt-2 rounded-2xl border border-kingdom-purple/20 bg-white/95 shadow-[0_10px_25px_-22px_rgba(34,18,40,0.4)] focus-within:border-kingdom-gold focus-within:shadow-royal-glow'>
                                <input
                                        id={id}
                                        type={type}
                                        required
                                        value={formData[valueKey]}
                                        onChange={(event) => setFormData({ ...formData, [valueKey]: event.target.value })}
                                        className='block w-full rounded-2xl border-none bg-transparent px-4 py-3 pr-12 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:outline-none'
                                        placeholder={placeholder}
                                />
                                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4'>
                                        <Icon className='h-5 w-5 text-kingdom-muted/70' aria-hidden='true' />
                                </div>
                        </div>
                </div>
        );

        return (
                <div className='flex min-h-screen flex-col justify-center bg-kingdom-ivory py-16 sm:px-6 lg:px-8'>
                        <motion.div
                                className='sm:mx-auto sm:w-full sm:max-w-md'
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                        >
                                <h2 className='mt-6 text-center text-3xl font-semibold tracking-[0.18em] text-kingdom-purple'>
                                        {t("auth.signup.title")}
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
                                                {renderField(
                                                        "name",
                                                        t("auth.signup.name"),
                                                        "text",
                                                        User,
                                                        t("auth.signup.placeholderName"),
                                                        "name"
                                                )}
                                                {renderField(
                                                        "email",
                                                        t("auth.signup.email"),
                                                        "email",
                                                        Mail,
                                                        t("auth.signup.placeholderEmail"),
                                                        "email"
                                                )}
                                                {renderField(
                                                        "password",
                                                        t("auth.signup.password"),
                                                        "password",
                                                        Lock,
                                                        t("auth.signup.placeholderPassword"),
                                                        "password"
                                                )}
                                                {renderField(
                                                        "confirmPassword",
                                                        t("auth.signup.confirmPassword"),
                                                        "password",
                                                        Lock,
                                                        t("auth.signup.placeholderPassword"),
                                                        "confirmPassword"
                                                )}

                                                <button
                                                        type='submit'
                                                        className='flex w-full items-center justify-center gap-2 rounded-full bg-kingdom-gold px-6 py-3 text-sm font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow disabled:opacity-60'
                                                        disabled={loading}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                                        {t("auth.signup.loading")}
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <UserPlus className='h-5 w-5' aria-hidden='true' />
                                                                        {t("auth.signup.button")}
                                                                </>
                                                        )}
                                                </button>
                                        </form>

                                        <p className='mt-8 text-center text-sm text-kingdom-muted'>
                                                {t("auth.signup.prompt")} {" "}
                                                <Link to='/login' className='font-medium text-kingdom-purple transition duration-300 hover:text-kingdom-gold'>
                                                        {t("auth.signup.cta")} {" "}
                                                        <ArrowLeft className='mr-1 inline h-4 w-4' />
                                                </Link>
                                        </p>
                                </div>
                        </motion.div>
                </div>
        );
};
export default SignUpPage;
