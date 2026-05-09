import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const persons = await prisma.person.findMany({
    include: {
      debtItems: {
        include: { payments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = persons.map((person) => {
    const totalDebt = person.debtItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalPaid = person.debtItems.reduce(
      (sum, item) => sum + item.payments.reduce((s, p) => s + p.amount, 0),
      0
    );
    const totalMonthly = person.debtItems.reduce((sum, item) => sum + item.monthlyPayment, 0);
    return {
      id: person.id,
      name: person.name,
      createdAt: person.createdAt,
      itemCount: person.debtItems.length,
      totalDebt,
      totalPaid,
      totalRemaining: totalDebt - totalPaid,
      totalMonthly,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const person = await prisma.person.create({ data: { name: name.trim() } });
  return NextResponse.json(person, { status: 201 });
}
