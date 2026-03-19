import { motion } from 'framer-motion';

interface CoffeeLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function CoffeeLoader({ 
  message = "Brewing your experience...", 
  fullScreen = true 
}: CoffeeLoaderProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.4 }
    }
  };

  const beanVariants = {
    bounce: (i: number) => ({
      y: [0, -30, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.25
      }
    })
  };

  const containerClass = fullScreen 
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center py-12";

  // Realistic coffee bean colors (different roast levels)
  const beanColors = [
    { base: '#5D4037', mid: '#4E342E', dark: '#3E2723', highlight: '#8D6E63' },
    { base: '#6D4C41', mid: '#5D4037', dark: '#4E342E', highlight: '#A1887F' },
    { base: '#4E342E', mid: '#3E2723', dark: '#2C1810', highlight: '#6D4C41' },
    { base: '#7D5E4F', mid: '#6D4C41', dark: '#5D4037', highlight: '#9E8176' },
  ];

  return (
    <motion.div
      className={containerClass}
      style={{
        background: 'linear-gradient(135deg, #3e2723 0%, #2c1810 100%)'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Coffee Steam Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Realistic Coffee Beans */}
      <div className="flex gap-4 mb-6 relative z-10">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={beanVariants}
            animate="bounce"
          >
            <svg 
              width="56" 
              height="56" 
              viewBox="0 0 100 100" 
              style={{
                filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))'
              }}
            >
              <defs>
                {/* Main bean gradient */}
                <radialGradient id={`beanGradient${i}`} cx="35%" cy="30%">
                  <stop offset="0%" stopColor={beanColors[i].highlight} stopOpacity="1" />
                  <stop offset="40%" stopColor={beanColors[i].base} stopOpacity="1" />
                  <stop offset="75%" stopColor={beanColors[i].mid} stopOpacity="1" />
                  <stop offset="100%" stopColor={beanColors[i].dark} stopOpacity="1" />
                </radialGradient>
                
                {/* Crack gradient */}
                <linearGradient id={`crackGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={beanColors[i].dark} stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#1a1410" stopOpacity="1" />
                  <stop offset="100%" stopColor={beanColors[i].dark} stopOpacity="0.8" />
                </linearGradient>

                {/* Inner shadow */}
                <filter id={`innerShadow${i}`}>
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="0" dy="2" result="offsetblur"/>
                  <feFlood floodColor="#000000" floodOpacity="0.5"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Coffee bean oval shape with characteristic kidney curve */}
              <ellipse 
                cx="50" 
                cy="50" 
                rx="28" 
                ry="38" 
                fill={`url(#beanGradient${i})`}
                transform="rotate(15 50 50)"
              />
              
              {/* Add subtle bean texture lines */}
              <path
                d="M 50 15 Q 35 25, 28 40 Q 25 50, 28 60 Q 35 75, 50 85"
                stroke={beanColors[i].dark}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />
              <path
                d="M 50 15 Q 65 25, 72 40 Q 75 50, 72 60 Q 65 75, 50 85"
                stroke={beanColors[i].dark}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />

              {/* Characteristic coffee bean center crack/seam */}
              <path
                d="M 50 20 Q 45 35, 46 50 Q 47 65, 50 80"
                stroke={`url(#crackGradient${i})`}
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                filter={`url(#innerShadow${i})`}
              />
              
              {/* Inner crack detail */}
              <path
                d="M 50 25 Q 46 38, 47 50 Q 48 62, 50 75"
                stroke="#0d0a08"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Side shadows for depth */}
              <ellipse 
                cx="28" 
                cy="50" 
                rx="4" 
                ry="28" 
                fill="#000000" 
                opacity="0.25"
                transform="rotate(15 50 50)"
              />
              <ellipse 
                cx="72" 
                cy="50" 
                rx="4" 
                ry="28" 
                fill="#000000" 
                opacity="0.15"
                transform="rotate(15 50 50)"
              />
              
              {/* Realistic highlight */}
              <ellipse 
                cx="40" 
                cy="32" 
                rx="8" 
                ry="12" 
                fill="#ffffff" 
                opacity="0.25"
                transform="rotate(-20 40 32)"
              />
              <ellipse 
                cx="38" 
                cy="30" 
                rx="4" 
                ry="6" 
                fill="#ffffff" 
                opacity="0.4"
                transform="rotate(-20 38 30)"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center relative z-10"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <p className="text-[#d4b5a0] text-lg tracking-wide font-['Advent_Pro',sans-serif]">
          {message}
        </p>
      </motion.div>

      {/* Animated dots */}
      <motion.div className="flex gap-1 mt-2 relative z-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#be9d80] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>

      {/* Coffee cup icon/decoration */}
      <motion.div
        className="absolute bottom-10 opacity-10"
        animate={{
          y: [0, -10, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d4b5a0" strokeWidth="1.5">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="6" y1="2" x2="6" y2="4" strokeLinecap="round"/>
          <line x1="10" y1="2" x2="10" y2="4" strokeLinecap="round"/>
          <line x1="14" y1="2" x2="14" y2="4" strokeLinecap="round"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}
