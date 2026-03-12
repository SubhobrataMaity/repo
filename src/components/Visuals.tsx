import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, useAnimation } from 'motion/react';

export const EyeLogo = ({ size = 48, className = "" }: { size?: number, className?: string }) => {
  const controls = useAnimation();

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      controls.start({
        scaleY: [1, 0.1, 1],
        transition: { duration: 0.2, ease: "easeInOut" }
      });
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, [controls]);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* White Sclera with Black Outline */}
        <path 
          d="M10 50 Q 50 15 90 50 Q 50 85 10 50 Z" 
          fill="white" 
          stroke="black" 
          strokeWidth="3" 
        />
        
        <motion.g animate={controls} style={{ originX: '50%', originY: '50%' }}>
          {/* Iris - Yellow with Wavy Detail */}
          <path 
            d="M50 28 L53 30 L56 28 L59 31 L62 29 L65 33 L68 32 L70 37 L73 37 L72 42 L75 45 L72 48 L73 53 L70 55 L70 60 L65 60 L63 65 L59 63 L56 66 L53 63 L50 66 L47 63 L44 66 L41 63 L37 65 L35 60 L32 60 L32 55 L27 53 L28 48 L25 45 L28 42 L27 37 L30 37 L32 32 L35 33 L38 29 L41 31 L44 28 L47 30 Z" 
            fill="#FFD100" 
            stroke="black" 
            strokeWidth="2"
          />
          {/* Inner Wavy Ring */}
          <path 
            d="M50 38 L52 39 L54 38 L56 40 L58 39 L60 42 L62 41 L63 44 L65 44 L64 47 L66 50 L64 53 L65 56 L63 57 L63 60 L60 60 L59 63 L56 62 L54 64 L52 62 L50 64 L48 62 L46 64 L44 62 L41 63 L40 60 L37 60 L37 57 L35 56 L36 53 L34 50 L36 47 L35 44 L37 44 L38 41 L40 42 L42 39 L44 40 L46 38 L48 39 Z" 
            fill="none" 
            stroke="black" 
            strokeWidth="1.5"
          />
          {/* Pupil */}
          <circle cx="50" cy="50" r="8" fill="black" />
          {/* Shine */}
          <circle cx="47" cy="47" r="2.5" fill="white" />
        </motion.g>
      </svg>
    </div>
  );
};

export const BrandLogo = ({ size = 48, className = "" }: { size?: number, className?: string }) => {
  const controls = useAnimation();

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      controls.start({
        scaleY: [1, 0.1, 1],
        transition: { duration: 0.2, ease: "easeInOut" }
      });
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, [controls]);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Bold A Shape from Image */}
        <path 
          d="M30 95 L45 10 L55 10 L70 95 L56 95 L54 80 L46 80 L44 95 Z M48 25 L52 25 L51 65 L49 65 Z" 
          fill="black" 
        />
        
        {/* Eye centered on the crossbar area */}
        <g transform="translate(0, 5)">
          {/* White Sclera with Black Outline */}
          <path 
            d="M25 50 Q 50 28 75 50 Q 50 72 25 50 Z" 
            fill="white" 
            stroke="black" 
            strokeWidth="2" 
          />
          
          <motion.g animate={controls} style={{ originX: '50%', originY: '50%' }}>
            {/* Iris - Yellow with Wavy Detail */}
            <path 
              d="M50 36 L52 37 L54 36 L56 38 L58 37 L60 40 L62 39 L63 42 L65 42 L64 45 L66 47 L64 49 L65 52 L63 53 L63 56 L60 56 L59 59 L56 58 L54 60 L52 58 L50 60 L48 58 L46 60 L44 58 L41 59 L40 56 L37 56 L37 53 L35 52 L36 49 L34 47 L36 45 L35 42 L37 42 L38 39 L40 40 L42 37 L44 38 L46 36 L48 37 Z" 
              fill="#FFD100" 
              stroke="black" 
              strokeWidth="1.5"
            />
            {/* Inner Wavy Ring */}
            <path 
              d="M50 42 L51 43 L53 42 L54 44 L56 43 L57 45 L59 45 L58 47 L59 49 L57 50 L57 52 L55 52 L54 54 L52 53 L50 54 L48 53 L46 54 L45 52 L43 52 L43 50 L41 49 L42 47 L41 45 L43 45 L43 43 L45 44 L46 42 L48 43 Z" 
              fill="none" 
              stroke="black" 
              strokeWidth="1"
            />
            {/* Pupil */}
            <circle cx="50" cy="50" r="5" fill="black" />
            {/* Shine */}
            <circle cx="48.5" cy="48.5" r="1.5" fill="white" />
          </motion.g>
        </g>
      </svg>
    </div>
  );
};

