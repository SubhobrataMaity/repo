import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectBySlug, type Project } from '../../lib/supabase';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    if (!slug) {
      setError('No project slug provided.');
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    fetchProjectBySlug(slug)
      .then(data => {
        if (isMounted) {
          if (data) {
            setProject(data);
          } else {
            setError('Project not found');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to fetch project');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
      document.body.style.overflow = '';
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
        <div className="text-white text-xl animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
        <div className="bg-brand-ivory p-12 rounded-3xl max-w-md text-center">
          <h2 className="text-3xl font-display mb-4 text-brand-black">Oops</h2>
          <p className="text-brand-black/60 mb-8">{error || 'Project not found'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-brand-yellow rounded-full font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          navigate(-1);
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl max-h-[90vh] bg-brand-ivory rounded-3xl overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col shadow-2xl"
      >
        {/* Cover Image */}
        <div className="w-full shrink-0 relative bg-brand-black/5">
          {/* Close Button Inside the Header Image */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 right-6 z-50 w-10 h-10 bg-[#161616] hover:bg-black text-[#FFD100] rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-xl"
            aria-label="Close project"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          
          <img 
            src={project.cover_image} 
            alt={project.title} 
            className="w-full h-auto max-h-[60vh] object-cover rounded-t-3xl block" 
          />
        </div>

        {/* Project Info */}
        <div className="px-8 md:px-12 py-10 shrink-0 bg-brand-ivory relative z-20">
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight leading-none mb-4 text-brand-black">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-brand-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-brand-black/80">
              {project.slug.split('-').join(' ')}
            </span>
            <span className="px-3 py-1 bg-brand-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-brand-black/80">
              {new Date(project.created_at || Date.now()).getFullYear() || '2026'}
            </span>
          </div>

          <p className="text-base md:text-lg text-brand-black/70 leading-relaxed max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Project Media */}
        {project.project_media && project.project_media.length > 0 && (
          <div className="px-8 md:px-12 pb-16 flex flex-col gap-8 bg-brand-ivory">
            {[...(project.project_media || [])]
              .sort((a, b) => a.order_index - b.order_index)
              .map((media, i) => (
                <motion.div 
                  key={media.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full relative rounded-2xl overflow-hidden shadow-sm border border-brand-black/5 flex-shrink-0"
                >
                  {media.media_type === 'video' ? (
                    <video 
                      src={media.media_url} 
                      controls 
                      autoPlay
                      muted
                      loop
                      className="w-full h-auto block" 
                    />
                  ) : (
                    <LazyLoadImage 
                      src={media.media_url} 
                      alt={`Media ${i + 1} for ${project.title}`} 
                      wrapperClassName="w-full block"
                      className="w-full h-auto block" 
                      effect="blur"
                    />
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}