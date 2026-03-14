import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { EyeLogo, BrandLogo, BackgroundPattern, Marquee, Magnetic } from '../components/Visuals';
import { ChatFlow } from '../components/ChatFlow';
import { Link, useLocation } from 'react-router-dom';
import { 
  Palette, 
  Play, 
  Layout as LayoutIcon, 
  MessageSquare, 
  ArrowUpRight,
  Plus,
  Minus
} from 'lucide-react';
import { fetchSelectedWorkProjects, fetchFAQs, type Project, type FAQ } from '../lib/supabase';

const SERVICES = [
  {
    title: 'Brand Identity',
    phrase: 'Memorable identities for investors and users.',
    icon: Palette,
    benefit: 'Investor-ready in 2 weeks.',
    color: '#FFD100',
    img: 'https://picsum.photos/seed/brand/800/1000'
  },
  {
    title: 'Motion Design',
    phrase: 'Unforgettable ideas through movement.',
    icon: Play,
    benefit: '3x higher engagement.',
    color: '#0A0A0A',
    img: 'https://picsum.photos/seed/motion/800/1000'
  },
  {
    title: 'Web & UI/UX',
    phrase: 'Digital spaces that live and convert.',
    icon: LayoutIcon,
    benefit: 'Conversion-first design.',
    color: '#FFF7EE',
    img: 'https://picsum.photos/seed/web/800/1000'
  },
  {
    title: 'Content Strategy',
    phrase: 'Stories your audience stays for.',
    icon: MessageSquare,
    benefit: 'Viral-ready narratives.',
    color: '#FFD100',
    img: 'https://picsum.photos/seed/content/800/1000'
  }
];

