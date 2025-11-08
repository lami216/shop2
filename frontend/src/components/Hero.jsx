import { Sparkles, ShieldCheck, Timer } from "lucide-react";

const heroPattern = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320' fill='none'>
                <path d='M160 40L184 88L240 100L200 140L212 196L160 168L108 196L120 140L80 100L136 88L160 40Z' stroke='white' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='0.7'/>
                <circle cx='160' cy='160' r='52' stroke='white' stroke-width='0.9' opacity='0.4'/>
                <path d='M160 110C180 120 194 140 194 164C194 188 180 208 160 218C140 208 126 188 126 164C126 140 140 120 160 110Z' stroke='white' stroke-width='0.7' opacity='0.35'/>
        </svg>`
);

const featureItems = [
        { icon: Sparkles, label: "لمسة فخامة ملكية" },
        { icon: ShieldCheck, label: "ثبات يدوم لساعات" },
        { icon: Timer, label: "إصدارات محدودة بعناية" },
];

const Hero = () => {
        const scrollToCollections = (event) => {
                event.preventDefault();
                const collections = document.getElementById("collections");
                if (collections) {
                        collections.scrollIntoView({ behavior: "smooth", block: "start" });
                }
        };

        return (
                <section className='relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-kingdom-purple/98 via-kingdom-plum/94 to-[#1A0D24]/95 px-6 py-16 text-kingdom-ivory shadow-[0_35px_65px_-40px_rgba(26,13,36,0.95)] sm:px-10 lg:px-16'>
                        <div
                                className='pointer-events-none absolute inset-0 opacity-20'
                                style={{
                                        backgroundImage: `url("data:image/svg+xml,${heroPattern}")`,
                                        backgroundSize: "220px",
                                        mixBlendMode: "soft-light",
                                }}
                        />
                        <div className='relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center'>
                                <div className='lg:col-span-7'>
                                        <div className='inline-flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-white/10 px-4 py-1 text-sm text-kingdom-gold/90 shadow-[0_10px_25px_-18px_rgba(212,175,55,0.65)]'>
                                                <span className='inline-block h-2 w-2 rounded-full bg-kingdom-gold' aria-hidden='true' />
                                                إصدار ملكي محدود
                                        </div>
                                        <h1 className='mt-6 text-4xl font-semibold leading-[1.25] tracking-[0.12em] text-kingdom-ivory sm:text-5xl lg:text-6xl'>
                                                مملكة العطور
                                        </h1>
                                        <p className='mt-6 text-lg leading-relaxed text-kingdom-cream/90 sm:text-xl'>
                                                رحلة حسية تغمر حواسك بروائح شرقية آسرة، حيث تمتزج المكونات النادرة مع تصاميم راقية تمنحك تميزًا لا يُنسى وثباتًا يمتد لساعات طويلة.
                                        </p>
                                        <div className='mt-10 flex flex-col gap-4 sm:flex-row sm:items-center'>
                                                <a
                                                        href='#collections'
                                                        onClick={scrollToCollections}
                                                        className='inline-flex items-center justify-center gap-2 rounded-full bg-kingdom-gold px-8 py-3 text-base font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow'
                                                >
                                                        اكتشف التشكيلة الملكية
                                                </a>
                                                <a
                                                        href='#collections'
                                                        onClick={scrollToCollections}
                                                        className='inline-flex items-center justify-center gap-2 rounded-full border border-kingdom-gold/40 px-6 py-3 text-base font-semibold text-kingdom-gold transition-royal focus-outline hover:bg-kingdom-purple/60 hover:text-white'
                                                >
                                                        تصفح المجموعات
                                                </a>
                                        </div>
                                </div>
                                <div className='lg:col-span-5'>
                                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3'>
                                                {featureItems.map((item) => (
                                                        <div
                                                                key={item.label}
                                                                className='flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/10 px-6 py-6 text-center text-sm text-kingdom-ivory/90 backdrop-blur-sm transition-royal hover:border-kingdom-gold/50'
                                                        >
                                                                <item.icon className='h-6 w-6 text-kingdom-gold' />
                                                                <span className='leading-relaxed'>{item.label}</span>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

export default Hero;