export const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#FFB800]">
      {/* Grain Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-multiply">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Top Left Shape - Wavy Zebra Pattern */}
      <svg className="absolute top-0 left-0 w-[60%] h-[40%] text-black" viewBox="0 0 600 400" preserveAspectRatio="xMinYMin meet">
        <path d="M0 0 L600 0 C500 80 400 120 300 140 C150 170 80 220 0 300 Z" fill="currentColor" />
        <path d="M0 50 C100 50 200 80 250 140 C300 200 250 280 150 320 C80 350 40 380 0 400" fill="currentColor" />
        <path d="M0 100 C80 100 150 130 180 180 C210 230 180 280 100 320 C50 340 20 360 0 380" fill="#FFB800" />
        <path d="M0 150 C60 150 120 180 140 220 C160 260 140 300 80 330 C40 350 10 360 0 370" fill="currentColor" />
      </svg>

      {/* Top Right Shape */}
      <svg className="absolute top-0 right-0 w-[30%] h-[20%] text-black" viewBox="0 0 300 200" preserveAspectRatio="xMaxYMin meet">
        <path d="M300 0 L0 0 C100 40 150 80 150 120 C150 150 200 180 300 200 Z" fill="currentColor" />
        <path d="M300 50 C250 50 200 80 200 120 C200 150 250 180 300 190" fill="#FFB800" />
      </svg>

      {/* Mid Left Shape */}
      <svg className="absolute top-[35%] left-0 w-[25%] h-[40%] text-black" viewBox="0 0 250 400" preserveAspectRatio="xMinYMid meet">
        <path d="M0 0 C120 50 180 120 120 220 C80 280 40 350 0 400 Z" fill="currentColor" />
        <path d="M0 50 C80 80 120 130 80 200 C50 250 20 300 0 350" fill="#FFB800" />
        <path d="M0 100 C60 120 90 160 60 210 C40 240 10 280 0 320" fill="currentColor" />
      </svg>

      {/* Bottom Right Shape - Large and Wavy */}
      <svg className="absolute bottom-0 right-0 w-[80%] h-[70%] text-black" viewBox="0 0 800 700" preserveAspectRatio="xMaxYMax meet">
        <path d="M800 700 L0 700 C150 600 250 550 400 480 C600 380 750 250 800 50 Z" fill="currentColor" />
        
        {/* Wavy zebra stripes */}
        <path d="M150 700 C250 620 350 580 450 520 C650 420 780 300 800 150" stroke="#FFB800" strokeWidth="25" fill="none" />
        <path d="M300 700 C400 640 500 610 600 550 C750 470 800 380 800 250" stroke="#FFB800" strokeWidth="20" fill="none" />
        <path d="M450 700 C550 660 650 640 750 600 C800 560 800 500 800 400" stroke="#FFB800" strokeWidth="15" fill="none" />
        
        <path d="M200 700 C300 620 400 580 500 520 C700 420 800 300 800 180" stroke="currentColor" strokeWidth="10" fill="none" />
        <path d="M350 700 C450 640 550 610 650 550 C800 470 800 380 800 280" stroke="currentColor" strokeWidth="8" fill="none" />
      </svg>

      {/* Bottom Left Small Wavy Shape */}
      <svg className="absolute bottom-0 left-0 w-[30%] h-[20%] text-black" viewBox="0 0 300 200" preserveAspectRatio="xMinYMax meet">
        <path d="M0 200 L300 200 C200 180 150 150 150 100 C150 50 100 20 0 0 Z" fill="currentColor" />
        <path d="M0 150 C50 150 100 120 100 80 C100 50 50 20 0 10" fill="#FFB800" />
      </svg>
    </div>
  );
};

export const Marquee = ({ items }: { items: string[] }) => {
  return (
    <div className="relative flex overflow-x-hidden bg-brand-black py-6 md:py-10 border-y border-brand-yellow/10">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-brand-yellow text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mx-10 md:mx-20 flex items-center gap-6 md:gap-12">
            {item}
            <div className="w-4 h-4 md:w-6 md:h-6 bg-brand-yellow rounded-full rotate-45" />
          </span>
        ))}
      </div>
    </div>
  );
};

export const Magnetic: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      style={{ position: 'relative' }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};
