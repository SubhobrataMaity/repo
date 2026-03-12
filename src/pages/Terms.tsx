import React, { useEffect } from 'react';
import { motion } from 'motion/react';

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="relative min-h-screen bg-brand-ivory pt-32 pb-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-64 bg-brand-black/5 skew-y-3 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Flight Rules</span>
          <h1 className="text-7xl md:text-9xl font-display leading-[0.8] tracking-tighter">
            Terms of <span className="italic-serif font-normal">Service.</span>
          </h1>
        </motion.div>

        <div className="space-y-16 text-brand-black/80 font-sans text-xl leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">1. Agreement to Terms</h2>
            <p>By accessing the Animatrips digital space, you agree to follow our flight rules. If you do not agree with any part of these terms, you are not authorized to board.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">2. Intellectual Property</h2>
            <p>All artifacts, designs, motion graphics, and narratives displayed on this site are the exclusive property of Animatrips or our partners. Unauthorized duplication is a violation of our creative airspace.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">3. Project Engagement</h2>
            <p>Starting a "trip" with us requires a formal agreement and deposit. Our timelines and deliverables are outlined in individual project itineraries.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-4xl font-display text-brand-black border-l-4 border-brand-yellow pl-6">4. Limitation of Liability</h2>
            <p>Animatrips is not liable for any indirect, incidental, or consequential damages arising from your use of our digital artifacts or services.</p>
          </section>
        </div>

        <div className="mt-32 pt-12 border-t border-brand-black/10">
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">Last Updated: March 12, 2026</p>
        </div>
      </div>
    </div>
  );
}
