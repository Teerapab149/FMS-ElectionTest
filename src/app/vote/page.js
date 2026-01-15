"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Navbar from '../../components/Navbar';
import PartyCard from '../../components/PartyCard';
import PartyDetailModal from '../../components/PartyDetailModal';
import VoteConfirmationModal from '../../components/VoteConfirmationModal';
import { CheckCircle, Ban, UserX, AlertCircle, Check, Loader2 } from 'lucide-react'; // ✅ เพิ่ม Loader2

export default function VotePage() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partyForModal, setPartyForModal] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState(null);

  // ✅ 1. เพิ่ม State สำหรับรอโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem("currentUser");
        if (!userStr) { 
            router.replace("/login"); // ใช้ replace ดีกว่า push
            return; 
        }
        const localUser = JSON.parse(userStr);

        // ✅ 2. ยิง API เช็คสถานะล่าสุดจาก Server (Security Check)
        // ตรงนี้ให้เปลี่ยน '/api/check-status' เป็น Endpoint ที่คุณมี
        // หรือถ้ายังไม่มี API แยก ให้ยิงไปที่ที่เช็ค User ได้
        const [candidatesRes, userStatusRes] = await Promise.all([
            fetch('/api/results'),
            // สมมติว่าคุณมี endpoint เช็คสถานะ โดยส่ง studentId ไป
            fetch(`/api/check-status?studentId=${localUser.studentId}`) 
        ]);

        const candidatesData = await candidatesRes.json();
        
        // ถ้า API เช็ค User status ตอบกลับมา
        if (userStatusRes.ok) {
            const userData = await userStatusRes.json();
            
            // ❌ ถ้า Server บอกว่าโหวตแล้ว ดีดออกเลย (ไม่สน localStorage)
            if (userData.isVoted) {
                localStorage.setItem("currentUser", JSON.stringify({ ...localUser, isVoted: true }));
                router.replace("/results");
                return;
            }
            // อัปเดตข้อมูล User ให้สดใหม่เสมอ
            setCurrentUser({ ...localUser, ...userData });
        } else {
            // Fallback กรณีไม่มี API check-status ให้ใช้ค่าเดิมไปก่อน (แต่ไม่แนะนำสำหรับ Production)
            setCurrentUser(localUser);
            if (localUser.isVoted) { router.replace("/results"); return; }
        }

        if (candidatesData.candidates) {
          setCandidates(candidatesData.candidates.sort((a, b) => a.number - b.number));
        }

        // ✅ โหลดเสร็จแล้ว ปิด Loading
        setIsLoading(false);

      } catch (error) { 
        console.error("Error:", error); 
        // กรณี Error อาจจะให้กลับไป Login หรือแสดง Error
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

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
          studentId: currentUser.studentId,
          candidateId: selectedPartyId
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedUser = { ...currentUser, isVoted: true };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setIsConfirmModalOpen(false);
      router.replace("/success"); // ใช้ replace

    } catch (error) {
      alert("❌ เกิดข้อผิดพลาด: " + error.message);
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // ✅ 3. ส่วนแสดงผล Loading Screen
  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
            <Loader2 className="w-10 h-10 text-[#8A2680] animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
        </div>
    );
  }

  // ==========================================
  // 👇 Design เดิมของคุณทั้งหมด เริ่มตรงนี้ 👇
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans selection:bg-purple-100 pb-32 overflow-x-hidden relative">
      <Navbar />

      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-50/40 via-white/10 to-transparent z-0 pointer-events-none"></div>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 max-w-4xl w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-[#8A2680] mb-2 tracking-tight drop-shadow-sm">
            เลือกตั้งสโมสรนักศึกษา
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-500 font-medium">
            สวัสดีคุณ <span className="font-bold text-[#8A2680]">{currentUser?.name}</span>{' '}
            {isSingleParty
              ? "โปรดลงคะแนนรับรองผู้สมัคร"
              : `ปีนี้มีผู้สมัครทั้งหมด ${regularParties.length} พรรค โปรดเลือกพรรคที่ต้องการ`
            }
          </p>
        </div>

        {isSingleParty ? (
          <div className="animate-fade-in-up delay-100 max-w-2xl mx-auto">

            {/* Hero Card */}
            <div className="mb-6 transform transition-transform hover:scale-[1.02] duration-300">
              <PartyCard
                party={regularParties[0]}
                isSelected={selectedPartyId === regularParties[0].id}
                onSelect={() => { }}
                onViewDetails={handleViewDetails}
                variant="hero"
              />
            </div>

            {/* Grid Layout: 2 คอลัมน์ */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">

              {/* 1. ปุ่มรับรอง (Approve) */}
              <button
                onClick={() => handleSelectParty(regularParties[0].id)}
                className={`
                    relative w-full p-4 rounded-2xl transition-all duration-200 group
                    flex flex-row items-center justify-center gap-3
                    /* ✅ Solid Color Logic: ถ้าเลือก -> สีเขียวทึบ + เงาเขียว */
                    ${selectedPartyId === regularParties[0].id
                    ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.4)] scale-[1.02] border-transparent'
                    : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5'}
                `}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                        ${selectedPartyId === regularParties[0].id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm md:text-lg leading-tight">รับรอง</div>
                  <div className={`text-[10px] md:text-xs ${selectedPartyId === regularParties[0].id ? 'text-emerald-100' : 'text-slate-400'}`}>Approve</div>
                </div>
                {selectedPartyId === regularParties[0].id && (
                  <div className="absolute top-2 right-2 bg-white text-emerald-600 p-0.5 rounded-full shadow-sm animate-in zoom-in"><Check size={12} strokeWidth={4}/></div>
                )}
              </button>

              {/* 2. ปุ่มไม่รับรอง (Disapprove) */}
              {disapproveOption && (
                <button
                  onClick={() => handleSelectParty(disapproveOption.id)}
                  className={`
                      relative w-full p-4 rounded-2xl transition-all duration-200 group
                      flex flex-row items-center justify-center gap-3
                      /* ✅ Solid Color Logic: ถ้าเลือก -> สีแดงทึบ + เงาแดง */
                      ${selectedPartyId === disapproveOption.id
                      ? 'bg-red-600 text-white shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] scale-[1.02] border-transparent'
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${selectedPartyId === disapproveOption.id ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                    <UserX size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm md:text-lg leading-tight">ไม่รับรอง</div>
                    <div className={`text-[10px] md:text-xs ${selectedPartyId === disapproveOption.id ? 'text-red-100' : 'text-slate-400'}`}>Disapprove</div>
                  </div>
                  {selectedPartyId === disapproveOption.id && (
                    <div className="absolute top-2 right-2 bg-white text-red-600 p-0.5 rounded-full shadow-sm animate-in zoom-in"><Check size={12} strokeWidth={4}/></div>
                  )}
                </button>
              )}

              {/* 3. ปุ่มงดออกเสียง (Abstain) */}
              {abstainOption && (
                <button
                  onClick={() => handleSelectParty(abstainOption.id)}
                  className={`
                      col-span-2 relative w-full p-4 rounded-2xl transition-all duration-200 group
                      flex flex-row items-center justify-center gap-3
                      /* ✅ Solid Color Logic: ถ้าเลือก -> สีส้มทึบ + เงาส้ม */
                      ${selectedPartyId === abstainOption.id
                      ? 'bg-orange-500 text-white shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] scale-[1.02] border-transparent'
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${selectedPartyId === abstainOption.id ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600'}`}>
                    <Ban size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base md:text-lg leading-tight">งดออกเสียง</div>
                    <div className={`text-[10px] md:text-xs ${selectedPartyId === abstainOption.id ? 'text-orange-100' : 'text-slate-400'}`}>ไม่ประสงค์ลงคะแนนเสียง</div>
                  </div>

                  {selectedPartyId === abstainOption.id && (
                    <div className="absolute top-2 right-2 bg-white text-orange-600 p-0.5 rounded-full shadow-sm animate-in zoom-in"><Check size={12} strokeWidth={4}/></div>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          
          // ==========================================
          // 🔵 CASE 2: Multi Party Grid
          // ==========================================
          <>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 animate-fade-in-up delay-100 mb-5 max-w-6xl mx-auto">
              {regularParties.map((party) => {
                const isFourParties = regularParties.length === 4;
                return (
                  <div key={party.id} className={`flex justify-center w-[calc(50%-0.5rem)] sm:w-[calc(50%-1.5rem)] ${isFourParties ? 'lg:w-[calc(50%-1.5rem)]' : 'lg:w-[calc(33.33%-1.5rem)]'}`}>
                    <div className="w-full max-w-[380px]"> 
                      <PartyCard party={party} isSelected={selectedPartyId === party.id} onSelect={handleSelectParty} onViewDetails={handleViewDetails} variant="grid" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ปุ่มงดออกเสียง (Multi-party) */}
            {abstainOption && (
              <div className="max-w-md mx-auto animate-fade-in-up delay-200 mb-4 w-full px-4">
                  <div className="relative flex items-center justify-center gap-4 py-4 opacity-60">
                    <div className="hidden md:block flex-grow h-px bg-slate-300"></div>
                    <span className="text-[10px] md:text-[12px] text-slate-600 font-bold uppercase tracking-wider bg-transparent px-3 text-center whitespace-nowrap">หรือ</span>
                    <div className="hidden md:block flex-grow h-px bg-slate-300"></div>
                  </div>

                  <button
                    onClick={() => handleSelectParty(abstainOption.id)}
                    className={`
                        relative w-full rounded-2xl p-4 flex flex-row items-center justify-center gap-3 transition-all duration-200 group
                        ${selectedPartyId === abstainOption.id
                          ? 'bg-orange-500 text-white shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] scale-[1.02] border-transparent' 
                          : 'bg-white text-slate-700 border-2 border-slate-100 hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5'
                        }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${selectedPartyId === abstainOption.id ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600'}`}>
                      <Ban size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base md:text-lg leading-tight">งดออกเสียง</div>
                      <div className={`text-[10px] md:text-xs ${selectedPartyId === abstainOption.id ? 'text-orange-100' : 'text-slate-400'}`}>ไม่ประสงค์ลงคะแนนเสียง</div>
                    </div>
                    {selectedPartyId === abstainOption.id && (
                      <div className="absolute top-2 right-2 bg-white text-orange-600 p-0.5 rounded-full shadow-sm animate-in zoom-in"><Check size={12} strokeWidth={4}/></div>
                    )}
                  </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer และ Modal */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-3 md:p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 ml-1">ตัวเลือกของคุณ</p>
            <div className="font-bold text-slate-800 text-sm md:text-xl truncate flex items-center gap-2">
              {selectedPartyId === null ? (
                <span className="text-slate-400 flex items-center gap-1 text-sm"><AlertCircle size={16} /> กรุณาเลือก 1 ช่อง</span>
              ) : ( getSelectedLabel() )}
            </div>
          </div>
          <button
            onClick={handleConfirmClick}
            disabled={selectedPartyId === null || isSubmitting}
            className={`
                px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 justify-center text-sm md:text-base min-w-[120px]
                ${selectedPartyId === null
                ? 'bg-slate-300 cursor-not-allowed shadow-none opacity-70'
                : 'bg-gradient-to-r from-[#8A2680] to-[#701e68] hover:scale-[1.02] active:scale-95 shadow-purple-200'
              }
            `}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการลงคะแนน'}
          </button>
        </div>
      </div>

      <PartyDetailModal party={partyForModal} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} showVoteButton={false} />
      <VoteConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={submitVote} party={selectedParty} isVoteNo={isVoteNo} isDisapprove={isDisapprove} />
    </div>
  );
}