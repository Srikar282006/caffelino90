import { useState } from 'react';
import { ArrowLeft, Coffee, LogIn } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { safeStorage } from '../utils/safeStorage';
import svgPaths from "../imports/svg-fpideojqow";
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './Auth/GoogleLogin';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyCafe } from '../services/cafeService';

interface PartnerLoginChoiceProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function PartnerLoginChoice({ onNavigate }: PartnerLoginChoiceProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (userData: any) => {
    setIsProcessing(true);
    setError('');

    try {
      // Check if this Google user has a cafe registered
      const cafeResult = await getMyCafe(userData.id, userData.email);

      if (cafeResult && cafeResult.cafe) {
        const cafe: any = cafeResult.cafe;

        // Store the JWT token for authenticated API calls (menu management, etc.)
        if (cafeResult.token) {
          safeStorage.setItem('cafeToken', cafeResult.token);
        }

        // Store standard cafe credentials in safe storage
        safeStorage.setItem('myCafeOwnerId', userData.id);
        safeStorage.setItem('userId', userData.id);
        safeStorage.setItem('ownerName', userData.name || '');
        safeStorage.setItem('ownerEmail', userData.email || '');
        safeStorage.setItem('myCafeId', cafe._id || cafe.id);

        // Sync profile picture from DB to localStorage
        if (cafe.profilePicture) {
          const credentials = {
            email: userData.email,
            cafeName: cafe.Name || cafe.cafeName,
            profilePicture: cafe.profilePicture,
            registeredDate: cafe.createdAt || new Date().toISOString(),
          };
          safeStorage.setItem('cafeOwnerCredentials', JSON.stringify(credentials));
        }

        toast.success(`Welcome back, ${cafe.Name || cafe.cafeName || 'Partner'}!`);

        setTimeout(() => {
          if (cafe.status === true) {
            // Verified cafe ✅
            onNavigate('cafe-owner-dashboard', {
              cafeName: cafe.Name || cafe.cafeName,
              email: userData.email,
              isCafeOwner: true
            });
          } else {
            // Pending verification ⏳
            onNavigate('cafe-verification-pending');
          }
        }, 1000);

      } else {
        // No cafe found for this Google account
        setError("No café found linked to this Google account. Please Register Your Café first.");
        toast.error("No café found. Please register first.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Login verification error:", err);
      setError("Failed to verify cafe status. " + (err.message || ''));
      setIsProcessing(false);
    }
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8b5943] via-[#d9bf9d] to-[#8b5943] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          {/* Back Button */}
          <button
            onClick={() => setShowLoginForm(false)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-[14px]">Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="size-8 text-white" />
            </div>
            <h1 className="text-[28px] leading-[36px] text-neutral-950 mb-2">Welcome Back</h1>
            <p className="text-[14px] text-slate-600">Sign in to your café dashboard</p>
          </div>

          {/* Google Login Section */}
          <div className="mt-8 mb-4">
            <GoogleOAuthProvider clientId="544452206953-hf3mo2cn3gbkadb8g5ejkm6skigio6er.apps.googleusercontent.com">
              <motion.div
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(107,62,38,0.15), 0 2px 6px rgba(0,0,0,0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="opacity-100 relative z-10">
                  <GoogleLoginButton
                    onLoginSuccess={handleGoogleSuccess}
                    onLoginError={handleGoogleError}
                    onProcessing={setIsProcessing}
                  />
                </div>
              </motion.div>
            </GoogleOAuthProvider>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center"
                >
                  <p className="text-[13px] text-red-600 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Indicator */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 mt-4"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#d4a574]"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span className="text-[13px] text-slate-500 font-medium">Checking café status...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="bg-white px-2 text-slate-500">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Button
            variant="outline"
            onClick={() => onNavigate('cafe-owner-google-login')}
            className="w-full h-[44px]"
          >
            Register Your Café
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: "linear-gradient(148.305deg, rgb(139, 89, 67) 8.4573%, rgb(217, 191, 157) 50%, rgb(139, 89, 67) 95.478%), linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(248, 250, 252) 100%)"
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 bg-black text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 transition-all"
      >
        <svg className="size-4" fill="none" viewBox="0 0 11 11">
          <g>
            <path d={svgPaths.p1e27af80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            <path d="M10 5.33333H0.666665" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </g>
        </svg>
        <span className="text-[14px]">Back</span>
      </button>

      {/* Main Content */}
      <div className="w-full max-w-[896px]">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-['Arial:Regular',sans-serif] text-[32px] md:text-[40px] leading-[48px] text-neutral-950 mb-4">
            Partner with Caffélino
          </h1>
          <p className="font-['Arial:Regular',sans-serif] text-[16px] md:text-[18px] leading-[27px] text-[#314158]">
            Join our network of cafés and connect with amazing communities
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Already Registered Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full bg-[#be9d80] flex items-center justify-center">
                <svg className="size-10" fill="none" viewBox="0 0 34 34">
                  <g>
                    <path d={svgPaths.p126c7780} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                    <path d="M21.6667 16.6667H1.66666" stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                    <path d={svgPaths.p171c8ec0} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <h2 className="font-['Arial:Regular',sans-serif] text-[24px] leading-[32px] text-neutral-950 text-center mb-2">
              Already Registered?
            </h2>
            <p className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#45556c] text-center mb-12">
              Sign in to access your café dashboard
            </p>

            {/* Features List */}
            <ul className="space-y-3 mb-12">
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#4F39F6" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Manage bookings & orders</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#4F39F6" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Track revenue & payments</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#4F39F6" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Engage with loyal groups</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#4F39F6" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Update menu & profile</span>
              </li>
            </ul>

            {/* Sign In Button */}
            <button
              onClick={() => setShowLoginForm(true)}
              className="w-full h-[48px] rounded-[10px] bg-gradient-to-r from-[#8b5943] via-[#d9bf9d] to-[#8b5943] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-md"
            >
              <svg className="size-5" fill="none" viewBox="0 0 17 17">
                <g>
                  <path d={svgPaths.p340df400} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d="M10.8333 8.33333H0.833335" stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d={svgPaths.p362dc100} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </g>
              </svg>
              <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-black">Sign In</span>
            </button>
          </div>

          {/* Register Now Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full bg-[#be9d80] flex items-center justify-center">
                <svg className="size-10" fill="none" viewBox="0 0 37 34">
                  <g>
                    <path d={svgPaths.p1a232700} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                    <path d={svgPaths.p1bbf7800} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                    <path d="M30 9.99996V20" stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                    <path d="M35 15H25" stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <h2 className="font-['Arial:Regular',sans-serif] text-[24px] leading-[32px] text-neutral-950 text-center mb-2">
              Register Now
            </h2>
            <p className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#45556c] text-center mb-12">
              New to Caffélino? Get started today
            </p>

            {/* Features List */}
            <ul className="space-y-3 mb-12">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#00A63E" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Free to join & list your café</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#00A63E" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Reach new customers</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#00A63E" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Build community connections</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 15 11">
                    <path clipRule="evenodd" d={svgPaths.p39063b00} fill="#00A63E" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-[#314158]">Powerful management tools</span>
              </li>
            </ul>

            {/* Register Button */}
            <button
              onClick={() => onNavigate('cafe-owner-google-login')}
              className="w-full h-[48px] rounded-[10px] bg-gradient-to-r from-[#8b5943] via-[#d9bf9d] to-[#8b5943] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-md"
            >
              <svg className="size-5" fill="none" viewBox="0 0 19 17">
                <g>
                  <path d={svgPaths.p19805780} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d={svgPaths.p10fdbe80} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d="M15 5V10" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d="M17.5 7.5H12.5" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </g>
              </svg>
              <span className="font-['Arial:Regular',sans-serif] text-[14px] leading-[21px] text-black">Register Your Café</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#fee685]">
          <div className="flex items-start gap-4">
            <div className="bg-[#fef3c6] rounded-full p-3 flex-shrink-0">
              <svg className="size-6" fill="none" viewBox="0 0 21 15">
                <path d={svgPaths.p96d8b00} stroke="#E17100" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-['Arial:Regular',sans-serif] text-[18px] leading-[26px] text-neutral-950 mb-2">
                Why Partner with Caffélino?
              </h3>
              <p className="font-['Arial:Regular',sans-serif] text-[14px] leading-[22.75px] text-[#45556c]">
                Join hundreds of cafés that are building meaningful connections with their communities. Our platform helps you manage group bookings, track revenue, engage with loyal customers, and grow your business—all from one simple dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
