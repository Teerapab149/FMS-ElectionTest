import { NextResponse } from 'next/server';
// import fs from 'fs';  <-- ลบออก เพราะ Vercel อ่าน public folder ไม่ได้
// import path from 'path'; <-- ลบออก

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // เช่น id = 1

    if (!id) return NextResponse.json({ images: [] });

    // ✅ 1. กำหนด Path ตามโครงสร้างเดิมของคุณ
    const folderName = `party${id}`; 
    
    // -------------------------------------------------------------
    // จุดที่แก้: เปลี่ยนจากการอ่านไฟล์ (fs) เป็นการสร้าง URL ล่วงหน้า
    // เพราะบน Vercel เราไม่สามารถเข้าไปส่องดูในโฟลเดอร์ public ได้
    // -------------------------------------------------------------
    
    const images = [];
    // สมมติว่าแต่ละพรรคมีรูปไม่เกิน 5 รูป (ปรับเลขนี้ได้ตามต้องการ)
    const maxImagesToCheck = 5; 

    for (let i = 1; i <= maxImagesToCheck; i++) {
        // สร้าง path รูปตามโครงสร้าง: /images/candidates/groupimage/party1/1.jpg
        // (ตรวจสอบนามสกุลไฟล์ของคุณด้วยว่าเป็น .jpg หรือ .png)
        images.push(`/images/candidates/groupimage/${folderName}/${i}.jpg`);
    }

    // ส่ง list รายชื่อไฟล์กลับไป (Frontend จะเป็นตัวเช็คเองว่าไฟล์ไหนมีจริง)
    return NextResponse.json({ images });
    
  } catch (error) {
    console.error("Gallery Error:", error);
    return NextResponse.json({ images: [] });
  }
}