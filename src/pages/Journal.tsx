import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const POSTS = [
  {
    id: 1,
    title: 'Why Character-Driven Branding Wins',
    date: 'March 10, 2026',
    excerpt: 'In a sea of sameness, character is the only way to stand out. Here is why we obsess over narrative psychology.',
    img: 'https://picsum.photos/seed/journal1/800/600'
  },
  {
    id: 2,
    title: 'The Future of Motion in UI',
    date: 'February 25, 2026',
    excerpt: 'Static interfaces are a thing of the past. We explore how subtle motion can drastically improve user engagement.',
    img: 'https://picsum.photos/seed/journal2/800/600'
  },
  {
    id: 3,
    title: 'Building Brands That Feel Alive',
    date: 'February 12, 2026',
    excerpt: 'How we blend design and storytelling to create digital experiences that resonate on a human level.',
    img: 'https://picsum.photos/seed/journal3/800/600'
  }
];

export default function Journal() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="relative min-h-screen bg-brand-ivory pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-[10rem] leading-[0.8] tracking-tighter mb-20">The <span className="italic-serif font-normal">Journal.</span></motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {POSTS.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group">
              <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-6 border-2 border-brand-black">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2 block">{post.date}</span>
              <h3 className="text-3xl font-display mb-4 group-hover:italic-serif transition-all">{post.title}</h3>
              <p className="text-brand-black/70 leading-relaxed mb-6">{post.excerpt}</p>
              <Link to="#" className="text-sm font-bold uppercase tracking-widest border-b-2 border-brand-black hover:border-brand-yellow transition-colors">Read More</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
