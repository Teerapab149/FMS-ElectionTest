"use client";

import { Suspense, useState, useEffect } from 'react'; // ✅ เพิ่ม Suspense
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import {
  Check,
  BarChart3,
  ArrowRight,
  X,
  User as UserIcon,
  Loader2,
  Lock,
  Copy,
  XCircle,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

// =========================================================
// 1. แยกเนื้อหาหลักออกมาเป็น Component ย่อย (SuccessContent)
// =========================================================
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ ใช้งานภายใน Suspense Boundary
  const { data: session, status, update } = useSession();

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdTYiywJP7i4xlNq31DzP6SAIYNFazQhHF40GEa1QuDy2lTCQ/formResponse";
  const googleFormEmbedUrl = `${GOOGLE_FORM_URL}?embedded=true`;

  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", action: null });

  const isJustVoted = searchParams.get('voted') === 'true';

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setAlertConfig({
        title: "Access Denied",
        message: "กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้",
        action: () => router.push("/login")
      });
      setShowAlertModal(true);
      return;
    }

    if (status === "authenticated" && session) {
      const hasVoted = isJustVoted || session.user?.isVoted;

      if (!hasVoted) {
        setAlertConfig({
          title: "คุณยังไม่ได้ลงคะแนนเสียง",
          message: "กรุณาทำการเลือกตั้งให้เสร็จสมบูรณ์ก่อน",
          action: () => router.push("/vote")
        });
        setShowAlertModal(true);
        return;
      }

      if (session.user?.isFormCompleted) {
        setIsUnlocked(true);
      }

      setUser({
        studentId: session.user?.studentId || session.user?.id || "-",
        name: session.user?.name || "นักศึกษา",
      });
      setIsAuthorized(true);
    }
  }, [status, session, router, isJustVoted]);

  useEffect(() => {
    let timer;
    if (showModal) {
      setCanConfirm(false);
      timer = setTimeout(() => { setCanConfirm(true); }, 20000);
    }
    return () => clearTimeout(timer);
  }, [showModal]);

  const handleConfirmSubmit = async () => {
    if (!canConfirm) return;
    try {
      const res = await fetch("/api/complete-form", { method: "POST" });
      if (!res.ok) throw new Error("Failed to update status");
      await update({ isFormCompleted: true });
      setIsUnlocked(true);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  const copyStudentId = () => {
    if (user?.studentId) {
      navigator.clipboard.writeText(user.studentId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlertModal(false);
    if (alertConfig.action) alertConfig.action();
  }

  if (status === "loading" || (!isAuthorized && !showAlertModal)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <Loader2 className="w-12 h-12 text-[#8A2680] animate-spin mb-4 relative z-10" />
        <p className="text-slate-500 text-sm font-medium relative z-10">กำลังตรวจสอบข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans p-4 md:p-6 relative overflow-hidden bg-slate-50">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-purple-400 opacity-20 blur-[80px] md:blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-emerald-400 opacity-20 blur-[80px] md:blur-[120px]"></div>
      </div>

      {isAuthorized && (
        <div className="w-full max-w-lg animate-fade-in-up relative z-10">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 ring-1 ring-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8A2680] via-purple-500 to-pink-500"></div>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 group cursor-default">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-700"></div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-emerald-50 relative z-10 animate-bounce-gentle">
                  <Check className="w-10 h-10 md:w-12 md:h-12 text-emerald-500 stroke-[3.5]" />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">บันทึกคะแนนสำเร็จ!</h1>
              <p className="text-slate-500 text-sm md:text-base mb-6 px-2 font-medium">
                ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการขับเคลื่อน<br className="hidden sm:block" />กิจกรรมนักศึกษาคณะวิทยาการจัดการ
              </p>

              <div className="w-full bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-4 md:p-5 text-left mb-6 shadow-sm relative group">
                <div className="flex gap-4 items-start relative z-10">
                  <div className="bg-white p-2.5 rounded-xl text-[#8A2680] shadow-sm ring-1 ring-purple-100 shrink-0 mt-1">
                    <Megaphone size={20} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#8A2680] text-sm md:text-base">เพื่อรับทรานสคริปต์กิจกรรม</h3>
                    <p className="text-slate-700 text-xs md:text-sm leading-relaxed">
                      กรุณาทำแบบประเมินให้ครบถ้วน เพื่อรับ <span className="font-bold text-[#8A2680] bg-purple-100 px-1 rounded inline-block my-0.5">ชั่วโมงกิจกรรมประเภทเลือกเข้าร่วม 2 ชั่วโมง</span>
                    </p>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                      และ <span className="underline decoration-purple-300 decoration-2 underline-offset-2">ปลดล็อคหน้าสรุปผลคะแนนเสียง</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={isUnlocked}
                  className={`w-full py-3.5 md:py-4 px-6 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group
                    ${isUnlocked ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none cursor-default' : 'bg-slate-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-1'}`}
                >
                  {isUnlocked ? (
                    <><span>ส่งแบบประเมินเรียบร้อยแล้ว</span> <Check size={18} /></>
                  ) : (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                      <span>เปิดแบบประเมิน (คลิกที่นี่)</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative group/lock">
                  <button
                    onClick={() => { if (isUnlocked) router.push('/results'); }}
                    disabled={!isUnlocked}
                    className={`w-full py-3.5 md:py-4 px-6 rounded-xl font-bold text-sm md:text-base border transition-all duration-500 flex items-center justify-center gap-2
                      ${isUnlocked ? 'bg-[#8A2680] border-[#8A2680] text-white shadow-lg shadow-purple-200 hover:bg-[#701e68] hover:-translate-y-1' : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isUnlocked ? (
                      <>ไปดูผลคะแนน (Results) <BarChart3 size={18} /></>
                    ) : (
                      <><Lock size={16} /> <span>ล็อค: กรุณาทำแบบประเมินก่อน</span></>
                    )}
                  </button>
                </div>

                <Link href="/" className="block pt-2">
                  <button className="text-slate-400 text-xs md:text-sm font-bold hover:text-slate-600 transition-colors py-2 px-4 rounded-lg hover:bg-slate-50">กลับหน้าหลัก</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal & Alert */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full sm:max-w-4xl h-[92vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-2xl shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-bottom-10 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 p-4 shrink-0 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <UserIcon size={18} className="text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">ข้อมูลของคุณ</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      {user && (
                        <>
                          <button onClick={copyStudentId} className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${isCopied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-slate-200'}`}>
                            {user.studentId} {isCopied ? <Check size={12} /> : <Copy size={10} />}
                          </button>
                          <span className="text-slate-300">|</span>
                          <span className="truncate max-w-[120px]">{user.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs">
                  <ShieldCheck size={16} /> <span>ไม่จำเป็นต้อง Login Google ก็กรอกได้</span>
                </div>
                <button onClick={() => setShowModal(false)} className="hidden md:block text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 bg-slate-50 relative">
              {!isFormLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                  <Loader2 className="w-10 h-10 text-[#8A2680] animate-spin mb-3" />
                  <span className="text-slate-400 text-sm font-medium">กำลังโหลด...</span>
                </div>
              )}
              <iframe src={googleFormEmbedUrl} className="w-full h-full border-0" onLoad={() => setIsFormLoaded(true)} title="Evaluation Form"></iframe>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
                <button
                  onClick={handleConfirmSubmit}
                  disabled={!canConfirm}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 
                    ${canConfirm ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {canConfirm ? <><Check size={16} strokeWidth={3} /> ยืนยันการส่งฟอร์ม</> : <><Loader2 size={16} className="animate-spin" /> กรุณากรอกให้ครบถ้วน...</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">{alertConfig.title}</h3>
            <p className="text-slate-500 text-sm mb-6">{alertConfig.message}</p>
            <button onClick={handleAlertConfirm} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm">ตกลง (OK)</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// 2. ไฟล์หลักที่ Export (ครอบด้วย Suspense)
// =========================================================
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative">
        <Loader2 className="w-12 h-12 text-[#8A2680] animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">กำลังเตรียมข้อมูลแบบประเมิน...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}