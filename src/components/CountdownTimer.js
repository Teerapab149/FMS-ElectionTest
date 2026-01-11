// components/CountdownTimer.js
'use client';
import { useState, useEffect } from 'react';
import { Zap, Lock, Clock } from 'lucide-react';

export default function CountdownTimer({ compact = false }) { // รับ prop compact

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

  // Loading State
  if (phase === 'LOADING') return <div className="h-14 md:h-24 w-full animate-pulse bg-white/50 border border-purple-100 rounded-full md:rounded-3xl my-2 mx-auto md:mx-0"></div>;

  // Ended State
  if (phase === 'ENDED') {
    return (
      <div className="flex justify-center lg:justify-start my-4 animate-fade-in">
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-500 font-bold text-xs shadow-inner select-none grayscale opacity-80">
          <Lock className="w-4 h-4" />
          <span className="font-black tracking-wide">ELECTION CLOSED</span>
        </div>
      </div>
    );
  }

  const isRunning = phase === 'RUNNING';

  const config = isRunning
    ? {
        text: "LIVE",
        icon: <Zap className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />,
        borderGradient: "from-orange-400 via-red-500 to-pink-500",
        badgeBg: "bg-red-50",
        textColor: "text-red-600",
        numColor: "text-slate-800",
        unitColor: "text-red-400",
        secondsColor: "text-red-600",
        
        desktopText: "VOTING LIVE",
        desktopIcon: <Zap size={16} className="fill-white animate-pulse" />,
        desktopBadgeBg: "bg-gradient-to-br from-red-500 to-orange-600 shadow-md",
        desktopNumColor: "text-slate-900",
        desktopUnitColor: "text-red-400",
        desktopAccentColor: "text-red-600"
      }
    : {
        text: "SOON",
        icon: <Clock className="w-3.5 h-3.5 text-purple-600" />,
        borderGradient: "from-blue-400 via-purple-400 to-pink-400",
        badgeBg: "bg-purple-50",
        textColor: "text-purple-700",
        numColor: "text-slate-800",
        unitColor: "text-purple-400",
        secondsColor: "text-purple-600",
        
        desktopText: "COMING SOON",
        desktopIcon: <Clock size={16} className="text-white" />,
        desktopBadgeBg: "bg-gradient-to-br from-blue-500 to-purple-600 shadow-md",
        desktopNumColor: "text-slate-900",
        desktopUnitColor: "text-purple-400",
        desktopAccentColor: "text-purple-600"
      };

  return (
    <div className={`w-full flex justify-center lg:justify-start animate-fade-in select-none px-1 ${compact ? 'my-0' : 'my-3 lg:my-0'}`}>
      
      {/* 📱 MOBILE VERSION (Capsule Pill) */}
      <div className="md:hidden relative w-full max-w-[320px]">
         <div className={`relative rounded-full p-[2px] bg-gradient-to-r ${config.borderGradient} shadow-sm`}>
            <div className="relative flex items-center bg-white rounded-full p-1 h-full">
               <div className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full shrink-0 mr-2 ${config.badgeBg}`}>
                  {config.icon}
                  <span className={`text-[10px] font-black tracking-wider uppercase whitespace-nowrap ${config.textColor} translate-y-[0.5px]`}>
                     {config.text}
                  </span>
               </div>
               <div className="flex items-baseline gap-1 pr-3 flex-1 justify-center">
                   <MobileUnit value={timeLeft.days} unit="d" numColor={config.numColor} unitColor={config.unitColor} />
                   <MobileSep color={config.unitColor} />
                   <MobileUnit value={timeLeft.hours} unit="h" numColor={config.numColor} unitColor={config.unitColor} />
                   <MobileSep color={config.unitColor} />
                   <MobileUnit value={timeLeft.minutes} unit="m" numColor={config.numColor} unitColor={config.unitColor} />
                   <MobileSep color={config.unitColor} />
                   <MobileUnit value={timeLeft.seconds} unit="s" numColor={config.secondsColor} unitColor={config.unitColor} isSeconds={true} />
               </div>
            </div>
         </div>
      </div>

      {/* 💻 DESKTOP / iPAD VERSION (Compact & Auto-Width) */}
      {/* ✅ เอา min-w ออก และลด padding เพื่อให้ชิดกับ Element อื่นได้ */}
      <div className="hidden md:inline-flex relative rounded-[1.5rem] p-[2px] bg-gradient-to-r ${config.borderGradient} shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.25)] transition-all duration-500 hover:-translate-y-1 w-full max-w-[550px]">
         
         <div className="relative flex flex-col items-start gap-2 bg-white/95 backdrop-blur-2xl rounded-[calc(1.5rem-2px)] px-5 py-4 w-full">
            
            {/* Top Row: Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${config.desktopBadgeBg} shrink-0 shadow-sm self-start`}>
               {config.desktopIcon}
               <span className="text-[10px] font-black tracking-widest uppercase whitespace-nowrap text-white translate-y-[0.5px]">
                  {config.desktopText}
               </span>
            </div>

            {/* Bottom Row: Timer Numbers (Auto Justify) */}
            <div className="flex items-start justify-between w-full pl-1 pr-2">
                <DesktopUnit value={timeLeft.days} unit="DAYS" numColor={config.desktopNumColor} unitColor={config.desktopUnitColor} />
                <DesktopSep color={config.desktopUnitColor} />
                <DesktopUnit value={timeLeft.hours} unit="HOURS" numColor={config.desktopNumColor} unitColor={config.desktopUnitColor} />
                <DesktopSep color={config.desktopUnitColor} />
                <DesktopUnit value={timeLeft.minutes} unit="MINS" numColor={config.desktopNumColor} unitColor={config.desktopUnitColor} />
                <DesktopSep color={config.desktopUnitColor} />
                <DesktopUnit value={timeLeft.seconds} unit="SECS" numColor={config.desktopAccentColor} unitColor={config.desktopAccentColor} isSeconds={true} />
            </div>
         </div>
      </div>

    </div>
  );
}

