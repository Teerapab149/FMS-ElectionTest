"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
// ✅ Import Component ใหม่
import MeetCandidatesCard from '../components/MeetCandidatesCard';

import { LogIn, Vote, BarChart3, PieChart, Sparkles, TrendingUp, CheckCircle2, Users, ArrowRight, Clock } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({ totalEligible: 0, totalVoted: 0, percentage: "0.00" });
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const slideshowImages = [
    "/images/prob/samo49_1.png"
  ];

  const isMultiImage = slideshowImages.length > 1;

  const extendedImages = isMultiImage
    ? [...slideshowImages, slideshowImages[0]]
    : slideshowImages;

  // 1. useEffect หลัก
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/home-info');
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (data.candidates) {
          setCandidates(data.candidates);
        }

        const eligible = data.stats?.totalEligible || 0;
        const voted = data.stats?.totalVoted || 0;
        const percent = eligible > 0
          ? ((voted / eligible) * 100).toFixed(2)
          : "0.00";

        setStats({
          totalEligible: eligible,
          totalVoted: voted,
          percentage: percent
        });

      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchData();
  }, []);

  // 2. Loop Effect
  useEffect(() => {
    if (!isMultiImage) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
      setIsTransitioning(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isMultiImage]);

  // 3. Magic Reset Effect
  useEffect(() => {
    if (!isMultiImage) return;
    if (currentImageIndex === extendedImages.length - 1) {
      const resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentImageIndex(0);
      }, 1500);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentImageIndex, extendedImages.length, isMultiImage]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 text-gray-900 font-sans selection:bg-purple-300 relative overflow-hidden">

      {/* ================= BACKGROUND DECORATION ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="hidden lg:flex fixed top-0 right-1 h-full items-center justify-end z-0 pointer-events-none select-none overflow-hidden">
        <span className="text-[17em] font-black text-gray-900 opacity-[0.03] leading-none tracking-tighter transform rotate-90 translate-x-[20%] whitespace-nowrap">2026</span>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />

        <main className="flex-grow flex flex-col justify-center py-4 md:py-3 px-5 md:px-8">
          <div className="container mx-auto max-w-7xl">
            {/* ✅ 1. แก้ไข gap-14 เหลือ gap-5 (Mobile) เพื่อดึง 2 ก้อนเข้าหากัน */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-20">

              {/* ===== LEFT SIDE ===== */}
              <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8 md:space-y-7 relative z-20 transform lg:-translate-y-20">

                {/* [MOBILE ONLY] Countdown */}
                <div className="w-full lg:hidden">
                  <CountdownTimer compact={true} />
                </div>

                {/* [DESKTOP/iPad] Badge */}
                <div className="hidden md:flex justify-center lg:justify-start w-full">
                  <div className="relative group inline-flex justify-center items-center cursor-pointer animate-heartbeat hover:animate-none">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-purple-200/50 shadow-lg">
                      <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-purple-500"></span>
                      </span>
                      <span className="text-[12px] md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-widest">
                        Your Vote Matters
                      </span>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* 3. Title Area */}
                <div className="space-y-0 md:space-y-1">
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-1 md:gap-2">
                    <h1 className="text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
                      <span className="text-transparent bg-clip-text pr-2 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 pb-2">SAMO</span>
                    </h1>
                    <div className="bg-gradient-to-br from-purple-700 to-pink-700 rounded-xl md:rounded-2xl p-1 md:p-2 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg">
                      <span className="text-5xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white">49</span>
                    </div>
                  </div>

                  {/* FMS ELECTION (Mobile) */}
                  <div className="flex items-center justify-center gap-3 mt-2 mb-4 opacity-90">
                    <div className="h-[3px] w-8 bg-gradient-to-r from-transparent to-purple-500 rounded-full"></div>
                    <p className="text-sm font-black text-purple-900 tracking-[0.2em] uppercase">FMS Election 2026</p>
                    <div className="h-[3px] w-8 bg-gradient-to-l from-transparent to-purple-500 rounded-full"></div>
                  </div>

                  {/* Desktop/iPad */}
                  <div className="hidden md:flex items-center justify-center lg:justify-start gap-3 mt-2">
                    <div className="h-6 w-1.5 md:h-8 bg-gradient-to-b from-purple-800 via-purple-600 to-purple-800 rounded-full"></div>
                    <p className="text-base md:text-xl font-bold text-gray-500 tracking-[0.3em] uppercase">FMS Election 2026</p>
                  </div>
                </div>

                {/* Thai Text: Hidden Mobile */}
                <div className="space-y-2 md:space-y-2 md:block">
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-800 leading-tight">โครงการเลือกตั้งคณะกรรมการบริหาร</h2>
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-500">สโมสรนักศึกษาคณะวิทยาการจัดการ</h3>
                  <div className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs md:text-sm font-bold rounded-lg">ประจำปีการศึกษา 2569</div>
                </div>

                {/* 5. Action Buttons */}
                <div className="flex flex-col items-center lg:items-start gap-4 pt-0 lg-mt-1 w-full">

                  {/* Vote Button */}
                  <Link href={mounted && user?.isVoted ? "/results" : "/vote"} className="w-full flex justify-center lg:justify-start">
                    <button className={`w-[85%] sm:w-auto group relative overflow-hidden rounded-2xl text-white transition-all duration-300 active:scale-95 ${mounted && user?.isVoted ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'bg-gradient-to-r from-[#8A2680] to-purple-600 shadow-lg'}`}>
                      <span className="relative flex items-center justify-center gap-3 py-4 px-8 font-black text-xl md:text-xl uppercase tracking-wide">
                        {mounted && user?.isVoted ? <>VIEW RESULTS <BarChart3 /></> : mounted && user ? <>VOTE NOW <Vote className="animate-pulse" /></> : <>LOGIN <LogIn /></>}
                      </span>
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </button>
                  </Link>

                  {/* ✅ 2. ปรับ Padding ด้านล่างให้เป็น 0 (pb-0) เพื่อไม่ให้ดัน Stats ลงไปไกล */}
                  <div className="w-full block pt-3 pb-0 lg:hidden">
                    <MeetCandidatesCard candidates={candidates} />
                  </div>

                  {/* Countdown Desktop */}
                  <div className="w-full sm:w-auto hidden lg:block"><CountdownTimer /></div>
                </div>
              </div>

              {/* ===== RIGHT SIDE ===== */}
              {/* ✅ 3. แก้ไข gap-8 เป็น gap-4 (Mobile) ให้รูปติดกับ Stats มากขึ้น */}
              <div className="relative flex flex-col items-center w-full lg:w-1/2 -mt-5 lg:mt-10 gap-4 lg:gap-5">

                {/* Desktop Component */}
                <div className="hidden lg:block w-full">
                  <MeetCandidatesCard candidates={candidates} />
                </div>

                {/* 1. Stats Cards */}
                <div className="relative z-20 w-full max-w-[550px] bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-5 lg:p-6 hover:border-purple-200 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">สถิติการลงคะแนน</h3>
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-2.5 bg-white/50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mb-1" />
                      <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">ผู้มีสิทธิ</div>
                      <div className="text-xl md:text-2xl font-black text-gray-800">{stats.totalEligible.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-center p-2.5 bg-purple-50/50 rounded-2xl border border-purple-100 relative overflow-hidden hover:shadow-md transition-shadow">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mb-1 relative z-10" />
                      <div className="text-[9px] md:text-[10px] font-bold text-purple-600 uppercase tracking-wider relative z-10">ใช้สิทธิแล้ว</div>
                      <div className="text-xl md:text-2xl font-black text-purple-900 relative z-10">{stats.totalVoted.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-center p-2.5 bg-green-50/50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow">
                      <PieChart className="w-4 h-4 md:w-5 md:h-5 text-green-600 mb-1" />
                      <div className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-wider">ร้อยละ</div>
                      <div className="flex items-baseline">
                        <span className="text-xl md:text-2xl font-black text-green-800">{stats.percentage}</span>
                        <span className="text-[10px] md:text-xs font-bold text-green-600 ml-1">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Image Slideshow Container */}
                <div className="relative z-10 w-full max-w-[550px] group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-200/40 border-[6px] border-white bg-white">
                    <div
                      className="flex h-full will-change-transform"
                      style={{
                        transform: `translateX(-${currentImageIndex * 100}%)`,
                        transitionDuration: (isTransitioning && isMultiImage) ? '1500ms' : '0ms',
                        transitionProperty: 'transform',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {extendedImages.map((src, index) => (
                        <div key={index} className="min-w-full h-full relative">
                          <Image
                            src={src}
                            alt={`Campaign Poster ${index}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {isMultiImage && (
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1.5">
                      {slideshowImages.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all duration-500 ${(currentImageIndex % slideshowImages.length) === index
                            ? "w-8 bg-purple-400"
                            : "w-2 bg-purple-200"
                            }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </main>

        <footer className="w-full py-6 bg-white/50 backdrop-blur-md border-t border-gray-200/50 text-center relative z-50">
          <p className="text-sm text-gray-500 font-medium">© FMS@PSU 2026. All Rights Reserved.</p>
        </footer>

      </div>
    </div>
  );
}