import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debts = await prisma.debtItem.findMany({
    where: { personId: id },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(debts);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { itemName, totalAmount, monthlyPayment, months, startDate } = body;

  if (!itemName || !totalAmount || !monthlyPayment || !months) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const debt = await prisma.debtItem.create({
    data: {
      personId: id,
      itemName,
      totalAmount: Number(totalAmount),
      monthlyPayment: Number(monthlyPayment),
      months: Number(months),
      startDate: startDate ? new Date(startDate) : new Date(),
    },
  });
  return NextResponse.json(debt, { status: 201 });
}
