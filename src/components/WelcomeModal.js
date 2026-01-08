"use client";

import { useState, useEffect } from 'react';
import { Ghost, CheckCircle2, Heart } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [attempts, setAttempts] = useState(0);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0, rotate: 0 });
  const [isDone, setIsDone] = useState(false);
  const [isStartPranking, setIsStartPranking] = useState(false);
  const [countdown, setCountdown] = useState(6); // ✅ ตัวนับเวลา 5 วินาที

  const TARGET_STUDENT_ID = "6610510129"; 

  useEffect(() => {
    const checkAndShowModal = () => {
      const isJustLoggedIn = sessionStorage.getItem("justLoggedIn");
      const userStr = localStorage.getItem("currentUser");

      if (isJustLoggedIn === "true" && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const currentId = (userData.studentId || userData.username || "").toString().trim();

          if (currentId === TARGET_STUDENT_ID) {
            setUser(userData);
            setIsOpen(true);
            sessionStorage.removeItem("justLoggedIn");
          }
        } catch (e) { console.error(e); }
      }
    };
    const timer = setTimeout(checkAndShowModal, 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ ระบบนับเวลาถอยหลังเมื่อแกล้งเสร็จ
  useEffect(() => {
    if (isDone && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isDone && countdown === 0) {
      setIsOpen(false);
    }
  }, [isDone, countdown]);

  const handleAction = (e) => {
    if (isDone) return; // ถ้าจบแล้วกดอะไรไม่ได้อีก
    if (!isStartPranking) {
      setIsStartPranking(true);
      moveButton(e);
      return;
    }
    moveButton(e);
  };

  const moveButton = (e) => {
    if (isDone) return;
    if (e && e.cancelable) e.preventDefault();

    if (attempts < 3) {
      const randomX = Math.floor(Math.random() * 260) - 130; 
      const randomY = Math.floor(Math.random() * 230) - 180; 
      const randomRotate = Math.floor(Math.random() * 40) - 20;
      
      setButtonPos({ x: randomX, y: randomY, rotate: randomRotate });
      setAttempts(prev => prev + 1);
    } else {
      setIsDone(true);
      setButtonPos({ x: 0, y: 0, rotate: 0 });
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-700" />
      
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 z-[10000] animate-in zoom-in-95 duration-500 border border-slate-100 overflow-hidden text-center flex flex-col items-center">
        
        {/* Icon Section */}
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner transform -rotate-6 transition-all duration-500">
          {isDone ? (
            <Heart size={40} className="text-red-500 animate-bounce fill-red-500" />
          ) : !isStartPranking ? (
            <CheckCircle2 size={40} className="text-green-500" />
          ) : (
            <Ghost size={40} className="text-[#8A2680] animate-pulse" />
          )}
        </div>
        
        {/* Text Content */}
        <h2 className="text-xl font-black text-slate-800 mb-2">
          {isDone ? "โอเค ไม่แกล้งแล้วๆ" : !isStartPranking ? `สวัสดีครับ ${user.name?.split(' ')[0]}` : "อ้าว... วืดเฉย?"}
        </h2>
        
        <div className="min-h-[80px] flex flex-col justify-center">
          {isDone ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-1000">
              <p className="text-blue-600 font-bold italic text-lg">ขอโทษคับ ไม่เเกล้งเเล้วจริงๆ</p>
              <p className="text-slate-500 font-medium mt-2">ขอให้วันนี้เป็นวันที่ดีนะคับ ✨</p>
              <p className="text-slate-300 text-[10px] mt-4 uppercase tracking-widest">
                Closing in {countdown}s...
              </p>
            </div>
          ) : !isStartPranking ? (
            <p className="text-slate-500 text-sm leading-relaxed">
              ยินดีต้อนรับเข้าสู่ระบบครับ<br/>
              <span className="font-bold text-slate-700">ฝากเช็คงานด้วยนะครับ</span>
            </p>
          ) : (
            <p className="text-[#8A2680] font-medium italic animate-pulse">
              ลองเช็คงานในเว็บดูนะคับ
            </p>
          )}
        </div>
        
        {/* Button / Countdown Area */}
        <div className="w-full mt-8 relative flex justify-center items-center h-16">
          {!isDone ? (
            <button 
              onClick={(e) => handleAction(e)}
              onMouseEnter={() => isStartPranking && moveButton()} 
              onTouchStart={(e) => isStartPranking && moveButton(e)}
              style={{ 
                transform: `translate(${buttonPos.x}px, ${buttonPos.y}px) rotate(${buttonPos.rotate}deg)`,
                transition: isStartPranking ? 'all 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'all 0.3s ease'
              }}
              className="whitespace-nowrap px-10 py-4 rounded-2xl bg-[#8A2680] text-white font-bold text-sm shadow-xl active:scale-95 select-none"
            >
              {!isStartPranking ? "ตกลงครับ" : "กดให้โดนสิ!"}
            </button>
          ) : (
            // แถบโหลดเวลาถอยหลัง (Visual Progress)
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}