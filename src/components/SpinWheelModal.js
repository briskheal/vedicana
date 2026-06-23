"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Gift, RefreshCw, X, ArrowRight, Copy, Check } from 'lucide-react';

const SEGMENTS = [
  { text: 'Free Consult', color: '#8b5cf6', detail: 'Free Ayurvedic consultation with advisor.', code: 'SPINCONSULT', weight: 10 }, // 10%
  { text: 'Better Luck', color: '#64748b', detail: 'Better luck next time!', code: null, weight: 25 }, // 25%
  { text: 'Free Dosha', color: '#10b981', detail: 'Get a free Prakriti body type analysis.', code: 'SPINDOSHA', weight: 15 }, // 15%
  { text: '10% OFF', color: '#ef4444', detail: '10% discount on all Ayurvedic remedies!', code: 'FIRSTSPIN10', weight: 5 }, // 5%
  { text: 'Earn Coins', color: '#eab308', detail: 'Earn 100 loyalty coins.', code: 'SPINCOINS', weight: 15 }, // 15%
  { text: 'Surprise Gift', color: '#f97316', detail: 'Free honey sampler on orders above ₹1000.', code: 'SPINGIFT', weight: 5 }, // 5%
  { text: 'Try Again', color: '#94a3b8', detail: 'Spin again for a surprise retry.', code: 'TRYAGAIN', weight: 15 }, // 15%
  { text: 'Vedic Guide', color: '#0ea5e9', detail: 'Free Ayurvedic diet chart PDF.', code: 'SPINGUIDE', weight: 10 } // 10%
];

