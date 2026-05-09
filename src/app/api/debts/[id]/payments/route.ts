import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payments = await prisma.payment.findMany({
    where: { debtItemId: id },
    orderBy: { paidAt: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { amount, paidAt } = body;

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      debtItemId: id,
      amount: Number(amount),
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
