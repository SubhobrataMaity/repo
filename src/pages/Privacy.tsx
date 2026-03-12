import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { BackgroundPattern } from '../components/Visuals';

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="relative min-h-screen bg-brand-ivory pt-32 pb-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-yellow/10 -skew-y-3 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Legal Coordinates</span>
          <h1 className="text-7xl md:text-9xl font-display leading-[0.8] tracking-tighter">
            Privacy <span className="italic-serif font-normal">Policy.</span>
          </h1>
        </motion.div>

        <div className="space-y-16 text-brand-black/80 font-sans text-xl leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">1. Data Boarding</h2>
            <p>At Animatrips, we take your privacy as seriously as our design craft. When you board our site or start a trip with us, we collect essential coordinates to ensure a smooth flight.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">2. Information We Collect</h2>
            <p>We collect personal information you explicitly provide: your name, email address, brand details, and project mission. We also collect anonymous flight data (analytics) to improve our navigation.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">3. How We Use Your Fuel</h2>
            <p>Your data is used exclusively to communicate with you, manage your project itinerary, and send you our weekly journal entries if you've subscribed. We never sell your data to third-party cargo ships.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">4. Security Measures</h2>
            <p>We use industry-standard encryption to protect your information from unauthorized interception. Your data is stored in secure digital vaults.</p>
          </section>
        </div>

        <div className="mt-32 pt-12 border-t border-brand-black/10">
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">Last Updated: March 12, 2026</p>
        </div>
      </div>
    </div>
  );
}
