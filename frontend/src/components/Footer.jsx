import { Facebook, Instagram, Twitter } from "lucide-react";
import PaymentMethods from "./PaymentMethods";

const Footer = () => {
        const buildTime = new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString();
        return (
                <footer className='mt-24 bg-kingdom-plum text-kingdom-ivory'>
                        <div className='mx-auto flex flex-col gap-10 px-6 py-12 text-center sm:gap-12 sm:px-8 lg:max-w-6xl lg:px-0'>
                                <div className='flex flex-col gap-6'>
                                        <h2 className='text-2xl font-semibold tracking-[0.18em] text-kingdom-gold'>مملكة العطور</h2>
                                        <p className='text-sm leading-relaxed text-kingdom-ivory/70'>
                                                نفخر بتقديم أرقى الروائح العربية والعالمية مع تجربة ملكية متكاملة وخدمة عملاء راقية على مدار الساعة.
                                        </p>
                                </div>

                                <div className='flex flex-col items-center justify-between gap-8 border-t border-kingdom-purple/40 pt-8 text-sm sm:flex-row'>
                                        <div className='flex flex-col items-center gap-3 sm:items-start'>
                                                <PaymentMethods />
                                                <small className='text-xs text-kingdom-ivory/60'>آخر تحديث للموقع: {buildTime}</small>
                                                <small className='text-xs text-kingdom-ivory/60'>© {new Date().getFullYear()} مملكة العطور. جميع الحقوق محفوظة.</small>
                                        </div>
                                        <nav className='flex items-center justify-center gap-4'>
                                                {[{ icon: Instagram, label: "Instagram" }, { icon: Facebook, label: "Facebook" }, { icon: Twitter, label: "Twitter" }].map((item) => (
                                                        <a
                                                                key={item.label}
                                                                href='#'
                                                                className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-kingdom-gold/30 text-kingdom-ivory transition-royal focus-outline hover:border-kingdom-gold hover:text-kingdom-gold'
                                                                aria-label={item.label}
                                                        >
                                                                <item.icon className='h-5 w-5' strokeWidth={1.6} />
                                                        </a>
                                                ))}
                                        </nav>
                                </div>
                        </div>
                </footer>
        );
};

export default Footer;
