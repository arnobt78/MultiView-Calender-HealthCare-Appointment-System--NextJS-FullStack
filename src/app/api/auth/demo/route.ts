import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, getUserByEmail } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "test@user.com";
const DEMO_PASSWORD = "12345678";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
    }

    const user = await getUserByEmail(DEMO_EMAIL);
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Demo account not found" }, { status: 404 });
    }

    const valid = await verifyPassword(DEMO_PASSWORD, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Demo account misconfigured" }, { status: 500 });
    }

    const token = generateToken(user.id, user.email);
    await setSession(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        image: user.image ?? null,
      },
      today_appointments: await prisma.appointment.count({
        where: {
          user_id: user.id,
          start: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        },
      }),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
