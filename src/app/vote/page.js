"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ NextAuth
import Navbar from '../../components/Navbar';
import PartyCard from '../../components/PartyCard';
import PartyDetailModal from '../../components/PartyDetailModal';
import VoteConfirmationModal from '../../components/VoteConfirmationModal';
import { CheckCircle, Ban, UserX, AlertCircle, Check, Loader2 } from 'lucide-react';

export default function VotePage() {
  const router = useRouter();
  // ✅ แก้ไข: เพิ่มฟังก์ชัน update เข้ามาเพื่อใช้รีเฟรชข้อมูลในเครื่อง
  const { data: session, status, update } = useSession(); 

  // State ข้อมูล
  const [candidates, setCandidates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partyForModal, setPartyForModal] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. ตรวจสอบสิทธิ์การเข้าถึง (Auth Guard)
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const studentId = session?.user?.studentId || session?.user?.id;

        const [candidatesRes, userStatusRes] = await Promise.all([
          fetch('/api/results'),
          fetch(`/api/check-status?studentId=${studentId}`)
        ]);

        const candidatesData = await candidatesRes.json();

        if (userStatusRes.ok) {
          const userData = await userStatusRes.json();

          if (userData.isVoted) {
            router.replace("/results");
            return;
          }
          setCurrentUser({ ...session.user, ...userData });
        } else {
          setCurrentUser(session.user);
        }

        if (candidatesData.candidates) {
          setCandidates(candidatesData.candidates.sort((a, b) => a.number - b.number));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session, router]);

  // Handler Functions
  const handleViewDetails = (party) => {
    setPartyForModal(party);
    setIsModalOpen(true);
  };

  const handleSelectParty = (id) => {
    setSelectedPartyId(prev => prev === id ? null : id);
  };

  const handleConfirmClick = () => {
    if (!currentUser || selectedPartyId === null) return;
    setIsConfirmModalOpen(true);
  };

  const submitVote = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.studentId || currentUser.id,
          candidateId: selectedPartyId
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // ✅ จุดที่เพิ่ม: สั่งให้ NextAuth รีเฟรช Session ในเครื่องทันที
      // บรรทัดนี้จะทำให้ปุ่มในหน้าหลักเปลี่ยนเป็น "ดูผลคะแนน" ทันทีที่โหวตเสร็จ
      await update({ isVoted: true });

      // ✅ ส่งพารามิเตอร์ ?voted=true เพื่อบอกหน้า success ว่าเพิ่งโหวตเสร็จ
      setIsConfirmModalOpen(false);
      router.replace("/success?voted=true");

    } catch (error) {
      alert("❌ เกิดข้อผิดพลาด: " + error.message);
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logic แยกประเภทผู้สมัคร
  const regularParties = candidates.filter(c => parseInt(c.number) > 0);
  const abstainOption = candidates.find(c => parseInt(c.number) === 0);
  const disapproveOption = candidates.find(c => parseInt(c.number) === -1);

  const isSingleParty = regularParties.length === 1;
  const selectedParty = candidates.find(c => c.id === selectedPartyId);
  const isVoteNo = selectedParty?.number === 0;
  const isDisapprove = selectedParty?.number === -1;

  const getSelectedLabel = () => {
    if (isVoteNo) return <span className="text-orange-600 flex items-center gap-1 font-bold"><Ban size={18} /> งดออกเสียง</span>;
    if (isDisapprove) return <span className="text-red-600 flex items-center gap-1 font-bold"><UserX size={18} /> ไม่รับรอง</span>;
    if (selectedParty) return <span className="text-[#8A2680] truncate font-bold">{selectedParty.name}</span>;
    return null;
  };

  // 🔵 Loading Screen
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-10 h-10 text-[#8A2680] animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans selection:bg-purple-100 pb-32 overflow-x-hidden relative">
      <Navbar />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-50/40 via-white/10 to-transparent z-0 pointer-events-none"></div>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 max-w-4xl w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-[#8A2680] mb-2 tracking-tight drop-shadow-sm">
            เลือกตั้งสโมสรนักศึกษา
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-500 font-medium">
            สวัสดีคุณ <span className="font-bold text-[#8A2680]">{session?.user?.name}</span>{' '}
            {isSingleParty
              ? "โปรดลงคะแนนรับรองผู้สมัคร"
              : `ปีนี้มีผู้สมัครทั้งหมด ${regularParties.length} พรรค โปรดเลือกพรรคที่ต้องการ`
            }
          </p>
        </div>

        {isSingleParty ? (
          <div className="animate-fade-in-up delay-100 max-w-2xl mx-auto">
            {/* Hero Card สำหรับพรรคเดียว */}
            <div className="mb-6 transform transition-transform hover:scale-[1.02] duration-300">
              <PartyCard
                party={regularParties[0]}
                isSelected={selectedPartyId === regularParties[0].id}
                onSelect={() => { }}
                onViewDetails={handleViewDetails}
                variant="hero"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* ปุ่มรับรอง */}
              <button
                onClick={() => handleSelectParty(regularParties[0].id)}
                className={`relative w-full p-4 rounded-2xl transition-all duration-200 flex flex-row items-center justify-center gap-3
                  ${selectedPartyId === regularParties[0].id
                    ? 'bg-emerald-600 text-white shadow-lg scale-[1.02] border-transparent'
                    : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-emerald-300 hover:shadow-md'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartyId === regularParties[0].id ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm md:text-lg leading-tight">รับรอง</div>
                  <div className={`text-[10px] md:text-xs ${selectedPartyId === regularParties[0].id ? 'text-emerald-100' : 'text-slate-400'}`}>Approve</div>
                </div>
                {selectedPartyId === regularParties[0].id && <div className="absolute top-2 right-2 bg-white text-emerald-600 p-0.5 rounded-full"><Check size={12} strokeWidth={4} /></div>}
              </button>

              {/* ปุ่มไม่รับรอง */}
              {disapproveOption && (
                <button
                  onClick={() => handleSelectParty(disapproveOption.id)}
                  className={`relative w-full p-4 rounded-2xl transition-all duration-200 flex flex-row items-center justify-center gap-3
                    ${selectedPartyId === disapproveOption.id
                      ? 'bg-red-600 text-white shadow-lg scale-[1.02] border-transparent'
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-red-300 hover:shadow-md'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartyId === disapproveOption.id ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>
                    <UserX size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm md:text-lg leading-tight">ไม่รับรอง</div>
                    <div className={`text-[10px] md:text-xs ${selectedPartyId === disapproveOption.id ? 'text-red-100' : 'text-slate-400'}`}>Disapprove</div>
                  </div>
                  {selectedPartyId === disapproveOption.id && <div className="absolute top-2 right-2 bg-white text-red-600 p-0.5 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                </button>
              )}

              {/* ปุ่มงดออกเสียง */}
              {abstainOption && (
                <button
                  onClick={() => handleSelectParty(abstainOption.id)}
                  className={`col-span-2 relative w-full p-4 rounded-2xl transition-all duration-200 flex flex-row items-center justify-center gap-3
                    ${selectedPartyId === abstainOption.id
                      ? 'bg-orange-500 text-white shadow-lg scale-[1.02] border-transparent'
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-orange-300 hover:shadow-md'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartyId === abstainOption.id ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                    <Ban size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base md:text-lg leading-tight">งดออกเสียง</div>
                    <div className={`text-[10px] md:text-xs ${selectedPartyId === abstainOption.id ? 'text-orange-100' : 'text-slate-400'}`}>ไม่ประสงค์ลงคะแนนเสียง</div>
                  </div>
                  {selectedPartyId === abstainOption.id && <div className="absolute top-2 right-2 bg-white text-orange-600 p-0.5 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Multi Party Grid */
          <>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 animate-fade-in-up delay-100 mb-5 max-w-6xl mx-auto">
              {regularParties.map((party) => (
                <div key={party.id} className="flex justify-center w-[calc(50%-0.5rem)] sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)]">
                  <div className="w-full max-w-[380px]">
                    <PartyCard party={party} isSelected={selectedPartyId === party.id} onSelect={handleSelectParty} onViewDetails={handleViewDetails} variant="grid" />
                  </div>
                </div>
              ))}
            </div>

            {abstainOption && (
              <div className="max-w-md mx-auto animate-fade-in-up delay-200 mb-4 w-full px-4">
                <div className="relative flex items-center justify-center gap-4 py-4 opacity-60">
                  <div className="hidden md:block flex-grow h-px bg-slate-300"></div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-3">หรือ</span>
                  <div className="hidden md:block flex-grow h-px bg-slate-300"></div>
                </div>
                <button
                  onClick={() => handleSelectParty(abstainOption.id)}
                  className={`relative w-full rounded-2xl p-4 flex flex-row items-center justify-center gap-3 transition-all
                    ${selectedPartyId === abstainOption.id
                      ? 'bg-orange-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-orange-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartyId === abstainOption.id ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                    <Ban size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base md:text-lg leading-tight">งดออกเสียง</div>
                    <div className={`text-[10px] md:text-xs ${selectedPartyId === abstainOption.id ? 'text-orange-100' : 'text-slate-400'}`}>ไม่ประสงค์ลงคะแนนเสียง</div>
                  </div>
                  {selectedPartyId === abstainOption.id && <div className="absolute top-2 right-2 bg-white text-orange-600 p-0.5 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-3 md:p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 ml-1">ตัวเลือกของคุณ</p>
            <div className="font-bold text-slate-800 text-sm md:text-xl truncate flex items-center gap-2">
              {selectedPartyId === null ? (
                <span className="text-slate-400 flex items-center gap-1 text-sm"><AlertCircle size={16} /> กรุณาเลือก 1 ช่อง</span>
              ) : (getSelectedLabel())}
            </div>
          </div>
          <button
            onClick={handleConfirmClick}
            disabled={selectedPartyId === null || isSubmitting}
            className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 justify-center text-sm md:text-base min-w-[120px]
              ${selectedPartyId === null
                ? 'bg-slate-300 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-[#8A2680] to-[#701e68] hover:scale-[1.02] active:scale-95 shadow-purple-200'}`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการลงคะแนน'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <PartyDetailModal party={partyForModal} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} showVoteButton={false} />
      <VoteConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={submitVote}
        party={selectedParty}
        isVoteNo={isVoteNo}
        isDisapprove={isDisapprove}
      />
    </div>
  );
}