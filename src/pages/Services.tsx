import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, Play, Layout as LayoutIcon, MessageSquare, Check } from 'lucide-react';
import { Magnetic } from '../components/Visuals';
import { Link } from 'react-router-dom';

const DETAILED_SERVICES = [
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    phrase: 'Memorable identities for investors and users.',
    icon: Palette,
    description: 'We build comprehensive brand systems that scale. From logo marks to typography, color theory, and brand guidelines, we ensure your visual identity communicates your core narrative instantly.',
    deliverables: ['Logo & Visual System', 'Brand Guidelines', 'Typography & Color', 'Pitch Deck Design'],
  },
  {
    id: 'motion-design',
    title: 'Motion Design',
    phrase: 'Unforgettable ideas through movement.',
    icon: Play,
    description: 'Static is boring. We bring your brand to life through high-end 2D and 3D motion graphics, UI animations, and promotional videos that capture attention and explain complex ideas simply.',
    deliverables: ['UI/UX Animation', 'Explainer Videos', '3D Product Visuals', 'Social Media Assets'],
  },
  {
    id: 'web-ui-ux',
    title: 'Web & UI/UX',
    phrase: 'Digital spaces that live and convert.',
    icon: LayoutIcon,
    description: 'We design and develop immersive digital experiences. Our websites are built for performance, accessibility, and conversion, ensuring your users have a seamless journey from landing to checkout.',
    deliverables: ['Wireframing & Prototyping', 'High-Fidelity UI Design', 'Full-Stack Development', 'Conversion Optimization'],
  },
  {
    id: 'content-strategy',
    title: 'Content Strategy',
    phrase: 'Stories your audience stays for.',
    icon: MessageSquare,
    description: 'A great brand needs a great voice. We help you define your narrative arc, tone of voice, and content pillars to ensure you are saying the right things to the right people at the right time.',
    deliverables: ['Tone of Voice Guidelines', 'Copywriting', 'Social Media Strategy', 'Campaign Ideation'],
  }
];

export default function Services() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-ivory pt-32">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Capabilities</span>
            <h1 className="text-7xl md:text-[10rem] leading-[0.8] tracking-tighter mb-8">
              Our <span className="italic-serif font-normal">Services.</span>
            </h1>
            <p className="text-2xl opacity-60 leading-relaxed font-medium">
              We blend character-driven storytelling with high-end digital craft to build brands that feel alive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Services List */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          {DETAILED_SERVICES.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
            >
              <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="w-24 h-24 rounded-3xl bg-brand-yellow flex items-center justify-center mb-8 shadow-[10px_10px_0px_rgba(10,10,10,1)] border-4 border-brand-black transform -rotate-3">
                  <service.icon size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-5xl md:text-6xl font-display mb-6">{service.title}</h2>
                <p className="text-2xl font-serif italic opacity-60 mb-6">"{service.phrase}"</p>
                <p className="text-lg opacity-70 leading-relaxed mb-8">
                  {service.description}
                </p>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Deliverables</h4>
                  <ul className="space-y-3">
                    {service.deliverables.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                        <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center border border-brand-black">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="aspect-[4/3] rounded-[40px] bg-brand-black overflow-hidden border-4 border-brand-black shadow-[20px_20px_0px_rgba(255,209,0,1)] relative group">
                  <img 
                    src={`https://picsum.photos/seed/${service.id}/1200/900`} 
                    alt={service.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-black text-brand-yellow relative z-10 text-center mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl leading-[0.85] mb-8">Need something <span className="italic-serif font-normal">specific?</span></h2>
          <p className="text-xl opacity-70 mb-12">We tailor our services to fit your exact needs. Let's talk about your project.</p>
          <Magnetic>
            <Link to="/contact" className="inline-block px-12 py-6 bg-brand-yellow text-brand-black rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl">
              Book a Consultation
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    </div>
  );
}
