'use client';
import { useState, useEffect } from 'react';
import { Timer, Zap, Lock } from 'lucide-react';

export default function CountdownTimer() {
  // --------------------------------------------------------
  // ⚙️ Logic (เหมือนเดิม)
  // --------------------------------------------------------
  const ELECTION_START = new Date('2026-02-06T08:00:00');
  const ELECTION_END   = new Date('2026-02-06T17:30:00');

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [phase, setPhase] = useState('LOADING');

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      if (now < ELECTION_START) {
        setPhase('WAITING');
        return ELECTION_START - now;
      } else if (now >= ELECTION_START && now < ELECTION_END) {
        setPhase('RUNNING');
        return ELECTION_END - now;
      } else {
        setPhase('ENDED');
        return 0;
      }
    };

    const timer = setInterval(() => {
      const diff = calculate();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------------
  // 🎨 Design: Compact Glass Bar (เน้น Mobile Fit)
  // --------------------------------------------------------

  if (phase === 'LOADING') return <div className="h-14 w-full animate-pulse bg-gray-100/50 rounded-full my-4"></div>;

  if (phase === 'ENDED') {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="flex items-center gap-2 px-5 py-2 bg-gray-100 border border-gray-300 rounded-full text-gray-500 font-bold text-sm shadow-sm select-none">
          <Lock className="w-4 h-4" />
          <span>Election Closed</span>
        </div>
      </div>
    );
  }

  const isRunning = phase === 'RUNNING';

  // Config Theme
  const theme = isRunning
    ? {
        wrapperBorder: "from-pink-400 to-red-500", // ขอบ Gradient
        badgeBg: "bg-red-50 text-red-600",
        icon: <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse fill-current" />,
        label: "LIVE",
        numColor: "text-gray-800",
        unitColor: "text-red-400"
      }
    : {
        wrapperBorder: "from-blue-400 via-purple-400 to-pink-400", // ขอบ Gradient
        badgeBg: "bg-purple-50 text-purple-600",
        icon: <Timer className="w-3.5 h-3.5 md:w-4 md:h-4" />,
        label: "SOON",
        numColor: "text-gray-800",
        unitColor: "text-purple-400"
      };

  return (
    <div className="w-full flex justify-center lg:justify-start my-3 animate-fade-in select-none">
      
      {/* 1. Gradient Border Wrapper (ใช้ div ซ้อนเพื่อทำขอบไล่สีบางๆ) */}
      <div className={`p-[1.5px] rounded-full bg-gradient-to-r shadow-lg shadow-purple-200/40 ${theme.wrapperBorder}`}>
        
        {/* 2. Inner Content (พื้นขาว Glass) */}
        <div className="flex items-center gap-2 md:gap-4 px-1.5 py-1.5 md:px-2 md:py-2 bg-white/95 backdrop-blur-xl rounded-full h-full">
          
          {/* Badge: สถานะ (กลมๆ เล็กๆ ด้านซ้าย) */}
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0
            ${theme.badgeBg}
          `}>
            {theme.icon}
            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">
              {theme.label}
            </span>
          </div>

          {/* Time Display */}
          <div className="flex items-baseline gap-1 md:gap-2 pr-3 md:pr-4">
            
            {/* Days (ซ่อนถ้าเป็น 0 เพื่อประหยัดที่ในมือถือ) */}
            {timeLeft.days > 0 && (
              <>
                <TimeUnit value={timeLeft.days} unit="d" numColor={theme.numColor} unitColor={theme.unitColor} />
                <Separator />
              </>
            )}

            <TimeUnit value={timeLeft.hours} unit="h" numColor={theme.numColor} unitColor={theme.unitColor} />
            <Separator />
            
            <TimeUnit value={timeLeft.minutes} unit="m" numColor={theme.numColor} unitColor={theme.unitColor} />
            <Separator />

            {/* Seconds (Fixed Width) */}
            <div className="w-[2.2rem] md:w-[3.5rem] flex items-baseline justify-end">
              <span className={`text-xl md:text-3xl font-black tabular-nums leading-none ${theme.numColor}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className={`text-[10px] md:text-xs font-bold ml-0.5 ${theme.unitColor}`}>s</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

const TimeUnit = ({ value, unit, numColor, unitColor }) => (
  <div className="flex items-baseline">
    <span className={`text-xl md:text-3xl font-black tabular-nums leading-none ${numColor}`}>
      {String(value).padStart(2, '0')}
    </span>
    <span className={`text-[10px] md:text-xs font-bold ml-0.5 ${unitColor}`}>
      {unit}
    </span>
  </div>
);

const Separator = () => (
  <span className="text-gray-300 text-lg md:text-2xl font-bold relative -top-0.5 md:-top-1 opacity-50 mx-0.5">
    :
  </span>
);