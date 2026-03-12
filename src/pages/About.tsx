import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { EyeLogo, BrandLogo, BackgroundPattern, Magnetic } from '../components/Visuals';
import { Link } from 'react-router-dom';

const VALUES = [
  {
    title: 'Character First',
    desc: 'We believe every brand needs a soul. We design personalities, not just logos.'
  },
  {
    title: 'Anti-Boring',
    desc: 'Safe is risky. We push boundaries to create work that demands attention.'
  },
  {
    title: 'Narrative Driven',
    desc: 'Every pixel must serve the story. If it doesn\'t add to the narrative, we cut it.'
  },
  {
    title: 'Relentless Craft',
    desc: 'We obsess over the details because the details are the design.'
  }
];

const TEAM = [
  { 
    name: 'Alex Vance', 
    role: 'Creative Director', 
    class: 'Visionary Mage', 
    level: 99,
    stats: { Creativity: 98, Logic: 45, Chaos: 85 },
    img: 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=transparent' 
  },
  { 
    name: 'Sarah Chen', 
    role: 'Head of Motion', 
    class: 'Motion Ninja', 
    level: 85,
    stats: { Creativity: 92, Logic: 70, Chaos: 60 },
    img: 'https://api.dicebear.com/7.x/micah/svg?seed=Sarah&backgroundColor=transparent' 
  },
  { 
    name: 'Marcus Doe', 
    role: 'Lead Strategist', 
    class: 'Logic Paladin', 
    level: 90,
    stats: { Creativity: 65, Logic: 99, Chaos: 15 },
    img: 'https://api.dicebear.com/7.x/micah/svg?seed=Marcus&backgroundColor=transparent' 
  },
  { 
    name: 'Elena Rostova', 
    role: 'Technical Director', 
    class: 'Code Alchemist', 
    level: 95,
    stats: { Creativity: 75, Logic: 95, Chaos: 40 },
    img: 'https://api.dicebear.com/7.x/micah/svg?seed=Elena&backgroundColor=transparent' 
  }
];

export default function About() {
  // Scroll to top on mount
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
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">About Us</span>
            <h1 className="text-7xl md:text-[10rem] leading-[0.8] tracking-tighter mb-8">
              The <span className="italic-serif font-normal">Origin.</span>
            </h1>
            <p className="text-2xl opacity-60 leading-relaxed font-medium">
              We are a collective of designers, storytellers, and strategists on a mission to kill boring brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Origin Story Section (Expanded) */}
      <section className="py-20 px-6 md:px-12 relative z-10">
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
              <h2 className="text-5xl md:text-7xl leading-[0.85] mb-8">Born from the <span className="italic-serif font-normal">eye</span> of the storm.</h2>
              <p className="text-xl opacity-70 leading-relaxed font-medium mb-6">
                Animatrips started with a simple observation: most brands are boring. They have no character, no story, and no pulse. They look the same, sound the same, and act the same. We decided to change that.
              </p>
              <p className="text-xl opacity-70 leading-relaxed font-medium">
                We realized that the most successful brands in the world don't just sell products—they invite people into a narrative. They have distinct personalities, flaws, and arcs. They are, in essence, characters.
              </p>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl opacity-50 leading-relaxed"
            >
              Today, our team of "Trip Leaders" combines world-class design with narrative psychology to create brands that people don't just use—they join. We build digital ecosystems that feel alive.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-24 px-6 md:px-12 bg-brand-yellow border-y border-brand-black relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-px bg-brand-black border border-brand-black"
        >
          {[
            { label: 'Capital Raised', value: '$250M+' },
            { label: 'Brands Launched', value: '120+' },
            { label: 'Design Awards', value: '15' },
            { label: 'Happy Founders', value: '98%' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-brand-yellow p-12 text-center group hover:bg-brand-black hover:text-brand-yellow transition-colors duration-500"
            >
              <div className="text-5xl md:text-6xl font-display font-bold mb-4 transform group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-ivory relative z-10 mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">The Crew</span>
            <h2 className="text-6xl md:text-8xl leading-[0.85]">Meet the <span className="italic-serif font-normal">Trip Leaders.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map((member, i) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative bg-white border-4 border-brand-black rounded-[32px] overflow-hidden hover:shadow-[12px_12px_0px_rgba(20,20,20,1)] transition-all duration-300 hover:-translate-y-2 flex flex-col"
              >
                {/* Image Area */}
                <div className="aspect-square border-b-4 border-brand-black relative overflow-hidden bg-brand-yellow">
                   <img 
                     src={member.img} 
                     alt={member.name}
                     className="w-full h-full object-contain p-6 mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110 will-change-transform" 
                     referrerPolicy="no-referrer"
                   />
                   {/* Level Badge */}
                   <div className="absolute top-4 right-4 bg-brand-yellow border-2 border-brand-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_rgba(20,20,20,1)] z-10">
                     LVL {member.level}
                   </div>
                   {/* Class Badge */}
                   <div className="absolute bottom-4 left-4 bg-brand-black text-brand-yellow px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10">
                     {member.class}
                   </div>
                </div>
                
                {/* Content Area */}
                <div className="p-6 bg-white group-hover:bg-brand-yellow transition-colors duration-300 flex-1 flex flex-col">
                  <h3 className="text-2xl font-display mb-1">{member.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 mb-6">{member.role}</p>
                  
                  {/* Stats */}
                  <div className="mt-auto space-y-3">
                    {Object.entries(member.stats).map(([stat, value]) => (
                      <div key={stat} className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-20">{stat}</span>
                        <div className="flex-1 mx-2 h-2 bg-brand-black/10 rounded-full overflow-hidden border border-brand-black/20">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="h-full bg-brand-black" 
                          />
                        </div>
                        <span className="w-6 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-black text-brand-yellow relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-yellow/40 mb-6 block">Our DNA</span>
            <h2 className="text-6xl md:text-8xl leading-[0.85]">Core <span className="italic-serif font-normal">Values.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            {VALUES.map((value, i) => (
              <motion.div 
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="border-t border-brand-yellow/20 pt-8"
              >
                <div className="text-sm font-bold uppercase tracking-widest text-brand-yellow/40 mb-4">0{i + 1}</div>
                <h3 className="text-3xl md:text-4xl font-display mb-4">{value.title}</h3>
                <p className="text-xl text-brand-yellow/60 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-yellow text-brand-black relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl leading-[0.85] mb-8">Ready to start your <span className="italic-serif font-normal">trip?</span></h2>
          <p className="text-xl opacity-70 mb-12">Let's build a brand that people actually care about.</p>
          <Magnetic>
            <Link to="/" className="inline-block px-12 py-6 bg-brand-black text-brand-yellow rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl">
              Start a Project
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    </div>
  );
}
