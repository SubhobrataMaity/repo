import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic } from '../components/Visuals';
import { Link } from 'react-router-dom';
import { fetchWorkPageProjects, type Project } from '../lib/supabase';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Static fallback shown before Supabase data loads or when not configured
const DUMMY_PROJECTS = [
  { id: '1', title: 'Neon Pulse', description: 'A vibrant cyberpunk-inspired UI design system for a next-gen music platform. Deep neon colors, fast-paced motion graphics, and high energy.', slug: 'neon-pulse', folder_name: 'neon-pulse', cover_image: 'https://picsum.photos/seed/neon/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 0, created_at: new Date().toISOString() },
  { id: '2', title: 'Ethereal UI', description: 'A soft, glassmorphic layout created for a wellness and meditation startup. Smooth gradients and subtle frosted details.', slug: 'ethereal-ui', folder_name: 'ethereal-ui', cover_image: 'https://picsum.photos/seed/ui/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 1, created_at: new Date().toISOString() },
  { id: '3', title: 'Bold Identity', description: 'Strong, loud, and confident branding for a streetwear line. Monochromatic themes mixed with heavy brutalist typography.', slug: 'bold-identity', folder_name: 'bold-identity', cover_image: 'https://picsum.photos/seed/brand/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 2, created_at: new Date().toISOString() },
  { id: '4', title: 'Future Flow', description: 'Fluid interaction design demonstrating cutting edge mobile animations and scroll-triggered physics.', slug: 'future-flow', folder_name: 'future-flow', cover_image: 'https://picsum.photos/seed/flow/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 3, created_at: new Date().toISOString() },
  { id: '5', title: 'Cyberpunk 2077', description: 'Night City inspired concept interfaces with glaring light artifacts, high tech borders, and gritty details.', slug: 'cyberpunk-2077', folder_name: 'cyberpunk', cover_image: 'https://picsum.photos/seed/cyber/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 4, created_at: new Date().toISOString() },
  { id: '6', title: 'Zenith App', description: 'Productivity application focused on deep work phases featuring dark mode default aesthetics and minimal distractions.', slug: 'zenith-app', folder_name: 'zenith', cover_image: 'https://picsum.photos/seed/zenith/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 5, created_at: new Date().toISOString() },
  { id: '7', title: 'Aura Skincare', description: 'E-commerce platform with elegant natural tones, soft photography, and clean typography.', slug: 'aura-skincare', folder_name: 'aura', cover_image: 'https://picsum.photos/seed/aura/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 6, created_at: new Date().toISOString() },
  { id: '8', title: 'Velocity Motors', description: 'High performance automotive landing pages with aggressive styling and raw speed indicators.', slug: 'velocity-motors', folder_name: 'velocity', cover_image: 'https://picsum.photos/seed/velocity/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 7, created_at: new Date().toISOString() },
  { id: '9', title: 'Echo Audio', description: 'Sleek dark interface for audiophiles. Crisp edges, high end aesthetic, heavily focused on product imagery.', slug: 'echo-audio', folder_name: 'echo', cover_image: 'https://picsum.photos/seed/echo/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 8, created_at: new Date().toISOString() },
];

function formatYear(iso: string) {
  try { return new Date(iso).getFullYear().toString(); }
  catch { return '2026'; }
}

export default function Work() {
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS as Project[]);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch live data from Supabase
  useEffect(() => {
    fetchWorkPageProjects().then(data => {
      if (data.length > 0) setProjects(data);
    });
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
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-6 block">Our Portfolio</span>
            <h1 className="text-7xl md:text-[10rem] leading-[0.8] tracking-tighter mb-8">
              Our Works <span className="italic-serif font-normal"></span>
            </h1>
            <p className="text-2xl opacity-60 leading-relaxed font-medium">
              A collection of digital artifacts, character-driven experiences, and brands that refuse to be ignored.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
            {projects.map((project, i) => (
              <Link to={`/work/${project.slug}`}>
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-2xl mb-6 bg-gray-100">
                    <LazyLoadImage 
                    src={project.cover_image} 
                    alt={project.title}
                    className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                    effect="blur"
                  />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-display font-medium mb-2">{project.title}</h3>
                      <p className="text-sm uppercase tracking-widest opacity-60">
                        {project.slug.replace(/-/g, ' ')}
                      </p>
                    </div>
                    <span className="text-sm font-mono opacity-40">{formatYear(project.created_at)}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-brand-black text-brand-yellow relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl leading-[0.85] mb-8">Ready to make some <span className="italic-serif font-normal">noise?</span></h2>
          <p className="text-xl opacity-70 mb-12">Let's build a brand that people actually care about.</p>
          <Magnetic>
            <Link to="/contact" className="inline-block px-12 py-6 bg-brand-yellow text-brand-black rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[8px_8px_0px_rgba(255,209,0,0.3)]">
              Start a Project
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    </div>
  );
}
