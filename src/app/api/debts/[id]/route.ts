import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debt = await prisma.debtItem.findUnique({
    where: { id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(debt);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { itemName, totalAmount, monthlyPayment, months, startDate } = body;

  const debt = await prisma.debtItem.update({
    where: { id },
    data: {
      ...(itemName && { itemName }),
      ...(totalAmount && { totalAmount: Number(totalAmount) }),
      ...(monthlyPayment && { monthlyPayment: Number(monthlyPayment) }),
      ...(months && { months: Number(months) }),
      ...(startDate && { startDate: new Date(startDate) }),
    },
  });
  return NextResponse.json(debt);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.debtItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