export default function SpinWheelModal() {
  const [showModal, setShowModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCompleted, setSpinCompleted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [targetPrize, setTargetPrize] = useState(null);
  
  const [userEmail, setUserEmail] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [wonCoupons, setWonCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [claimingPoints, setClaimingPoints] = useState(false);
  const [pointsClaimMessage, setPointsClaimMessage] = useState(null);

  const canvasRef = useRef(null);
  const wheelRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/api/admin');
  const isInvoice = pathname?.includes('/invoice');
  const hideLauncher = isAdmin || isInvoice;

  // Fetch session details to track individual users vs guests
  useEffect(() => {
    const fetchProfileAndSetAttempts = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        let emailKey = 'guest';

        if (data.loggedIn && data.user?.email) {
          emailKey = data.user.email.toLowerCase().trim();
        }
        setUserEmail(emailKey);

        // Check if just logged in (reset logic)
        if (localStorage.getItem('vedicana_just_logged_in') === 'true') {
          localStorage.removeItem(`vedicana_spin_attempts_${emailKey}`);
          localStorage.removeItem(`vedicana_won_coupons_${emailKey}`);
          localStorage.removeItem('vedicana_just_logged_in');
        }

        // Load attempts and rewards list
        const savedAttempts = localStorage.getItem(`vedicana_spin_attempts_${emailKey}`);
        const savedCoupons = localStorage.getItem(`vedicana_won_coupons_${emailKey}`);

        setAttempts(savedAttempts ? parseInt(savedAttempts, 10) : 0);
        setWonCoupons(savedCoupons ? JSON.parse(savedCoupons) : []);
      } catch (err) {
        console.error("Failed to sync spin wheel user profile session:", err);
        // Fallback silently to guest
        setUserEmail('guest');
        const savedAttempts = localStorage.getItem(`vedicana_spin_attempts_guest`);
        const savedCoupons = localStorage.getItem(`vedicana_won_coupons_guest`);
        setAttempts(savedAttempts ? parseInt(savedAttempts, 10) : 0);
        setWonCoupons(savedCoupons ? JSON.parse(savedCoupons) : []);
      }
    };

    fetchProfileAndSetAttempts();
  }, []);

  // Listen to open triggers (floating buttons or landing page trigger)
  useEffect(() => {
    if (userEmail === null || hideLauncher) return;

    const checkTrigger = () => {
      if (window.location.hash === '#spin') {
        setShowModal(true);
        return;
      }
      
      // Auto-trigger popup if landing page of the storefront and user has remaining attempts
      if (window.location.pathname === '/' && attempts < 5) {
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkTrigger();

    window.addEventListener('hashchange', checkTrigger);
    
    const handleOpenEvent = () => setShowModal(true);
    window.addEventListener('open-spin-wheel', handleOpenEvent);

    return () => {
      window.removeEventListener('hashchange', checkTrigger);
      window.removeEventListener('open-spin-wheel', handleOpenEvent);
    };
  }, [userEmail, attempts, hideLauncher]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const spinWheel = () => {
    if (isSpinning || attempts >= 5) return;
    setIsSpinning(true);
    setSpinCompleted(false);

    // Pick random target slice index based on weighted probability
    const totalWeight = SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let prizeIndex = 0;
    
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (randomNum < SEGMENTS[i].weight) {
        prizeIndex = i;
        break;
      }
      randomNum -= SEGMENTS[i].weight;
    }
    
    // Formula to align midpoint of segment to top pointer peg:
    // targetAngleOffset = 360 - (prizeIndex * 45 + 22.5)
    const targetAngleOffset = 360 - (prizeIndex * 45 + 22.5);
    
    // Smooth high speed initial rotation
    const totalRotation = (8 * 360) + targetAngleOffset;
    
    setRotation(totalRotation);

    setTimeout(() => {
      const prize = SEGMENTS[prizeIndex];
      setIsSpinning(false);
      setSpinCompleted(true);
      setTargetPrize(prize);
      
      let nextAttempts = attempts;
      let nextCoupons = [...wonCoupons];

      if (prize.code !== 'TRYAGAIN') {
        nextAttempts += 1;
        setAttempts(nextAttempts);
        localStorage.setItem(`vedicana_spin_attempts_${userEmail}`, nextAttempts.toString());
      }

      if (prize.code === 'SPINCOINS') {
        if (userEmail !== 'guest') {
          setClaimingPoints(true);
          fetch('/api/user/spin', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setPointsClaimMessage('100 Points have been added to your account!');
              } else {
                setPointsClaimMessage(data.error || 'Failed to claim points.');
              }
            })
            .catch(() => setPointsClaimMessage('Error claiming points.'))
            .finally(() => setClaimingPoints(false));
        }
      } else if (prize.code && prize.code !== 'TRYAGAIN' && !nextCoupons.includes(prize.code)) {
        nextCoupons.push(prize.code);
        setWonCoupons(nextCoupons);
        localStorage.setItem(`vedicana_won_coupons_${userEmail}`, JSON.stringify(nextCoupons));
        
        // Save current coupon globally for fallback
        localStorage.setItem('vedicana_spin_won', 'true');
        localStorage.setItem('vedicana_won_coupon', prize.code);
      }

      triggerConfetti();
    }, 5500); // ease-out duration
  };

  // High performance Canvas Confetti engine
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#10b981', '#3b82f6', '#eab308', '#8b5cf6', '#d4af37'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        vx: Math.random() * 16 - 8,
        vy: Math.random() * -12 - 4
      });
    }

    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let finished = true;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.tiltAngle) + 3 + p.r / 2) / 2 + p.vy * 0.06;
        p.x += p.vx * 0.98;
        p.vy += 0.28; // gravity

        // Draw particle
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        if (p.y < canvas.height && p.x > 0 && p.x < canvas.width) {
          finished = false;
        }
      });

      if (!finished) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  };

  const closeOverlay = () => {
    setShowModal(false);
  };

  const resetSpinState = () => {
    setSpinCompleted(false);
    setRotation(0);
    setTargetPrize(null);
  };

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (hideLauncher && !showModal) return null;

  return (
    <>
      {/* Floating launcher button (only visible when modal is closed and not on admin/invoice pages) */}
      {!showModal && !hideLauncher && (
        <button 
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 left-6 z-[999] bg-gradient-to-r from-[#d4af37] to-[#b89528] text-slate-950 w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 shadow-[#d4af37]/45 flex items-center justify-center group cursor-pointer border border-[#d4af37]/60"
          title="Spin to Win Rewards"
        >
          {/* Slide-out tooltip */}
          <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 bg-[#FCF9F2] text-vedicana-green text-xs font-serif font-semibold py-2 px-4 rounded-xl shadow-lg border border-[#e6c280]/35 whitespace-nowrap opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none hidden md:block select-none shadow-[#d4af37]/10">
            Spin to Win! 🎁
            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FCF9F2] border-r border-t border-[#e6c280]/35 rotate-45"></div>
          </div>
          {/* Gift Icon */}
          <Gift className="text-slate-950 animate-bounce" size={20} />
        </button>
      )}

      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md select-none font-sans p-4">
          {/* Confetti canvas */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none w-full h-full z-10" 
          />

          <div className="relative w-full max-w-[420px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl p-5 md:p-6 text-center animate-fade-in-up z-20">
            
            {/* Header section with explicit title and Close button */}
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-2.5 mb-4">
              <h3 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase flex items-center gap-1.5 font-serif">
                <Sparkles size={13} /> Spin to Win
              </h3>
              <button 
                onClick={closeOverlay}
                disabled={isSpinning}
                className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> Close
              </button>
            </div>

            {!spinCompleted ? (
              <>
                <p className="text-slate-400 text-[11px] md:text-xs font-light tracking-wide mb-4 leading-relaxed max-w-xs mx-auto">
                  Test your fortune to win premium vouchers! You get <strong className="text-white">5 spin attempts</strong> per login.
                </p>

                {/* Attempts Indicator Badge */}
                <div className="mb-4">
                  <span className="text-[11px] text-slate-400">
                    Attempts Used: <strong className="text-[#d4af37] font-semibold">{attempts}/5</strong>
                  </span>
                  <div className="w-28 h-1 bg-slate-800 rounded-full mx-auto mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300"
                      style={{ width: `${(attempts / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Spinner Container (Sized Small) */}
                <div className="relative w-[230px] h-[230px] md:w-[250px] md:h-[250px] mx-auto flex items-center justify-center mb-4">
                  
                  {/* Pointer */}
                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-[#d4af37]" />
                    <div className="w-2.5 h-2.5 bg-white border border-[#d4af37] rounded-full mx-auto -mt-5" />
                  </div>

                  {/* Dynamic SVG Wheel */}
                  <div 
                    ref={wheelRef}
                    className="w-full h-full relative"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 5.5s cubic-bezier(0.15, 0.95, 0.25, 1)' : 'none'
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-slate-700/60 scale-102 pointer-events-none" />
                    <div className="absolute inset-0 rounded-full border border-[#d4af37]/10 scale-[0.98] pointer-events-none" />

                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                      <g transform="rotate(-90 100 100)">
                        {SEGMENTS.map((seg, idx) => {
                          const percent = 1 / 8;
                          const startPercent = idx * percent;
                          const endPercent = (idx + 1) * percent;
                          
                          const [startX, startY] = getCoordinatesForPercent(startPercent);
                          const [endX, endY] = getCoordinatesForPercent(endPercent);
                          
                          const R = 95;
                          const cx = 100;
                          const cy = 100;
                          
                          const x1 = cx + R * startX;
                          const y1 = cy + R * startY;
                          const x2 = cx + R * endX;
                          const y2 = cy + R * endY;
                          
                          const midPercent = startPercent + (percent / 2);
                          const [midX, midY] = getCoordinatesForPercent(midPercent);
                          const R_text = 68;
                          const tx = cx + R_text * midX;
                          const ty = cy + R_text * midY;
                          
                          const textRotation = (midPercent * 360) + 90;

                          return (
                            <g key={idx}>
                              <path 
                                d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                                fill={seg.color}
                                stroke="#1e293b"
                                strokeWidth="1.5"
                                opacity="0.88"
                              />
                              <text
                                x={tx}
                                y={ty}
                                fill="#ffffff"
                                fontSize="5.8"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                                className="tracking-wider uppercase select-none font-sans pointer-events-none"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                              >
                                {seg.text}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                      <circle cx="100" cy="100" r="32" fill="#0f172a" stroke="#d4af37" strokeWidth="2.5" />
                    </svg>
                  </div>

                  {/* Central spin triggers */}
                  <button 
                    onClick={spinWheel}
                    disabled={isSpinning || attempts >= 5}
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fce49c] border-4 border-[#0f172a] shadow-xl text-slate-950 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer z-40 select-none shadow-[#d4af37]/20"
                    style={{ top: 'calc(50% - 32px)', left: 'calc(50% - 32px)' }}
                  >
                    {isSpinning ? (
                      <RefreshCw className="animate-spin text-slate-950" size={20} />
                    ) : (
                      <>
                        <Gift className="text-slate-950 mb-0.5 animate-bounce" size={16} />
                        <span className="text-[9px] font-extrabold leading-none">
                          {attempts >= 5 ? 'DONE' : 'SPIN'}
                        </span>
                      </>
                    )}
                  </button>

                </div>

                {/* Sub-footer cancel link */}
                <button 
                  onClick={closeOverlay}
                  disabled={isSpinning}
                  className="text-[10px] text-slate-500 hover:text-slate-350 underline transition-colors cursor-pointer"
                >
                  Close & shop without spinning
                </button>
              </>
            ) : (
              /* Result UI */
              <div className="py-1 animate-fade-in-up">
                <span className="inline-flex items-center gap-1 bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border border-[#10b981]/30 mb-3">
                  {targetPrize?.code === 'TRYAGAIN' ? 'Retry Bonus!' : targetPrize?.code === null ? 'Spin Complete' : 'Lucky Win!'}
                </span>

                <h2 className="text-xl md:text-2xl font-serif text-white font-bold mb-1.5">
                  {targetPrize?.code === 'TRYAGAIN' 
                    ? 'Try Again!' 
                    : targetPrize?.code === null 
                      ? 'Better Luck!' 
                      : `You Won ${targetPrize?.text}!`}
                </h2>
                
                <p className="text-slate-400 text-xs font-light tracking-wide mb-4 leading-relaxed max-w-xs mx-auto">
                  {targetPrize?.detail}
                </p>

                {/* Voucher Card layout */}
                {targetPrize?.code === 'SPINCOINS' ? (
                  <div className="bg-slate-900 border-2 border-dashed border-[#eab308]/40 p-4 rounded-2xl max-w-xs mx-auto mb-5 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] text-slate-300 font-bold block mb-2 uppercase tracking-widest">Loyalty Bonus</span>
                    {userEmail === 'guest' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400 leading-relaxed">Create an account or log in to claim your 100 Free Loyalty Points!</p>
                        <button 
                          onClick={() => {
                            closeOverlay();
                            router.push('/login');
                          }}
                          className="bg-vedicana-green hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded shadow-md transition-colors w-full cursor-pointer"
                        >
                          Log in to Claim
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {claimingPoints ? (
                          <p className="text-xs text-slate-400">Claiming your points...</p>
                        ) : (
                          <p className="text-xs font-semibold text-[#eab308]">{pointsClaimMessage || 'Processing claim...'}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : targetPrize?.code && targetPrize?.code !== 'TRYAGAIN' && (
                  <div className="bg-slate-900 border-2 border-dashed border-[#d4af37]/30 p-4 rounded-2xl max-w-xs mx-auto mb-5 shadow-inner relative overflow-hidden">
                    <div className="absolute top-[-10px] left-[-10px] w-4 h-4 bg-[#1e293b] rounded-full" />
                    <div className="absolute top-[-10px] right-[-10px] w-4 h-4 bg-[#1e293b] rounded-full" />
                    <div className="absolute bottom-[-10px] left-[-10px] w-4 h-4 bg-[#1e293b] rounded-full" />
                    <div className="absolute bottom-[-10px] right-[-10px] w-4 h-4 bg-[#1e293b] rounded-full" />
                    
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block mb-0.5">Coupon Code</span>
                    <div className="flex items-center justify-center gap-2">
                      <strong className="text-lg font-mono text-[#d4af37] tracking-widest font-bold">
                        {targetPrize.code}
                      </strong>
                      <button 
                        onClick={() => handleCopyCode(targetPrize.code)}
                        className="p-1 rounded-md hover:bg-slate-800 text-[#d4af37] hover:text-white transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === targetPrize.code ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1 tracking-wide font-light">Copy code and apply during checkout</span>
                  </div>
                )}

                {/* Result navigation buttons */}
                <div className="flex flex-col gap-2 max-w-xs mx-auto mb-2">
                  {targetPrize?.code === 'TRYAGAIN' ? (
                    <button 
                      onClick={resetSpinState}
                      className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      Spin Free Retry Now <ArrowRight size={13} />
                    </button>
                  ) : (
                    <>
                      {attempts < 5 && (
                        <button 
                          onClick={resetSpinState}
                          className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          Spin Again ({5 - attempts} Left)
                        </button>
                      )}
                      <button 
                        onClick={closeOverlay}
                        className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        Close & Continue Shopping <ArrowRight size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Won Coupons ledger drawer */}
            {wonCoupons.length > 0 && (
              <div className="mt-4 border-t border-slate-700/50 pt-3 text-left">
                <h3 className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#d4af37] font-bold mb-2 flex items-center gap-1">
                  <Sparkles size={11} /> My Won Coupons ({wonCoupons.length})
                </h3>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {wonCoupons.map((code) => {
                    const seg = SEGMENTS.find(s => s.code === code);
                    return (
                      <div key={code} className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 rounded-lg p-2">
                        <div>
                          <span className="text-[11px] font-mono text-white font-bold tracking-wide">{code}</span>
                          <span className="text-[9px] text-slate-450 block font-light leading-snug">
                            {seg?.text} - {seg?.detail}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(code)}
                          className="text-[9px] text-[#d4af37] hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          {copiedCode === code ? (
                            <>
                              <Check size={10} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={10} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
