import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './Auth/GoogleLogin';
import { safeStorage } from '../utils/safeStorage';

interface CafeOwnerGoogleLoginProps {
    onNavigate: (page: string, data?: any) => void;
}

// ─── Coffee Bean SVG ─────────────────────────────────────────────
function CoffeeBean({ size = 24, color = '#6b3e26', opacity = 0.7 }: { size?: number; color?: string; opacity?: number }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none" style={{ opacity }}>
            <ellipse cx="12" cy="17" rx="10" ry="15" fill={color} />
            <path d="M6 8 C9 14, 15 14, 18 8" stroke="#4a2a18" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M7 17 C10 20, 14 20, 17 17" stroke="#3d1e10" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
            <ellipse cx="9" cy="11" rx="3" ry="4" fill="#7d4a30" opacity="0.3" />
        </svg>
    );
}

// ─── Coffee Cup SVG ──────────────────────────────────────────────
function CoffeeCup() {
    return (
        <svg width="120" height="130" viewBox="0 0 120 130" fill="none">
            {/* Saucer */}
            <ellipse cx="55" cy="120" rx="50" ry="8" fill="#e8ddd0" opacity="0.3" />
            {/* Cup body */}
            <path d="M20 45 L25 110 C25 115 35 120 55 120 C75 120 85 115 85 110 L90 45 Z" fill="#f5f0eb" stroke="#e8ddd0" strokeWidth="1" />
            {/* Cup inner rim */}
            <ellipse cx="55" cy="45" rx="35" ry="8" fill="#d4c4b0" />
            <ellipse cx="55" cy="45" rx="33" ry="7" fill="#8b6244" />
            {/* Coffee surface */}
            <ellipse cx="55" cy="46" rx="30" ry="5.5" fill="#5c3a22" />
            <ellipse cx="50" cy="45" rx="10" ry="2" fill="#6b4423" opacity="0.5" />
            {/* Handle */}
            <path d="M90 55 C105 55 110 70 110 80 C110 90 105 100 90 100" stroke="#f5f0eb" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M90 60 C100 60 104 72 104 80 C104 88 100 96 90 96" stroke="#e8ddd0" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Cup highlight */}
            <path d="M30 55 L33 105 C33 108 40 112 48 112" stroke="white" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />
        </svg>
    );
}

// ─── Orbiting Bean ──────────────────────────────────────────────
function OrbitingBean({ index, total, radius }: { index: number; total: number; radius: number }) {
    const angle = (index / total) * 360;
    const beanSize = 18 + (index % 3) * 4;
    const duration = 20 + index * 1.5;
    const beanOpacity = 0.65 + (index % 3) * 0.1;

    return (
        <motion.div
            className="absolute"
            style={{
                width: radius * 2,
                height: radius * 2,
                left: `calc(50% - ${radius}px)`,
                top: `calc(50% - ${radius}px)`,
            }}
            animate={{
                rotate: [angle, angle + 360],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            {/* Bean positioned at top of orbit circle */}
            <motion.div
                className="absolute"
                style={{
                    left: radius - beanSize / 2,
                    top: -beanSize / 2,
                }}
                animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 20, -20, 0],
                }}
                transition={{
                    duration: 3 + index * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <CoffeeBean size={beanSize} opacity={beanOpacity} />
            </motion.div>
        </motion.div>
    );
}

// ─── Steam Line ─────────────────────────────────────────────────
function SteamLine({ delay, offsetX }: { delay: number; offsetX: number }) {
    return (
        <motion.div
            className="absolute"
            style={{ left: `calc(50% + ${offsetX}px)`, bottom: '100%' }}
            animate={{
                y: [0, -40, -80],
                opacity: [0, 0.5, 0],
                x: [0, offsetX > 0 ? 8 : -8, offsetX > 0 ? 15 : -15],
                scaleX: [1, 1.5, 2],
            }}
            transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                ease: 'easeOut',
            }}
        >
            <div
                className="rounded-full"
                style={{
                    width: 3,
                    height: 25,
                    background: 'linear-gradient(to top, rgba(255,255,255,0.2), transparent)',
                }}
            />
        </motion.div>
    );
}

