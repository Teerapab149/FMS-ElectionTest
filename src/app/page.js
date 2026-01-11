"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import MeetCandidatesCard from '../components/MeetCandidatesCard';

import { LogIn, Vote, BarChart3, PieChart, Sparkles, TrendingUp, CheckCircle2, Users } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({ totalEligible: 0, totalVoted: 0, percentage: "0.00" });
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const slideshowImages = ["/images/prob/samo49_1.png"];
  const isMultiImage = slideshowImages.length > 1;
  const extendedImages = isMultiImage ? [...slideshowImages, slideshowImages[0]] : slideshowImages;

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    const fetchData = async () => {
      try {
        const res = await fetch('/api/home-info');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.candidates) setCandidates(data.candidates);
        const eligible = data.stats?.totalEligible || 0;
        const voted = data.stats?.totalVoted || 0;
        const percent = eligible > 0 ? ((voted / eligible) * 100).toFixed(2) : "0.00";
        setStats({ totalEligible: eligible, totalVoted: voted, percentage: percent });
      } catch (error) { console.error("Error fetching home data:", error); }
    };
    fetchData();
  }, []);
  useEffect(() => { if (!isMultiImage) return; const interval = setInterval(() => { setCurrentImageIndex((prevIndex) => prevIndex + 1); setIsTransitioning(true); }, 10000); return () => clearInterval(interval); }, [isMultiImage]);
  useEffect(() => { if (!isMultiImage) return; if (currentImageIndex === extendedImages.length - 1) { const resetTimeout = setTimeout(() => { setIsTransitioning(false); setCurrentImageIndex(0); }, 1500); return () => clearTimeout(resetTimeout); } }, [currentImageIndex, extendedImages.length, isMultiImage]);

  return (
    // ✅ 1. ล็อคความสูงหน้าจอ (One Page)
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 text-gray-900 font-sans selection:bg-purple-300 relative overflow-hidden lg:h-screen lg:overflow-hidden">

      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="hidden lg:flex fixed top-0 right-1 h-full items-center justify-end z-0 pointer-events-none select-none overflow-hidden">
        <span className="text-[17em] font-black text-gray-900 opacity-[0.03] leading-none tracking-tighter transform rotate-90 translate-x-[20%] whitespace-nowrap">2026</span>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col flex-grow h-full">
        <Navbar />

        {/* ✅ 2. Main Content: ใช้ flex-grow เพื่อดัน Footer ลงล่างสุด */}
        <main className="flex-grow flex flex-col justify-center py-4 md:py-3 px-5 md:px-8 lg:py-0 lg:h-full lg:overflow-hidden">
          <div className="container mx-auto max-w-7xl h-full flex flex-col justify-center">

            {/* Grid Layout: ฝั่งขวาใช้ h-full เพื่อคำนวณพื้นที่รูปภาพ */}
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 lg:gap-10 xl:gap-16 h-full lg:h-[85vh] xl:h-auto">

              {/* ======================= LEFT SIDE ======================= */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left space-y-6 md:space-y-7 lg:space-y-5 relative z-20">

                {/* Mobile Countdown */}
                <div className="w-full md:hidden">
                  <CountdownTimer compact={true} />
                </div>

                {/* Badge */}
                <div className="hidden md:flex justify-center lg:justify-start w-full">
                  <div className="relative group inline-flex justify-center items-center cursor-pointer animate-heartbeat hover:animate-none">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-purple-200/50 shadow-lg">
                      <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-purple-500"></span>
                      </span>
                      <span className="text-[12px] md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-widest">Your Vote Matters</span>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-0 md:space-y-1">
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-1 md:gap-2">
                    <h1 className="text-7xl sm:text-7xl md:text-8xl lg:text-8xl font-black tracking-tighter leading-none">
                      <span className="text-transparent bg-clip-text pr-2 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 pb-2">SAMO</span>
                    </h1>
                    <div className="bg-gradient-to-br from-purple-700 to-pink-700 rounded-xl md:rounded-2xl p-1 md:p-2 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg">
                      <span className="text-5xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white">49</span>
                    </div>
                  </div>
                  <div className="flex md:hidden items-center justify-center gap-3 mt-2 mb-4 opacity-90">
                    <div className="h-[3px] w-8 bg-gradient-to-r from-transparent to-purple-500 rounded-full"></div>
                    <p className="text-[15px] font-black text-purple-900 tracking-[0.2em] uppercase">FMS Election 2026</p>
                    <div className="h-[3px] w-8 bg-gradient-to-l from-transparent to-purple-500 rounded-full"></div>
                  </div>
                  <div className="hidden md:flex items-center justify-center lg:justify-start gap-3 mt-2">
                    <div className="h-6 w-1.5 md:h-8 bg-gradient-to-b from-purple-800 via-purple-600 to-purple-800 rounded-full"></div>
                    <p className="text-base md:text-xl font-bold text-gray-500 tracking-[0.3em] uppercase">FMS Election 2026</p>
                  </div>
                </div>

                {/* Thai Text */}
                <div className="space-y-2 md:space-y-2 md:block">
                  <h2 className="text-[22px] sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-gray-800 leading-tight whitespace-nowrap">โครงการเลือกตั้งคณะกรรมการบริหาร</h2>
                  <h3 className="text-[19px] sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-500 whitespace-nowrap">สโมสรนักศึกษาคณะวิทยาการจัดการ</h3>
                  <div className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 text-[16px] md:text-lg font-bold rounded-lg">ประจำปีการศึกษา 2569</div>
                </div>

                {/* Left Actions */}
                <div className="flex flex-col items-center lg:items-start gap-6 pt-0 lg-mt-2 w-full">

                  {/* Login Button */}
                  <div className="w-full flex justify-center lg:justify-start">
                    <Link href={mounted && user?.isVoted ? "/results" : "/vote"} className="group relative w-[90%] sm:w-auto inline-block">
                      <div className={`absolute -inset-2 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-500 ${mounted && user?.isVoted ? 'bg-blue-400' : mounted && user ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
                      <button className={`relative w-full sm:w-auto overflow-hidden rounded-2xl text-white font-extrabold text-lg md:text-xl uppercase tracking-wider py-3 px-8 flex items-center justify-center gap-2.5 shadow-lg transition-all duration-300 ease-out transform group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-95 bg-[length:200%_auto] bg-gradient-to-r ${mounted && user?.isVoted ? 'from-blue-500 via-cyan-500 to-blue-500 shadow-blue-200' : mounted && user ? 'from-purple-500 via-pink-500 to-purple-500 shadow-pink-200' : 'from-indigo-800 via-violet-500 to-indigo-800 shadow-indigo-200'} hover:bg-right`}>
                        <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                          {mounted && user?.isVoted ? "ดูผลคะแนน / RESULTS" : mounted && user ? "VOTE NOW" : "เข้าสู่ระบบ / LOGIN"}
                          <span className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                            {mounted && user?.isVoted ? <BarChart3 /> : mounted && user ? <Vote className="animate-pulse" /> : <LogIn />}
                          </span>
                        </span>
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
                      </button>
                    </Link>
                  </div>

                  {/* Wrapper for iPad: Countdown + Candidates */}
                  <div className="w-full flex flex-col gap-4 md:max-w-[550px] md:mx-auto lg:mx-0 lg:max-w-[480px]">
                    <div className="w-full hidden md:block lg:hidden pl-1">
                      <CountdownTimer />
                    </div>
                    <div className="w-full pb-4">
                      <MeetCandidatesCard candidates={candidates} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================= RIGHT SIDE ======================= */}
              {/* ใช้ flex-col และ h-full เพื่อกระจายพื้นที่ */}
              <div className="relative flex flex-col items-center w-full lg:w-1/2 -mt-5 lg:mt-0 justify-center lg:h-full lg:pb-2">

                {/* ✅ 3. Group: Countdown & Stats (จับมัดรวมกันเพื่อให้ชิดกันสุดๆ) */}
                <div className="shrink-0 flex flex-col gap-2 w-full max-w-[550px] items-center">

                  {/* Desktop Countdown */}
                  <div className="w-full sm:w-auto hidden lg:block">
                    <CountdownTimer />
                  </div>

                  {/* Stats Cards: The "Pro" Version with Visualization */}
                  <div className="relative z-20 w-full bg-white/90 backdrop-blur-2xl rounded-[1.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-4 lg:p-3 transition-all duration-300 group/card hover:shadow-purple-100/50">

                    {/* Header with Live Pulsing Dot */}
                    <div className="flex items-center justify-between mb-3 lg:mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
                        </div>
                        <h3 className="text-base md:text-lg lg:text-base font-bold text-slate-800 tracking-tight">สถิติแบบเรียลไทม์</h3>
                      </div>
                      <TrendingUp className="w-5 h-5 text-slate-300 group-hover/card:text-purple-400 transition-colors" />
                    </div>

                    {/* Grid Data */}
                    <div className="grid grid-cols-3 gap-2">

                      {/* Item 1: Eligible (Standard) */}
                      <div className="flex flex-col justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all">
                        <div>
                          <div className="text-slate-400 mb-1.5">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ผู้มีสิทธิ</div>
                        </div>
                        <div className="text-lg lg:text-xl font-black text-slate-800 tabular-nums leading-none mt-1">
                          {stats.totalEligible.toLocaleString()}
                        </div>
                      </div>

                      {/* Item 2: Voted (Hero Block - เด่นที่สุด) */}
                      <div className="flex flex-col justify-between p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-100/50 relative overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                        <div className="relative z-10">
                          <div className="text-purple-500 mb-1.5 drop-shadow-sm animate-pulse-slow">
                            <CheckCircle2 className="w-4 h-4 fill-purple-100" />
                          </div>
                          <div className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">ใช้สิทธิแล้ว</div>
                        </div>
                        <div className="text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 tabular-nums leading-none mt-1 relative z-10">
                          {stats.totalVoted.toLocaleString()}
                        </div>
                        {/* Decorative Glow */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/20 rounded-full blur-xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                      </div>

                      {/* Item 3: Percentage with Progress Bar (ทีเด็ด!) */}
                      <div className="flex flex-col p-2.5 rounded-xl bg-green-50/30 border border-green-100/50 hover:bg-green-50/50 transition-all">
                        <div>
                          <div className="text-green-500 mb-1.5">
                            <PieChart className="w-4 h-4" />
                          </div>
                          <div className="text-[9px] font-bold text-green-600 uppercase tracking-wider">ความคืบหน้า</div>
                        </div>

                        <div className="mt-1">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg lg:text-xl font-black text-green-800 tabular-nums leading-none">
                              {stats.percentage}
                            </span>
                            <span className="text-[9px] font-bold text-green-600">%</span>
                          </div>

                          {/* ✅ Progress Bar Visualization */}
                          <div className="w-full h-1.5 bg-green-200/30 rounded-full overflow-hidden mt-2">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                              style={{ width: `${Math.min(parseFloat(stats.percentage) || 0, 100)}%` }}
                            >
                              <div className="absolute right-0 top-0 h-full w-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ✅ 4. Slideshow: ใช้ flex-1 เพื่อยืดเต็มพื้นที่ที่เหลือ (จะใหญ่ขึ้นมาก!) */}
                {/* ใส่ margin-top นิดหน่อย (mt-3) เพื่อเว้นระยะจาก Stats */}
                <div className="relative z-10 w-full max-w-[550px] group flex-1 min-h-0 mt-3 hidden lg:block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                  {/* h-full เพื่อให้ยืดตาม parent flex-1 */}
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-200/40 border-[6px] border-white bg-white">
                    <div className="flex h-full will-change-transform" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transitionDuration: (isTransitioning && isMultiImage) ? '1500ms' : '0ms', transitionProperty: 'transform', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      {extendedImages.map((src, index) => (
                        <div key={index} className="min-w-full h-full relative">
                          {/* object-cover เพื่อให้รูปเต็มพื้นที่โดยไม่เสียสัดส่วน */}
                          <Image src={src} alt={`Campaign Poster ${index}`} fill className="object-cover" priority={index === 0} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {isMultiImage && (
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1.5">
                      {slideshowImages.map((_, index) => (
                        <div key={index} className={`h-1.5 rounded-full transition-all duration-500 ${(currentImageIndex % slideshowImages.length) === index ? "w-8 bg-purple-400" : "w-2 bg-purple-200"}`}></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Slideshow */}
                <div className="relative z-10 w-full max-w-[550px] pt-4 group block lg:hidden aspect-[4/3]">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-200/40 border-[6px] border-white bg-white">
                    <div className="flex h-full will-change-transform" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transitionDuration: (isTransitioning && isMultiImage) ? '1500ms' : '0ms', transitionProperty: 'transform', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      {extendedImages.map((src, index) => (
                        <div key={index} className="min-w-full h-full relative">
                          <Image src={src} alt={`Campaign Poster ${index}`} fill className="object-cover" priority={index === 0} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        <footer className="w-full py-2 lg:py-2 bg-white/50 backdrop-blur-md border-t border-gray-200/50 text-center relative z-50 shrink-0">
          <p className="text-xs lg:text-[12px] text-gray-500 font-medium">© FMS@PSU 2026. All Rights Reserved.</p>
        </footer>

      </div >
    </div >
  );
}