import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { safeStorage } from '../utils/safeStorage';

interface CafeVerificationPendingProps {
  onNavigate?: (page: string, data?: any) => void;
}

// Coffee Bean SVG Component
function CoffeeBeanSVG() {
  return (
    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M25 5C15 5 8 12 8 22C8 28 10 33 15 37C12 39 10 42 10 45C10 48 12 50 15 50C18 50 20 48 20 45C20 44 20 43 19 42C23 44 27 44 31 42C30 43 30 44 30 45C30 48 32 50 35 50C38 50 40 48 40 45C40 42 38 39 35 37C40 33 42 28 42 22C42 12 35 5 25 5Z"
        fill="#6B4423"
        opacity="0.85"
      />
      <path
        d="M15 20C15 15 18 12 25 12C32 12 35 15 35 20C35 22 34 24 32 25C30 24 28 23 25 23C22 23 20 24 18 25C16 24 15 22 15 20Z"
        fill="#4A2C1A"
        opacity="0.6"
      />
    </svg>
  );
}

export default function CafeVerificationPending({ onNavigate }: CafeVerificationPendingProps) {
  // Get cafe name from safeStorage
  const cafeName = safeStorage.getItem('pendingCafeName') || 'Your Café';
  const cafeEmail = safeStorage.getItem('pendingCafeEmail') || '';
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ═══════════════════════════════════════════════════════════
  // Poll backend every 5s to check if cafe is verified
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // For cafes registered without an ownerId (legacy/basic flow), we fall back to myCafeId
    const ownerId = safeStorage.getItem('myCafeOwnerId') || safeStorage.getItem('myCafeId') || '';
    if (!ownerId) {
      console.log("No ownerId or myCafeId found in storage for polling.");
      return;
    }

    const checkVerification = async () => {
      try {
        const { getMyCafe } = await import('../services/cafeService');
        const result = await getMyCafe(ownerId);

        if (result && result.cafe && result.cafe.status === true) {
          // Cafe is verified! Auto-redirect to dashboard
          console.log('✅ Cafe verified! Redirecting to dashboard...');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          if (onNavigate) {
            onNavigate('cafe-owner-dashboard', {
              cafeName: result.cafe.cafeName || cafeName,
              email: cafeEmail,
              isCafeOwner: true,
            });
          }
        }
      } catch (error) {
        console.log('Polling verification status...');
      }
    };

    // Check immediately on mount
    checkVerification();

    // Then poll every 5 seconds
    pollIntervalRef.current = setInterval(checkVerification, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [onNavigate, cafeName, cafeEmail]);

  // Generate random coffee beans for background
  const backgroundBeans = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 25 + 40,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    rotation: Math.random() * 360,
  }));

  // Function to skip verification and go to dashboard (for demo purposes)
  const handleSkipToDashboard = () => {
    if (onNavigate) {
      onNavigate('cafe-owner-dashboard', {
        cafeName: cafeName,
        email: cafeEmail,
        isCafeOwner: true
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#8B5943] flex items-center justify-center p-4">
      {/* Subtle grain/paper texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Floating Background Coffee Beans */}
      {backgroundBeans.map((bean) => (
        <motion.div
          key={bean.id}
          className="absolute opacity-20"
          initial={{
            x: `${bean.initialX}vw`,
            y: `${bean.initialY}vh`,
            rotate: bean.rotation,
          }}
          animate={{
            x: [
              `${bean.initialX}vw`,
              `${bean.initialX + (Math.random() * 20 - 10)}vw`,
              `${bean.initialX}vw`,
            ],
            y: [
              `${bean.initialY}vh`,
              `${bean.initialY + (Math.random() * 20 - 10)}vh`,
              `${bean.initialY}vh`,
            ],
            rotate: [bean.rotation, bean.rotation + 360],
          }}
          transition={{
            duration: bean.duration,
            delay: bean.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: `${bean.size}px`,
            height: `${bean.size}px`,
          }}
        >
          <CoffeeBeanSVG />
        </motion.div>
      ))}

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
        style={{
          filter: 'drop-shadow(0px 10px 60px rgba(0, 0, 0, 0.3))',
        }}
      >
        {/* Main Card */}
        <div className="bg-[#8B5943] rounded-3xl p-8">
          {/* Coffee Cup Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-[#D9BF9D] rounded-full p-6 inline-block">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 20C12 18.8954 12.8954 18 14 18H46C47.1046 18 48 18.8954 48 20V36C48 42.6274 42.6274 48 36 48H24C17.3726 48 12 42.6274 12 36V20Z"
                  fill="#8B5943"
                  stroke="#8B5943"
                  strokeWidth="2"
                />
                <path
                  d="M48 24H52C54.2091 24 56 25.7909 56 28V30C56 32.2091 54.2091 34 52 34H48"
                  stroke="#8B5943"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 48C16 50 18 52 20 54H40C42 52 44 50 44 48"
                  stroke="#8B5943"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 18V14C20 12.8954 20.8954 12 22 12C23.1046 12 24 12.8954 24 14V18"
                  stroke="#8B5943"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M30 18V10C30 8.89543 30.8954 8 32 8C33.1046 8 34 8.89543 34 10V18"
                  stroke="#8B5943"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M40 18V14C40 12.8954 40.8954 12 42 12C43.1046 12 44 12.8954 44 14V18"
                  stroke="#8B5943"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-black text-center mb-4"
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              letterSpacing: '-0.5px',
            }}
          >
            Verification Pending
          </motion.h1>

          {/* Cafe Name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-black text-center mb-2"
            style={{
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            {cafeName}
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-black text-center mb-3"
            style={{
              fontSize: '16px',
              fontWeight: '400',
            }}
          >
            Your café is being reviewed by our team.
          </motion.p>

          {/* Small Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-black text-center mb-8"
            style={{
              fontSize: '14px',
            }}
          >
            You'll be notified once approval is completed.
          </motion.p>

          {/* Coffee Beans Loader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center mb-8"
          >
            {/* Circular Container with Rotating Border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="relative w-[140px] h-[140px] border-[5px] border-[#D9BF9D] rounded-full flex items-center justify-center overflow-hidden mb-6"
            >
              {/* Coffee Bean 1 */}
              <motion.div
                className="absolute w-7 h-7"
                style={{ top: '20px', left: '30px' }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0,
                }}
              >
                <CoffeeBeanSVG />
              </motion.div>

              {/* Coffee Bean 2 */}
              <motion.div
                className="absolute w-7 h-7"
                style={{ top: '60px', left: '80px' }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
              >
                <CoffeeBeanSVG />
              </motion.div>

              {/* Coffee Bean 3 */}
              <motion.div
                className="absolute w-7 h-7"
                style={{ top: '90px', left: '40px' }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
              >
                <CoffeeBeanSVG />
              </motion.div>

              {/* Coffee Bean 4 */}
              <motion.div
                className="absolute w-7 h-7"
                style={{ top: '40px', left: '100px' }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.9,
                }}
              >
                <CoffeeBeanSVG />
              </motion.div>

              {/* Coffee Bean 5 */}
              <motion.div
                className="absolute w-7 h-7"
                style={{ top: '10px', left: '70px' }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.2,
                }}
              >
                <CoffeeBeanSVG />
              </motion.div>
            </motion.div>

            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-black"
              style={{
                fontSize: '22px',
                fontWeight: '600',
                letterSpacing: '1px',
              }}
            >
              Waiting for Admin Approval...
            </motion.p>
          </motion.div>

          {/* Estimated Time Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4"
          >
            <p className="text-black text-center text-sm mb-1">
              Estimated Review Time
            </p>
            <p className="text-black text-center" style={{ fontSize: '20px', fontWeight: '600' }}>
              24-48 Hours
            </p>
          </motion.div>
        </div>

        {/* Thank You Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p
            className="text-black"
            style={{
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Thank you for registering your café.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8 space-y-3"
        >
          {/* Documents Received Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#D9BF9D] rounded-full p-2 mt-1 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="#8B5943"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-black text-sm mb-1" style={{ fontWeight: '600' }}>
                  Documents Received
                </p>
                <p className="text-black text-xs">
                  All your registration details have been successfully submitted.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#D9BF9D] rounded-full p-2 mt-1 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2ZM8 11C7.4 11 7 10.6 7 10C7 9.4 7.4 9 8 9C8.6 9 9 9.4 9 10C9 10.6 8.6 11 8 11ZM9 7.5C9 8.1 8.6 8.5 8 8.5C7.4 8.5 7 8.1 7 7.5V5.5C7 4.9 7.4 4.5 8 4.5C8.6 4.5 9 4.9 9 5.5V7.5Z"
                    fill="#8B5943"
                  />
                </svg>
              </div>
              <div>
                <p className="text-black text-sm mb-1" style={{ fontWeight: '600' }}>
                  What's Next?
                </p>
                <p className="text-black text-xs">
                  We'll send you an email and app notification once your café is approved.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Corner Coffee Beans */}
      <div className="absolute top-8 left-8 w-20 h-20 opacity-20">
        <CoffeeBeanSVG />
      </div>
      <div className="absolute bottom-8 right-8 w-20 h-20 opacity-20">
        <CoffeeBeanSVG />
      </div>
    </div>
  );
}