"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// ✅ 1. Import เครื่องมือของ NextAuth
import { signIn, useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  // ✅ 2. ใช้ hook เช็คสถานะ Session ปัจจุบัน
  const { data: session, status } = useSession();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 3. เช็คว่าถ้ามี Session อยู่แล้ว ให้ดีดไปหน้าอื่นเลย (ไม่ต้อง Login ซ้ำ)
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user.isVoted) {
        router.replace("/results"); // โหวตแล้ว -> ไปดูผล
      } else {
        router.replace("/vote");    // ยังไม่โหวต -> ไปโหวต
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ 4. เรียกใช้ signIn ของ NextAuth
      const result = await signIn("credentials", {
        username: studentId, // map ให้ตรงกับ auth.js ที่เรารับค่า 'username'
        password: password,
        redirect: false,     // ปิด Auto Redirect เพื่อเราจะคุมเอง
      });

      if (result.error) {
        // กรณี Login ไม่ผ่าน
        setError("รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      } else {
        // 🎉 Login ผ่าน!
        // สั่ง refresh เพื่อให้ Server Component อัปเดต Session
        router.refresh(); 
        // ไม่ต้องเช็ค isVoted ตรงนี้ ให้ useEffect ด้านบนทำงานแทน หรือดีดไป /vote ก่อน
        // (เพราะ signIn แบบ redirect:false จะยังไม่ได้ session ใหม่ทันทีในบรรทัดนี้)
        router.push("/vote"); 
      }

    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLoading(false);
    }
  };

  // ถ้ากำลังเช็ค Session อยู่ ให้แสดง Loading ว่างๆ หรือ Spinner (ป้องกันหน้ากระพริบ)
  if (status === "loading") {
    return <div className="min-h-screen bg-slate-50"></div>; 
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <Navbar />
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100 animate-fade-in-up">

          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-blue-50 text-[#003087] text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
              Official Authentication
            </div>
            <h1 className="text-3xl font-black text-[#003087] mb-2 tracking-tight">PSU PASSPORT</h1>
            <p className="text-slate-400 text-sm">ระบบยืนยันตัวตนมหาวิทยาลัยสงขลานครินทร์</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-2xl text-center border border-red-100 flex items-center justify-center gap-2 animate-shake">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Username</label>
              <input
                type="text"
                placeholder="Ex. 6610510xxx"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#003087] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#003087] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 placeholder:text-slate-300 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003087] hover:bg-[#002466] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/10 transition-all hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังตรวจสอบ...
                </span>
              ) : "เข้าสู่ระบบ (Sign In)"}
            </button>
          </form>

          {/* ปุ่มกลับหน้าหลัก */}
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              กลับหน้าหลัก
            </button>

            {/* Admin Entrance */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/admin")}
                className="group flex items-center gap-2 opacity-30 hover:opacity-100 transition-all duration-500 py-2"
              >
                <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors"></div>
                <span className="text-[10px] tracking-[0.2em] text-slate-400 font-medium uppercase group-hover:text-slate-600">
                  FMS ELECTION SYSTEM
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors"></div>
              </button>
            </div>
          </div>

        </div >

      </main >
    </div >
  );
}