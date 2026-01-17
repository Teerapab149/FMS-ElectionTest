import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "University Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const { username, password } = credentials;
                let userData = null;

                // ===============================================
                // 🟡 โหมด 1: ใช้ Database ตัวเอง (Dev Mode)
                // ===============================================
                if (process.env.AUTH_MODE === "DB") {
                    // ค้นหาจาก DB ตัวเอง
                    const dbUser = await db.user.findFirst({
                        where: { studentId: username },
                    });

                    if (!dbUser) throw new Error("ไม่พบข้อมูลในระบบ (DB Mode)");

                    // Map ข้อมูลจาก DB เข้าตัวแปรกลาง
                    userData = {
                        studentId: dbUser.studentId,
                        name: dbUser.name,
                        email: dbUser.email,
                        facultyId: dbUser.facultyId,
                        departmentId: dbUser.departmentId, // ✅ รับค่าจาก DB
                        role: dbUser.role,
                        isVoted: dbUser.isVoted
                    };
                }

                // ===============================================
                // 🔵 โหมด 2: ใช้ API มหาลัย (Production Mode)
                // ===============================================
                else if (process.env.AUTH_MODE === "API") {

                    // 1. (อนาคต) ยิง Request ไป API มหาลัยตรงนี้
                    // const res = await fetch('https://api.university.ac.th/...', { ... });
                    // const apiResponse = await res.json();

                    // 2. สมมติข้อมูลที่ API ส่งกลับมา (Mock Data ตามโครงสร้างมหาลัย)
                    const apiUser = {
                        Email: "student@u.ac.th",
                        StudentID: username,
                        StudentName: "สมชาย เรียนดี (API)",
                        DepartmentID: "DEP_COM_SCI", // ✅ ข้อมูลดิบจากมหาลัย
                        FacultyID: "FAC_SCI",
                        Token: "xyz_token_123"
                    };

                    // ✅ Map ข้อมูลจาก API เข้าตัวแปรกลาง (แปลง Key ให้ตรงกับเรา)
                    userData = {
                        studentId: apiUser.StudentID,
                        name: apiUser.StudentName,
                        email: apiUser.Email,
                        facultyId: apiUser.FacultyID,
                        departmentId: apiUser.DepartmentID, // ✅ จับคู่: DepartmentID -> departmentId
                        role: "student", // ค่าเริ่มต้น
                        isVoted: false   // ค่าเริ่มต้น (เดี๋ยวไปเช็คจริงใน DB)
                    };
                }

                // ถ้าไม่มีข้อมูล หรือ Login ไม่ผ่าน
                if (!userData) throw new Error("Login Failed");

                // ===============================================
                // 🟢 ขั้นตอนที่ 3: Sync ลง Database (Upsert)
                // ===============================================
                // บันทึกข้อมูลล่าสุดลง DB เสมอ (ไม่ว่าจะมาจาก DB เดิม หรือ API ใหม่)

                const user = await db.user.upsert({
                    where: { studentId: userData.studentId },
                    // 1. กรณี: มี User นี้อยู่แล้ว -> อัปเดตข้อมูลล่าสุด (เช่น ย้ายภาควิชา, เปลี่ยนชื่อ)
                    update: {
                        name: userData.name,
                        email: userData.email,
                        facultyId: userData.facultyId,
                        departmentId: userData.departmentId // ✅ อัปเดต departmentId
                    },
                    // 2. กรณี: เป็น User ใหม่ -> สร้างใหม่เลย
                    create: {
                        studentId: userData.studentId,
                        name: userData.name,
                        email: userData.email,
                        facultyId: userData.facultyId,
                        departmentId: userData.departmentId, // ✅ บันทึก departmentId
                        role: 'student',
                        isVoted: false,
                    }
                });

                // ส่ง Session กลับไปให้ NextAuth ถือไว้
                return {
                    id: user.id,
                    studentId: user.studentId,
                    name: user.name,
                    role: user.role,
                    isVoted: user.isVoted,
                    isFormCompleted: user.isFormCompleted,
                    // facultyId: user.facultyId, // ถ้าอยากใช้ในหน้าเว็บ ให้เปิด comment นี้
                    // departmentId: user.departmentId // ถ้าอยากใช้ในหน้าเว็บ ให้เปิด comment นี้
                };
            },
        }),
    ],

    session: { strategy: "jwt" },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // ตอน Login ครั้งแรก ให้ยัดข้อมูลใส่ Token
            if (user) {
                token.id = user.id;
                token.studentId = user.studentId;
                token.role = user.role;
                token.isVoted = user.isVoted;
                token.isFormCompleted = user.isFormCompleted;
                // token.departmentId = user.departmentId; // (ถ้าต้องการ)
            }

            // ตอนมีการ update session (เช่น หลังโหวตเสร็จ)
            // ✅ ตอนมีการสั่ง update() จากหน้า SuccessPage
            if (trigger === "update" && session) {
                // วิธีที่ชัวร์ที่สุด: ไปดึงข้อมูลสดๆ จาก DB อีกครั้ง
                const dbUser = await db.user.findUnique({
                    where: { studentId: token.studentId }
                });

                if (dbUser) {
                    token.isVoted = dbUser.isVoted;
                    token.isFormCompleted = dbUser.isFormCompleted;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // ยัดข้อมูลจาก Token ใส่ Session เพื่อให้ Client เรียกใช้ได้
            if (token) {
                session.user.id = token.id;
                session.user.studentId = token.studentId;
                session.user.role = token.role;
                session.user.isVoted = token.isVoted;
                session.user.isFormCompleted = token.isFormCompleted;
                // session.user.departmentId = token.departmentId; // (ถ้าต้องการ)
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // path หน้า Login ของคุณ
    },
};