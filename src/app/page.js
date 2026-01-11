// components/MeetCandidatesCard.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, User, Sparkles, Zap } from "lucide-react";

// --- Sub-component: Avatar ---
const CandidateAvatar = ({ logoUrl, index, className }) => {
  const [imageError, setImageError] = useState(false);
  
  // สีพื้นหลังแยกตาม index ให้ดูหลากหลาย
  const bgColors = ['bg-indigo-50', 'bg-purple-50', 'bg-pink-50', 'bg-rose-50'];
  const iconColors = ['text-indigo-400', 'text-purple-400', 'text-pink-400', 'text-rose-400'];

  if (!logoUrl || imageError) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${bgColors[index % 4]} ${className}`}>
         <User size={18} className={`opacity-70 ${iconColors[index % 4]}`} />
      </div>
    );
  }
  return (
    <Image
      src={logoUrl}
      alt={`Candidate ${index + 1}`}
      fill
      className={className || "object-cover"}
      onError={() => setImageError(true)}
      sizes="(max-width: 640px) 48px, 64px"
    />
  );
};

export default function MeetCandidatesCard({ candidates = [] }) {
  // เลือก 4 คนแรกมาแสดงใน Grid
  const activeCandidates = candidates.filter(c => c.number !== 0).slice(0, 4);
  
  // เติม Placeholder ให้ครบ 4 ช่อง ถ้าข้อมูลมีไม่ถึง (เพื่อให้ Grid สวยเสมอ)
  const displayItems = [...activeCandidates];
  while (displayItems.length < 4) {
      displayItems.push(null);
  }

  return (
    <Link href="/candidates" className="group block w-full max-w-[100%] lg:max-w-full mx-auto lg:mb-0">
      
      {/* 🟢 Container หลัก */}
      <div className="relative transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.01] active:scale-[0.99]">

        {/* ✨ 1. Outer Animated Glow (แสงฟุ้งรอบนอกเคลื่อนไหวได้) */}
        <div className="absolute -inset-[3px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[2.2rem] opacity-60 group-hover:opacity-100 blur-sm transition-all duration-500 animate-pulse"></div>
        
        {/* ✨ 2. Strong Ambient Shadow (เงาพื้นหลัง) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-50 transition-all duration-700"></div>

        {/* 🎴 3. Main Card Body */}
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/60 shadow-xl">
            
            {/* Background Layer: Animated Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/40 to-purple-100/30 backdrop-blur-3xl z-0"></div>
            
            {/* Decorative Moving Blobs */}
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl group-hover:translate-x-4 transition-transform duration-1000 z-0"></div>
            <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-bl from-pink-100/40 to-transparent rounded-full blur-3xl group-hover:-translate-x-4 transition-transform duration-1000 z-0"></div>

            {/* Grid Pattern Overlay (เพิ่ม texture จางๆ) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-0 mix-blend-overlay"></div>

            {/* Layout Flexbox */}
            <div className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-7 lg:px-8 lg:py-6 h-full min-h-[150px] lg:min-h-[170px]"> 

              {/* Sparkle Decoration */}
              <Sparkles className="absolute top-4 right-4 text-yellow-400 w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500 animate-bounce" />

              {/* ------------------------------------------------------- */}
              {/* 👈 LEFT SIDE: Text Content */}
              {/* ------------------------------------------------------- */}
              <div className="flex-1 flex flex-col justify-center items-start text-left min-w-0 pr-4">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-2.5 px-2.5 py-1 rounded-full bg-white/60 border border-purple-100 backdrop-blur-sm shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                  </span>
                  <p className="text-[9px] lg:text-[10px] font-extrabold tracking-widest uppercase text-purple-700">
                    Meet Candidates
                  </p>
                </div>

                {/* Heading */}
                <h3 className="text-[1.5rem] leading-[1.1] sm:text-3xl lg:text-[2.2rem] font-black text-slate-800 tracking-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-pink-500 transition-all duration-300">
                  รู้จักผู้สมัคร<br/>
                  <span className="text-slate-400 group-hover:text-indigo-400/80 transition-colors text-xl sm:text-2xl lg:text-3xl font-extrabold">
                    ของคุณหรือยัง?
                  </span>
                </h3>

                {/* CTA Button (Gradient) */}
                <div className="group/btn relative overflow-hidden rounded-full p-[1px] shadow-lg shadow-purple-200/50 transition-all duration-300 group-hover:shadow-purple-400/50 group-hover:scale-105 origin-left">
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-80"></div>
                   <div className="relative bg-white/95 backdrop-blur-md rounded-full px-4 py-1.5 lg:px-5 lg:py-2 flex items-center gap-2 group-hover/btn:bg-white/100 transition-colors">
                      <span className="text-[10px] lg:text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ดูรายละเอียด
                      </span>
                      <ArrowRight size={12} className="text-purple-600 group-hover/btn:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>

              {/* ------------------------------------------------------- */}
              {/* 👉 RIGHT SIDE: 2x2 GRID SYSTEM (The Solution) */}
              {/* ------------------------------------------------------- */}
              {/* ใช้ Grid เพื่อให้เห็นทุกพรรคชัดเจน ไม่ซ้อนกัน */}
              <div className="relative z-20 shrink-0">
                  {/* Grid Container */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2 bg-white/30 backdrop-blur-md rounded-[1.5rem] border border-white/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      
                      {displayItems.map((c, i) => (
                          <div 
                             key={i} 
                             className={`
                                relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 
                                rounded-xl sm:rounded-2xl border-2 border-white shadow-sm overflow-hidden
                                bg-white hover:z-30 transition-all duration-300
                                group-hover:shadow-md
                                ${/* Animation: Hover ที่การ์ดใหญ่ รูปเล็กๆ จะขยับนิดหน่อยแบบสุ่ม */ ''}
                                ${i === 0 ? 'group-hover:-translate-x-1 group-hover:-translate-y-1' : ''}
                                ${i === 1 ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''}
                                ${i === 2 ? 'group-hover:-translate-x-1 group-hover:translate-y-1' : ''}
                                ${i === 3 ? 'group-hover:translate-x-1 group-hover:translate-y-1' : ''}
                             `}
                          >
                             {c ? (
                                 <CandidateAvatar logoUrl={c?.logoUrl} index={i} className="object-cover w-full h-full" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-50/50">
                                   <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                 </div>
                             )}
                             
                             {/* Glossy Overlay on each tile */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      ))}

                      {/* Floating Badge (Extra Detail) */}
                      <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg scale-0 group-hover:scale-100 transition-transform delay-100">
                         {activeCandidates.length} ทีม
                      </div>
                  </div>
              </div>

            </div>
        </div>
      </div>
    </Link>
  );
}