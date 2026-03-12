import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Send, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    id: 'name',
    question: "Hello, I'm Animatrips. What's the name of the brand we're boarding?",
    placeholder: "Brand name...",
  },
  {
    id: 'mission',
    question: "What's the destination? (Your brand's mission)",
    placeholder: "We want to solve...",
  },
  {
    id: 'audience',
    question: "Who are our passengers? (Target audience)",
    placeholder: "Our ideal customers are...",
  },
  {
    id: 'vibe',
    question: "What's the atmosphere on this flight?",
    options: ['High-Energy', 'Zen & Minimal', 'Playful', 'Ultra-Premium'],
  },
  {
    id: 'service',
    question: "Which trip are we taking?",
    options: ['Branding', 'Motion', 'Web & UI', 'Content'],
  },
  {
    id: 'timeline',
    question: "When do we need to arrive? (Project timeline)",
    placeholder: "ASAP, in 3 months...",
  },
  {
    id: 'competitors',
    question: "Who else is on the flight path? (Competitors)",
    placeholder: "We're watching...",
  },
  {
    id: 'budget',
    question: "What's the fuel for this trip? (Budget range)",
    options: ['$5k - $10k', '$10k - $25k', '$25k+', 'Not sure yet'],
  },
  {
    id: 'email',
    question: "I have a clear vision for your brand. Where should I send the itinerary?",
    placeholder: "Enter your email address...",
    type: "email",
  },
  {
    id: 'thanks',
    question: "Coordinates received. Our creative director will be in touch within 24 hours.",
    isFinal: true,
  }
];

export const ChatFlow = ({ isHero = false }: { isHero?: boolean }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (value?: string) => {
    const val = value || inputValue;
    if (!val && !STEPS[currentStep].options) return;

    const stepId = STEPS[currentStep].id;
    const cleaned = typeof val === 'string' ? val.trim() : val;

    // Email validation for the email step
    if (stepId === 'email') {
      const email = String(cleaned).toLowerCase();
      // Basic email validation (can be expanded for more specific requirements)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setError(null);
    setAnswers(prev => ({ ...prev, [stepId]: String(cleaned) }));
    setInputValue('');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const step = STEPS[currentStep];

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Submit form when reaching the final step
  useEffect(() => {
    const isFinal = STEPS[currentStep]?.isFinal;
    if (!isHero || !isFinal) return;
    if (isSubmitting) return;

    const email = (answers.email ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())) return;

    const payload = {
      email: email,
      source: 'hero',
      fields: {
        BrandName: answers.name ?? '',
        Mission: answers.mission ?? '',
        TargetAudience: answers.audience ?? '',
        Vibe: answers.vibe ?? '',
        Service: answers.service ?? '',
        Timeline: answers.timeline ?? '',
        Competitors: answers.competitors ?? '',
        Budget: answers.budget ?? '',
        Email: email,
      },
    };

    (async () => {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/send-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Request failed');
      } catch {
        setError('Could not send enquiry. Please try again.');
        setCurrentStep((s) => Math.max(0, s - 1));
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [answers, currentStep, isHero, isSubmitting]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${isHero ? 'glass-panel p-12 md:p-24' : 'paper-panel p-8 md:p-12'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center text-center"
        >
          {isTyping ? (
            <div className="flex gap-3 mb-12 h-[72px] items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -12, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  className="w-4 h-4 bg-brand-black rounded-full"
                />
              ))}
            </div>
          ) : (
            <h2 className={`mb-12 font-display font-bold tracking-tight ${isHero ? 'text-6xl md:text-8xl leading-[0.9]' : 'text-2xl md:text-3xl'}`}>
              {step.question.split(' ').map((word, i) => (
                <span key={i} className={i % 3 === 1 ? 'italic-serif font-normal' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h2>
          )}

          {step.isFinal ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <CheckCircle2 size={64} className="text-brand-black" />
              </motion.div>
              <p className="text-brand-black/60">Your journey starts now.</p>
            </div>
          ) : step.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleNext(opt)}
                  className="p-4 rounded-2xl border border-brand-black/10 bg-white/20 hover:bg-brand-black hover:text-brand-yellow transition-all duration-200 text-lg font-medium backdrop-blur-md"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative w-full max-w-2xl">
              <input
                autoFocus
                type={step.type || 'text'}
                value={inputValue}
                onChange={(e) => {
                  setError(null);
                  setInputValue(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder={step.placeholder}
                className="w-full h-16 md:h-16 px-8 pr-20 rounded-full bg-white/30 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-lg placeholder:text-brand-black/40 backdrop-blur-md"
              />
              <button
                onClick={() => handleNext()}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-black hover:scale-110 transition-transform"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          )}

          {error && !step.isFinal && (
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-red-600/80">{error}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};