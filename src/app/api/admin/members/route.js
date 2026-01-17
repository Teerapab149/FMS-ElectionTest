import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
  try {
    const members = await db.member.findMany({
      select: {
        id: true,
        studentId: true,
        name: true,
        imageUrl: true,
        position: true,
        candidateId: true,
        candidate: {
          select: {
            number: true,
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: [
        { candidate: { number: 'asc' } },
        { id: 'asc' }
      ]
    });

    return NextResponse.json(members);

  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}