// --- Sub Components ---

const MobileUnit = ({ value, unit, numColor, unitColor, isSeconds }) => (
  <div className="flex items-baseline min-w-[1.4rem] justify-center">
     <span className={`text-xl font-black leading-none tabular-nums tracking-tight ${numColor} ${isSeconds ? 'animate-pulse' : ''}`}>
        {String(value).padStart(2, '0')}
     </span>
     <span className={`text-[9px] font-bold uppercase ml-0.5 ${unitColor}`}>{unit}</span>
  </div>
);

const MobileSep = ({ color }) => (
  <span className={`text-lg font-bold opacity-40 ${color} mx-0.5 -translate-y-[1px]`}>:</span>
);

// ✅ DesktopUnit: ลดขนาดลง (text-4xl, w-[3.5rem]) เพื่อประหยัดที่
const DesktopUnit = ({ value, unit, numColor, unitColor, isSeconds }) => (
  <div className="flex flex-col items-start w-[3.5rem]"> 
     <span className={`text-4xl font-black leading-none tabular-nums tracking-tight ${numColor} ${isSeconds ? 'animate-pulse' : ''}`}>
        {String(value).padStart(2, '0')}
     </span>
     <span className={`text-[9px] font-bold uppercase mt-1 tracking-wider ${unitColor} opacity-80`}>{unit}</span>
  </div>
);

// ✅ DesktopSep: ลดความกว้างลง
const DesktopSep = ({ color }) => (
  <div className="h-8 flex items-center justify-center w-4">
      <div className={`flex flex-col gap-1.5 opacity-30 ${color}`}>
          <div className="w-1 h-1 rounded-full bg-current"></div>
          <div className="w-1 h-1 rounded-full bg-current"></div>
      </div>
  </div>
);