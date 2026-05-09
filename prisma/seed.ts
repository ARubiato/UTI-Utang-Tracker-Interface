import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const derek = await prisma.person.create({
    data: {
      name: "Derek",
      debtItems: {
        create: [
          {
            itemName: "Landers CC",
            totalAmount: 85499.95,
            monthlyPayment: 3000.00,
            months: 12,
            startDate: new Date("2026-04-14"),
          },
          {
            itemName: "Maya Credit",
            totalAmount: 16207.75,
            monthlyPayment: 16207.75,
            months: 1,
            startDate: new Date("2026-04-12"),
          },
          {
            itemName: "GGives 2",
            totalAmount: 27162.33,
            monthlyPayment: 2263.53,
            months: 12,
            startDate: new Date("2026-04-16"),
          },
          {
            itemName: "GGives 1",
            totalAmount: 46161.19,
            monthlyPayment: 2564.52,
            months: 18,
            startDate: new Date("2026-04-16"),
          },
          {
            itemName: "Gloan 2",
            totalAmount: 17551.48,
            monthlyPayment: 1887.67,
            months: 12,
            startDate: new Date("2026-04-09"),
          },
          {
            itemName: "Gloan 1",
            totalAmount: 60114.99,
            monthlyPayment: 4923.53,
            months: 12,
            startDate: new Date("2026-04-08"),
          },
        ],
      },
    },
  });

  console.log(`Seeded person: ${derek.name} (${derek.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
