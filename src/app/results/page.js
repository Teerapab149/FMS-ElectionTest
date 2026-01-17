"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import ResultCard from "../../components/ResultCard";
import PartyDetailModal from "../../components/PartyDetailModal";
import { ELECTION_CONFIG } from "../../utils/electionConfig";

import { Users, Trophy, PieChart as PieIcon, BarChart3, Medal, Activity, Megaphone, Calendar, Loader2, Lock, ArrowRight, Home } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function ResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ 1. State สำหรับระบบความปลอดภัย (Logic ที่เพิ่มเข้ามา)
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "VOTE" หรือ "FORM"

  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [demographics, setDemographics] = useState({
    totalEligible: 0,
    byMajor: [],
    byYear: [],
    byGender: []
  });
  const [loading, setLoading] = useState(true);

  const [serverStatus, setServerStatus] = useState("WAITING");
  const [campaignDate, setCampaignDate] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);

  // ==========================================
  // 🔒 1. SECURITY & ACCESS CHECK (แก้ไข Logic ตามโจทย์)
  // ==========================================
  useEffect(() => {
    const checkAccess = () => {
      const now = new Date();
      const isEnded = now >= ELECTION_CONFIG.ELECTION_END;

      // 1.1 ถ้าจบการเลือกตั้งแล้ว (ENDED) ให้เข้าดูได้เลย ไม่ต้องเช็คอะไร
      if (isEnded) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      // 1.2 ถ้ายังไม่จบ ให้เช็คสถานะการล็อกอิน
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      // 1.3 เช็คเงื่อนไขโหวตและทำฟอร์มในช่วง Ongoing
      if (status === "authenticated" && session) {
        if (!session.user.isVoted) {
          setModalType("VOTE");
          setShowAccessModal(true);
          setIsAuthorized(false);
        } else if (!session.user.isFormCompleted) {
          setModalType("FORM");
          setShowAccessModal(true);
          setIsAuthorized(false);
        } else {
          // ผ่านเกณฑ์ครบถ้วน
          setIsAuthorized(true);
          setShowAccessModal(false);
        }
        setLoading(false);
      }
    };

    checkAccess();
  }, [status, session, router]);

  // ==========================================
  // 📥 2. DATA FETCHING (คงเดิม)
  // ==========================================
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const COLORS_GENDER = ['#3b82f6', '#ec4899'];
  const COLORS_BAR = '#8A2680';

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results");
      const data = await res.json();

      if (data.status) setServerStatus(data.status);
      if (data.campaignDate) setCampaignDate(new Date(data.campaignDate));

      if (typeof data.totalVotes !== 'undefined') {
        setTotalVotes(data.totalVotes);
      } else if (data.candidates) {
        setTotalVotes(data.candidates.reduce((acc, curr) => acc + curr.score, 0));
      }

      if (data.candidates) setCandidates(data.candidates);

      if (data.stats) {
        const allowedYears = ['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4'];
        const sortedByYear = data.stats.byYear
          ? data.stats.byYear
            .filter(item => allowedYears.includes(item.name.trim()))
            .sort((a, b) => allowedYears.indexOf(a.name.trim()) - allowedYears.indexOf(b.name.trim()))
          : [];

        const genderOrder = ['ชาย', 'หญิง'];
        const sortedByGender = data.stats.byGender ? [...data.stats.byGender].sort((a, b) => {
          return genderOrder.indexOf(a.name) - genderOrder.indexOf(b.name);
        }) : [];

        setDemographics({
          ...data.stats,
          byYear: sortedByYear,
          byGender: sortedByGender
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchResults();
    const now = new Date();
    const isEnded = now >= ELECTION_CONFIG.ELECTION_END;

    if (!isEnded) {
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

 // ==========================================
  // 🕒 3. TIME CONFIGURATION (ปรับปรุงใหม่)
  // ==========================================
  const { ELECTION_START, ELECTION_END } = ELECTION_CONFIG;
  
  // แปลงทุกอย่างเป็น Time (ms) เพื่อความแม่นยำ
  const nowMs = currentTime.getTime(); 
  const startMs = ELECTION_START.getTime();
  const endMs = ELECTION_END.getTime();

  let electionStatus = "WAITING";
  let targetDate = ELECTION_START;

  if (nowMs < startMs) {
    electionStatus = "WAITING";
    targetDate = ELECTION_START;
  } else if (nowMs >= startMs && nowMs < endMs) {
    electionStatus = "ONGOING";
    targetDate = ELECTION_END;
  } else {
    // 🔴 ถ้าเวลาปัจจุบันเลยเวลาปิดไปแล้ว (หรือเท่ากับ)
    electionStatus = "ENDED";
    targetDate = null; // ไม่ต้องมีเป้าหมายนับถอยหลังแล้ว
  }
  const finalStatus = serverStatus !== "WAITING" ? serverStatus : electionStatus;

  const timeDiff = targetDate - now;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
  const seconds = Math.floor((timeDiff / 1000) % 60);

  let countdownText = "";
  if (days > 0) countdownText = `${days} วัน ${hours} ชม. ${minutes} น.`;
  else if (hours > 0) countdownText = `${hours} ชม. ${minutes} น. ${seconds} วิ.`;
  else countdownText = `${minutes} น. ${seconds} วิ.`;

  const campaignDateString = campaignDate ? campaignDate.toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : "เร็วๆ นี้";

  const isNotStarted = finalStatus === "WAITING" || finalStatus === "PRE_CAMPAIGN";

  // ✅ 4. Loading UI (คงความ Responsive เดิม)
  if (loading && finalStatus !== "ENDED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-[#8A2680] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">กำลังตรวจสอบสิทธิ์เข้าถึง...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 overflow-x-hidden relative">
      <Navbar />

      <div className="fixed inset-0 z-0 opacity-[0.3] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {selectedParty && (
        <PartyDetailModal
          party={selectedParty}
          onClose={() => setSelectedParty(null)}
        />
      )}

      {/* ✅ 5. Main Content (ครอบด้วย isAuthorized เพื่อกันการ Flash ของข้อมูล) */}
      <main className={`flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-32 md:py-10 transition-all duration-700 ${!isAuthorized ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        
        {isAuthorized && (
          <>
            {/* Header (จากโค้ดเดิมของคุณ) */}
            <div className="text-center mb-8 lg:mb-16 mt-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2680]/5 text-[#8A2680] text-[10px] md:text-xs font-bold mb-3 md:mb-4 border border-[#8A2680]/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8A2680]"></span>
                </span>
                {finalStatus === "ENDED" ? "FINAL RESULT" : "REAL-TIME UPDATE"}
              </div>
              <h1 className="text-2xl md:text-5xl font-black text-[#8A2680] mb-2 md:mb-3 tracking-tight">
                ผลการเลือกตั้ง SAMO 49
              </h1>
              <p className="text-slate-500 text-xs md:text-base max-w-2xl mx-auto px-4">
                ระบบเลือกตั้งสโมสรนักศึกษา คณะวิทยาการจัดการ ประจำปีการศึกษา 2569
              </p>
            </div>

            {/* Stats Bar (จากโค้ดเดิมของคุณ) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-8 lg:mb-12">
              <div className="col-span-2 lg:col-span-1 bg-white/90 backdrop-blur-sm p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-[#8A2680]/20 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[#8A2680]"></div>
                <div>
                  <p className="text-xs font-bold text-[#8A2680] uppercase tracking-wider mb-1">คะแนนเสียงรวม</p>
                  <p className="text-3xl lg:text-5xl font-black text-[#8A2680]">
                    {isNotStarted ? "-" : totalVotes.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#8A2680]/10 p-2 lg:p-4 rounded-xl text-[#8A2680]"><Activity className="w-6 h-6 lg:w-8 lg:h-8" /></div>
              </div>

              <div className="col-span-1 bg-white/80 backdrop-blur-sm p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ผู้มีสิทธิ์</p>
                  <p className="text-xl lg:text-3xl font-black text-slate-700">{demographics.totalEligible.toLocaleString()}</p>
                </div>
                <div className="bg-slate-100 p-2 lg:p-4 rounded-xl text-slate-400 hidden lg:block"><Users className="w-6 h-6 lg:w-8 lg:h-8" /></div>
              </div>

              <div className="col-span-1 bg-white/80 backdrop-blur-sm p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-green-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-green-600 uppercase tracking-wider mb-1">ร้อยละ</p>
                  <p className="text-xl lg:text-3xl font-black text-green-600">
                    {!isNotStarted && demographics.totalEligible > 0
                      ? ((totalVotes / demographics.totalEligible) * 100).toFixed(2) + "%"
                      : "- %"
                    }
                  </p>
                </div>
                <div className="bg-green-50 p-2 lg:p-4 rounded-xl text-green-600 hidden lg:block"><PieIcon className="w-6 h-6 lg:w-8 lg:h-8" /></div>
              </div>
            </div>

            {/* Candidates Section (จากโค้ดเดิมของคุณ) */}
            <div className="mb-8 lg:mb-12">
              <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-lg lg:text-2xl font-bold text-slate-700 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                  {finalStatus === "ENDED" ? (
                    <><Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" /> สรุปผลการเลือกตั้ง (Official Results)</>
                  ) : finalStatus === "ONGOING" ? (
                    <div className="flex items-center gap-2 text-[#8A2680] font-bold">
                      <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8A2680]"></span>
                      </div>
                      <span className="text-[13px] sm:text-lg lg:text-xl whitespace-nowrap">
                        ขณะนี้กำลังนับคะแนนเสียงของชาว FMS อยู่
                      </span>
                    </div>
                  ) : (
                    <><span className="text-slate-400 text-2xl">⏳</span> ยังไม่เปิดรับลงคะแนน (Upcoming Election)</>
                  )}
                </h2>

                {!isNotStarted && finalStatus !== "ENDED" && (
                  <div className="flex items-center gap-2 text-xs lg:text-base font-bold px-4 py-2 rounded-full border shadow-sm bg-slate-100 text-slate-600 border-slate-200">
                    <span>{electionStatus === "WAITING" ? "⏳ เริ่มใน:" : "🔴 ปิดใน:"}</span>
                    <span className="font-mono text-[#8A2680] text-sm lg:text-lg">{mounted ? countdownText : "..."}</span>
                  </div>
                )}
              </div>

              {finalStatus === "PRE_CAMPAIGN" ? (
                <div className="flex flex-col items-center justify-center py-20 lg:py-32 bg-white/50 border border-dashed border-slate-300 rounded-[2rem] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-100 animate-bounce-gentle">
                    <Megaphone className="w-10 h-10 lg:w-12 lg:h-12 text-[#8A2680]" />
                  </div>
                  <h3 className="text-xl lg:text-3xl font-black text-slate-700 mb-2">ยังไม่เปิดเผยรายชื่อผู้สมัคร</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm lg:text-base"> ข้อมูลผู้สมัครจะเปิดเผยอย่างเป็นทางการในช่วงหาเสียงเลือกตั้ง <br className="hidden md:block" /> (ประมาณ 2 สัปดาห์ก่อนวันเลือกตั้งจริง) </p>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-xs lg:text-sm font-bold text-slate-600">
                    <Calendar size={16} className="text-[#8A2680]" />
                    <span>เปิดเผยข้อมูล: {campaignDateString}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-3 lg:gap-6 bg-white sm:bg-transparent rounded-2xl overflow-hidden sm:overflow-visible border sm:border-0 border-slate-100 shadow-sm sm:shadow-none">
                  {candidates.map((candidate, index) => (
                    <ResultCard key={candidate.id} candidate={candidate} rank={index + 1} totalVotes={totalVotes} status={finalStatus} onClick={() => setSelectedParty(candidate)} />
                  ))}
                </div>
              )}
            </div>

            {/* Charts Section (จากโค้ดเดิมของคุณ) */}
            {finalStatus === "ENDED" ? (
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 animate-fade-in-up">
                <div className="order-2 lg:order-1 bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-4 lg:mb-8"><div className="bg-purple-100 p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-[#8A2680]" /></div><h3 className="text-base lg:text-xl font-bold text-slate-700">แยกตามสาขา</h3></div>
                  <div className="h-[400px] lg:h-[600px] w-full text-xs font-medium">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demographics.byMajor} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={50} tick={{ fontSize: isMobile ? 11 : 14, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="value" fill={COLORS_BAR} radius={[0, 4, 4, 0]} barSize={isMobile ? 24 : 40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="order-1 lg:order-2 grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-8 h-full">
                  <div className="col-span-1 bg-white p-3 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 lg:mb-6"><div className="bg-yellow-100 p-1.5 lg:p-2 rounded-lg"><Medal className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" /></div><h3 className="text-sm lg:text-xl font-bold text-slate-700">ชั้นปี</h3></div>
                    <div className="h-[160px] lg:h-[250px] w-full text-xs font-medium">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demographics.byYear} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 14 }} interval={0} />
                          <YAxis hide /><Tooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={isMobile ? 24 : 50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="col-span-1 bg-white p-3 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 lg:mb-6"><div className="bg-blue-100 p-1.5 lg:p-2 rounded-lg"><PieIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" /></div><h3 className="text-sm lg:text-xl font-bold text-slate-700">เพศ</h3></div>
                    <div className="h-[160px] lg:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={demographics.byGender} cx="50%" cy="50%" innerRadius={isMobile ? 30 : 60} outerRadius={isMobile ? 50 : 90} paddingAngle={5} dataKey="value" stroke="none">
                            {demographics.byGender.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />))}
                          </Pie>
                          <Tooltip /><Legend verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} layout={isMobile ? "horizontal" : "vertical"} iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10px' : '14px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white/50 border border-dashed border-slate-300 rounded-3xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><BarChart3 className="text-slate-400" size={32} /></div>
                <h3 className="text-lg font-bold text-slate-600">สถิติยังไม่เปิดเผย</h3>
                <p className="text-slate-400 text-sm">ข้อมูลสถิติจะแสดงหลังจากปิดหีบเลือกตั้งแล้วเท่านั้น</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ✅ 6. ACCESS DENIED MODAL (Logic ตัวดักหน้าช่วงเลือกตั้ง) */}
      {showAccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>
          <div className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-purple-50/50">
              <Lock className="w-10 h-10 text-[#8A2680]" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">ข้อมูลถูกล็อกไว้</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              ในช่วงการลงคะแนนเสียง <br/>
              คุณต้อง **{modalType === "VOTE" ? "ลงคะแนนเลือกตั้ง" : "ทำแบบประเมิน"}** ให้เสร็จก่อน <br/>
              ถึงจะสามารถเข้าดูสถิติและผลคะแนนได้
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push(modalType === "VOTE" ? "/vote" : "/success")}
                className="w-full py-4 bg-[#8A2680] hover:bg-[#701e68] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 group"
              >
                {modalType === "VOTE" ? "ไปหน้าลงคะแนน" : "ไปทำแบบประเมิน"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button 
                onClick={() => router.replace("/")}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} /> กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 lg:mt-16 text-center py-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <p className="text-slate-400 text-sm">© FMS@PSU 2026. All Rights Reserved.</p>
      </footer>
    </div>
  );
}