// Static fallbacks used when Supabase is not yet configured
const FALLBACK_PROJECTS = [
  { id: '1', title: 'Neon Pulse', description: '', slug: 'neon-pulse', folder_name: 'neon-pulse', cover_image: 'https://picsum.photos/seed/neon/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 0, created_at: '' },
  { id: '2', title: 'Ethereal UI', description: '', slug: 'ethereal-ui', folder_name: 'ethereal-ui', cover_image: 'https://picsum.photos/seed/ui/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 1, created_at: '' },
  { id: '3', title: 'Bold Identity', description: '', slug: 'bold-identity', folder_name: 'bold-identity', cover_image: 'https://picsum.photos/seed/brand/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 2, created_at: '' },
  { id: '4', title: 'Future Flow', description: '', slug: 'future-flow', folder_name: 'future-flow', cover_image: 'https://picsum.photos/seed/flow/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 3, created_at: '' },
] as Project[];

const FALLBACK_FAQS: FAQ[] = [
  { id: '1', display_order: 0, created_at: '', question: "What exactly is a 'character-driven' brand?", answer: "A character-driven brand goes beyond logos and colors. It's about giving your brand a distinct personality, voice, and narrative arc that resonates with your audience on a psychological level. We build brands that feel like living, breathing entities." },
  { id: '2', display_order: 1, created_at: '', question: "How long does a typical project take?", answer: "Our timelines vary depending on the scope of the 'trip'. A standard brand identity project takes about 4-6 weeks, while a comprehensive web and motion design package can take 8-12 weeks. We prioritize quality and narrative depth over rushed deliveries." },
  { id: '3', display_order: 2, created_at: '', question: "Do you work with early-stage startups?", answer: "Absolutely. In fact, we love partnering with early-stage founders to establish a strong, memorable identity from day one. We offer specialized 'Investor-Ready' packages designed to help you stand out in pitch meetings." },
  { id: '4', display_order: 3, created_at: '', question: "What is your pricing structure?", answer: "Every brand journey is unique. We provide custom quotes based on your specific needs, goals, and the complexity of the project. Our minimum engagement starts at $10k. Book a strategy session to get a tailored proposal." },
  { id: '5', display_order: 4, created_at: '', question: "Can you just design a logo for us?", answer: "We believe a logo is just the tip of the iceberg. To truly make an impact, you need a cohesive brand system and narrative. Therefore, we don't offer standalone logo design services; we focus on comprehensive brand building." },
];

const FAQItem: React.FC<{ faq: FAQ; index: number }> = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-brand-black/10"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <h3 className={`text-2xl md:text-4xl font-display transition-colors duration-300 ${isOpen ? 'text-brand-yellow' : 'group-hover:text-brand-yellow'}`}>
          {faq.question}
        </h3>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-6 ${isOpen ? 'border-brand-yellow bg-brand-yellow text-brand-black rotate-180' : 'border-brand-black/20 group-hover:border-brand-yellow group-hover:bg-brand-yellow group-hover:text-brand-black'}`}>
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </button>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-8 text-lg md:text-xl text-brand-black/60 leading-relaxed max-w-3xl">
          {faq.answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const location = useLocation();
  const [activeService, setActiveService] = useState(0);
  const [isHoveringServices, setIsHoveringServices] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringGallery, setIsHoveringGallery] = useState(false);
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const mailtoHref = `mailto:${contactEmail ?? ''}?subject=${encodeURIComponent('Inquiry')}&body=`;

  // ── Supabase live data ──────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK_FAQS);

  useEffect(() => {
    // Fetch selected work projects
    fetchSelectedWorkProjects().then(data => {
      if (data.length > 0) setProjects(data);
    });
    // Fetch FAQs
    fetchFAQs().then(data => {
      if (data.length > 0) setFaqs(data);
    });
  }, []);

  useEffect(() => {
    if (isHoveringServices) return;
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % SERVICES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHoveringServices]);

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const logoRotate = useTransform(scrollYProgress, [0, 1], [12, 45]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-48 md:pt-56 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-5xl"
        >
          <ChatFlow isHero />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Scroll to Explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-12 bg-brand-black/20"
          />
        </motion.div>
      </section>

      <Marquee items={['Branding', 'Motion', 'Web Design', 'UI/UX', 'Content Strategy', 'Storytelling']} />

      {/* Services Section */}
      <section id="services" className="py-32 px-6 md:px-12 bg-brand-ivory/80 backdrop-blur-md relative z-10 border-y border-brand-black/5 overflow-hidden">
        {/* Decorative Background Logo */}
        <motion.div 
          style={{ rotate: logoRotate, y: logoY }}
          className="absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none"
        >
          <BrandLogo size={800} />
        </motion.div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Capabilities</span>
              <h2 className="text-6xl md:text-8xl leading-[0.85] mb-8">
                We build <span className="italic-serif font-normal">living</span> brands.
              </h2>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex items-end"
            >
              <p className="text-xl md:text-2xl text-brand-black/60 leading-relaxed border-l-2 border-brand-yellow pl-8">
                We blend character-driven storytelling with high-end digital craft to build brands that feel alive.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left side: Interactive List */}
            <div 
              className="lg:col-span-7 flex flex-col border-t-4 border-brand-black"
              onMouseEnter={() => setIsHoveringServices(true)}
              onMouseLeave={() => setIsHoveringServices(false)}
            >
              {SERVICES.map((service, i) => (
                <motion.div
                  key={service.title}
                  onMouseEnter={() => setActiveService(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={`group relative border-b-4 border-brand-black overflow-hidden transition-colors duration-500 cursor-pointer ${
                    activeService === i ? 'bg-brand-yellow' : 'bg-transparent hover:bg-brand-black/5'
                  }`}
                >
                  <Link to="/services" className="flex flex-col md:flex-row md:items-center justify-between p-8 relative z-10 w-full">
                    <div className="flex items-center gap-6 md:gap-8 mb-4 md:mb-0">
                      <span className={`font-display text-3xl md:text-5xl font-bold transition-all duration-500 ${activeService === i ? 'opacity-100 text-brand-black' : 'opacity-30 text-transparent [-webkit-text-stroke:1px_#0A0A0A]'}`}>
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className={`text-2xl md:text-4xl font-display font-bold mb-1 transition-all duration-500 group-hover:translate-x-2 ${
                          activeService === i 
                            ? 'text-brand-black [-webkit-text-stroke:0px]' 
                            : 'text-transparent [-webkit-text-stroke:1px_#0A0A0A] opacity-70'
                        }`}>
                          {service.title}
                        </h3>
                        <p className={`text-sm md:text-base font-serif italic transition-all duration-500 ${activeService === i ? 'opacity-80' : 'opacity-40'}`}>
                          {service.phrase}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-left md:text-right hidden md:block">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Impact</span>
                        <span className="text-sm font-bold">{service.benefit}</span>
                      </div>
                      
                      <div className={`w-12 h-12 rounded-full border-2 border-brand-black flex items-center justify-center transition-all duration-500 transform flex-shrink-0 ${
                        activeService === i ? 'bg-brand-black text-brand-yellow rotate-45' : 'group-hover:rotate-45'
                      }`}>
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right side: Sticky Image Gallery */}
            <div 
              className="lg:col-span-5 hidden lg:block sticky top-32 cursor-none"
              onMouseEnter={() => setIsHoveringGallery(true)}
              onMouseLeave={() => setIsHoveringGallery(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setCursorPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
            >
              <div className="relative w-full aspect-[4/5] rounded-[40px] overflow-hidden border-4 border-brand-black shadow-[16px_16px_0px_rgba(10,10,10,1)] bg-brand-black">
                {/* Custom Cursor */}
                <motion.div 
                  className="absolute z-50 pointer-events-none w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-bold uppercase tracking-widest text-xs shadow-xl"
                  animate={{
                    x: cursorPos.x - 48,
                    y: cursorPos.y - 48,
                    scale: isHoveringGallery ? 1 : 0,
                    opacity: isHoveringGallery ? 1 : 0
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                >
                  Explore
                </motion.div>

                {SERVICES.map((service, i) => (
                  <motion.img
                    key={service.title}
                    src={service.img}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ 
                      opacity: activeService === i ? 1 : 0,
                      scale: activeService === i ? 1 : 1.1,
                      zIndex: activeService === i ? 10 : 0
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
                
                {/* Overlay details */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-brand-black/80 to-transparent z-20">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-yellow flex items-center justify-center mb-4 shadow-lg">
                      {React.createElement(SERVICES[activeService].icon, { size: 24, strokeWidth: 1.5 })}
                    </div>
                    <h4 className="text-white text-3xl font-display font-bold mb-2">
                      {SERVICES[activeService].title}
                    </h4>
                    <p className="text-white/80 font-serif italic">
                      {SERVICES[activeService].phrase}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <Magnetic>
              <Link to="/services" className="inline-block px-10 py-5 border-2 border-brand-black text-brand-black rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-brand-black hover:text-brand-yellow transition-colors">
                View All Capabilities
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* Work Gallery Strip */}
      <section id="work" className="py-32 overflow-hidden relative z-10 bg-brand-yellow">
        <div className="px-6 md:px-12 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-4 block">Portfolio</span>
            <h2 className="text-7xl md:text-[10rem] leading-[0.8] tracking-tighter">Selected <span className="italic-serif font-normal">Work.</span></h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-sm opacity-60 pb-4"
          >
            A collection of digital artifacts and character-driven experiences.
          </motion.p>
        </div>
        
        <div className="flex gap-6 px-6 md:px-12 overflow-x-auto custom-scrollbar pt-16 pb-24 snap-x">
          {projects.map((project, i) => (
            <Link to={`/work/${project.slug}`} key={project.id} className="min-w-[calc(25vw-2rem)] max-w-[340px] snap-start group cursor-pointer block h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -16 }}
                className="h-full bg-[#FDFCFB] p-4 md:p-6 rounded-[40px] border-4 border-brand-black shadow-[16px_16px_0px_rgba(10,10,10,1)] flex flex-col"
              >
              <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden border-2 border-brand-black mb-6 relative transform-gpu">
                <img 
                  src={project.cover_image} 
                  alt={project.title}
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-yellow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-brand-black rounded-full flex items-center justify-center text-brand-yellow -rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
                    <ArrowUpRight size={32} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-grow justify-between px-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-brand-black text-3xl md:text-4xl font-display leading-none group-hover:italic-serif transition-all duration-300">{project.title}</h3>
                  <div className="px-4 py-2 rounded-full border-2 border-brand-black text-[10px] font-bold uppercase tracking-widest text-brand-black group-hover:bg-brand-black group-hover:text-brand-yellow transition-colors duration-300">
                    {project.slug.replace(/-/g, ' ')}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">0{i + 1}</span>
                  <div className="flex-grow h-px bg-brand-black/10 group-hover:bg-brand-black/30 transition-colors duration-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">{new Date(project.created_at || Date.now()).getFullYear() || '2026'}</span>
                </div>
              </div>
            </motion.div>
          </Link>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center"
        >
          <Magnetic>
            <Link to="/work" className="inline-block px-10 py-5 border-2 border-brand-black text-brand-black rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-brand-black hover:text-brand-yellow transition-colors">
              View All Work
            </Link>
          </Magnetic>
        </motion.div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-black text-brand-yellow relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8"
            >
              <h2 className="text-7xl md:text-9xl leading-[0.8] mb-8">The <span className="italic-serif font-normal">Trip.</span></h2>
              <p className="text-2xl text-brand-yellow/60 max-w-xl">From a blank canvas to a market-leading brand in 4 clear phases. No agency fluff, just execution.</p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {[
              { step: '01', title: 'Discover', desc: 'We audit your brand and map the competitive universe.' },
              { step: '02', title: 'Imagine', desc: 'Visual systems and character narratives take shape.' },
              { step: '03', title: 'Create', desc: 'High-fidelity execution of your digital ecosystem.' },
              { step: '04', title: 'Launch', desc: 'We deploy and scale your brand for the world.' },
            ].map((item, i) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                className="group"
              >
                <div className="text-8xl md:text-9xl font-serif italic font-bold opacity-10 group-hover:opacity-30 transition-opacity duration-500 mb-[-40px] md:mb-[-60px]">
                  {item.step}
                </div>
                <div className="relative z-10 pl-4 border-l border-brand-yellow/20 group-hover:border-brand-yellow transition-colors duration-500">
                  <h3 className="text-3xl mb-4">{item.title}</h3>
                  <p className="text-brand-yellow/50 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <Magnetic>
            <Link to="/contact" className="px-10 py-5 bg-brand-yellow text-brand-black rounded-full text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center">
                Book a Strategy Session
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* About Teaser Section */}
      <section id="about" className="py-32 px-6 md:px-12 relative z-10 bg-brand-ivory border-y border-brand-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-[60px] bg-brand-yellow flex items-center justify-center relative overflow-hidden border-4 border-brand-black shadow-[30px_30px_0px_rgba(255,209,0,0.2)]">
               <EyeLogo size={280} />
               <motion.div 
                 animate={{ 
                   rotate: [0, 360]
                 }}
                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 pointer-events-none opacity-10"
               >
                 <BackgroundPattern />
               </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, rotate: 10, y: 20 }}
              whileInView={{ opacity: 1, rotate: 3, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-12 -right-12 glass-panel p-10 max-w-[280px] border-2 border-brand-black/10 shadow-2xl"
            >
              <p className="text-lg font-serif italic leading-relaxed">"We don't just build brands; we give them a <span className="font-bold">soul</span>."</p>
            </motion.div>
          </motion.div>
          
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Our Origin</span>
              <h2 className="text-6xl md:text-8xl leading-[0.85] mb-8">Born from the <span className="italic-serif font-normal">eye</span> of the storm.</h2>
              <p className="text-2xl opacity-70 leading-relaxed font-medium">
                Animatrips started with a simple observation: most brands are boring. They have no character, no story, and no pulse. We decided to change that.
              </p>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl opacity-50 leading-relaxed"
            >
              Our team of "Trip Leaders" combines world-class design with narrative psychology to create brands that people don't just use—they join.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6"
            >
              <Magnetic>
                <Link to="/about" className="inline-block px-12 py-6 bg-brand-black text-brand-yellow rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl">
                  Read Our Full Story
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 md:px-12 relative z-10 bg-[#FDFCFB] border-t border-brand-black/5">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-20 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/30 mb-6 block"
            >
              Curiosity
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl leading-[0.85] tracking-tight"
            >
              Common <span className="italic-serif font-normal">Questions.</span>
            </motion.h2>
          </div>

          <div className="border-t border-brand-black/10">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.id} faq={faq} index={index} />
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-20 text-center"
          >
            <p className="text-brand-black/50 mb-6">Still have questions?</p>
            <Magnetic>
            <button
                onClick={() => {
                  window.location.href = mailtoHref;
                }}
                className="px-10 py-5 bg-brand-black text-brand-yellow rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl"
              >
                Ask Us Anything
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