// ─── Background Floating Bean ───────────────────────────────────
function FloatingBgBean({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 180, 360],
                opacity: [0.04, 0.08, 0.04],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <CoffeeBean size={size} color="#6b3e26" opacity={0.06} />
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export default function CafeOwnerGoogleLogin({ onNavigate }: CafeOwnerGoogleLoginProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSuccess = (userData: any) => {
        safeStorage.setItem('myCafeOwnerId', userData.id);
        safeStorage.setItem('userId', userData.id);
        safeStorage.setItem('ownerName', userData.name || '');
        safeStorage.setItem('ownerEmail', userData.email || '');
        onNavigate('partner-registration');
    };

    const handleGoogleError = (errorMsg: string) => {
        setError(errorMsg);
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
            style={{ background: '#0f0f0f' }}
        >
            {/* ── Subtle dot pattern ────────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #6b3e26 0.5px, transparent 0.5px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.06,
                }}
            />

            {/* ── Ambient glow ──────────────────────────────────────── */}
            <div className="absolute pointer-events-none" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(107,62,38,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />

            {/* ── Background floating beans ─────────────────────────── */}
            <FloatingBgBean x={5} y={10} size={30} delay={0} duration={12} />
            <FloatingBgBean x={90} y={15} size={22} delay={2} duration={15} />
            <FloatingBgBean x={15} y={75} size={26} delay={1} duration={14} />
            <FloatingBgBean x={80} y={70} size={20} delay={3} duration={16} />
            <FloatingBgBean x={50} y={5} size={18} delay={1.5} duration={13} />
            <FloatingBgBean x={30} y={85} size={24} delay={0.5} duration={11} />
            <FloatingBgBean x={70} y={90} size={16} delay={2.5} duration={17} />
            <FloatingBgBean x={10} y={45} size={20} delay={4} duration={14} />
            <FloatingBgBean x={88} y={50} size={22} delay={1} duration={12} />

            {/* ── Back button ───────────────────────────────────────── */}
            <motion.button
                onClick={() => onNavigate('partner-login-choice')}
                className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.95 }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Back</span>
            </motion.button>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* Coffee Cup + Orbiting Beans Section                    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <motion.div
                className="relative z-10"
                style={{ width: 320, height: 320 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* Orbiting beans (outer ring — 8 beans at radius 140) */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <OrbitingBean key={`outer-${i}`} index={i} total={8} radius={140} />
                ))}

                {/* Orbiting beans (inner ring — 5 beans at radius 95) */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <OrbitingBean key={`inner-${i}`} index={i} total={5} radius={95} />
                ))}

                {/* Glow behind cup */}
                <div
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 220,
                        height: 220,
                        background: 'radial-gradient(circle, rgba(107,62,38,0.25) 0%, rgba(107,62,38,0.08) 50%, transparent 70%)',
                        borderRadius: '50%',
                    }}
                />

                {/* Coffee cup — centered in the middle */}
                <motion.div
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: 150,
                        height: 160,
                        marginLeft: -80,   /* half of SVG width (120) + small adjust for handle */
                        marginTop: -80,    /* half of SVG height */
                    }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {/* Steam lines */}
                    <div className="relative" style={{ width: 120, marginLeft: 5 }}>
                        <SteamLine delay={0} offsetX={-12} />
                        <SteamLine delay={1} offsetX={0} />
                        <SteamLine delay={2} offsetX={12} />
                        <SteamLine delay={0.5} offsetX={-6} />
                        <SteamLine delay={1.5} offsetX={6} />
                    </div>
                    <div style={{ marginLeft: 5 }}>
                        <CoffeeCup />
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* Title + Subtitle + Login                               */}
            {/* ═══════════════════════════════════════════════════════ */}
            <motion.div
                className="relative z-10 text-center mt-8 px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            >
                {/* Hero Title */}
                <h1
                    style={{
                        fontSize: 48,
                        fontWeight: 700,
                        color: '#ffffff',
                        letterSpacing: '1.5px',
                        lineHeight: 1.1,
                        marginBottom: 16,
                    }}
                >
                    Register Your Café
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        fontSize: 16,
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.6,
                        maxWidth: 380,
                        margin: '0 auto 12px',
                    }}
                >
                    Sign in with Google to start your journey<br />as a Caffélino partner
                </p>

                {/* Feature tags */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {['Free Listing', 'Smart Dashboard', 'Grow Revenue'].map((tag, i) => (
                        <motion.span
                            key={tag}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 20,
                                background: 'rgba(107,62,38,0.15)',
                                border: '1px solid rgba(107,62,38,0.25)',
                                color: 'rgba(214,168,126,0.8)',
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                        >
                            ✦ {tag}
                        </motion.span>
                    ))}
                </motion.div>

                {/* ── Google Login Button ──────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ maxWidth: 340, margin: '0 auto' }}
                >
                    <GoogleOAuthProvider clientId="544452206953-hf3mo2cn3gbkadb8g5ejkm6skigio6er.apps.googleusercontent.com">
                        <motion.div
                            style={{
                                background: '#ffffff',
                                borderRadius: 14,
                                padding: 4,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
                            }}
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(107,62,38,0.3), 0 2px 8px rgba(0,0,0,0.2)' }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <GoogleLoginButton
                                onLoginSuccess={handleGoogleSuccess}
                                onLoginError={handleGoogleError}
                                onProcessing={setIsProcessing}
                            />
                        </motion.div>
                    </GoogleOAuthProvider>
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.p
                        style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.p>
                )}

                {/* Processing */}
                {isProcessing && (
                    <motion.div
                        className="flex items-center justify-center gap-2 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a574' }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Signing you in...</span>
                    </motion.div>
                )}

                {/* Divider */}
                <div className="flex items-center my-6" style={{ maxWidth: 300, margin: '24px auto' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ padding: '0 12px', color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 1 }}>SECURE LOGIN</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Footer */}
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, lineHeight: 1.6 }}>
                    By continuing, you agree to Caffélino's{' '}
                    <span style={{ color: 'rgba(214,168,126,0.5)', cursor: 'pointer' }}>Terms of Service</span>
                    {' & '}
                    <span style={{ color: 'rgba(214,168,126,0.5)', cursor: 'pointer' }}>Privacy Policy</span>
                </p>
            </motion.div>
        </div>
    );
}
