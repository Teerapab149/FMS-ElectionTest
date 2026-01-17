import './globals.css';
// ✅ นำเข้า Providers (Path ถูกต้องแล้วครับ)
import Providers from "../components/Providers";
import { Prompt, Kanit } from 'next/font/google';

// 2. ตั้งค่า Prompt
const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt', 
  display: 'swap',
});

// 3. ตั้งค่า Kanit
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
});

export const metadata = {
  title: 'SAMO 49 - FMS Election 2026',
  description: 'ระบบเลือกตั้งสโมสรนักศึกษาคณะวิทยาการจัดการ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      {/* 4. ใส่ font variable ใน className */}
      <body className={`${prompt.variable} ${kanit.variable} font-sans antialiased`}>
        
        {/* ✅ 5. เพิ่มตรงนี้: เอา Providers มาครอบ children ไว้ */}
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}