import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Payment = { id: string; amount: number; paidAt: string };
type DebtItem = {
  id: string;
  itemName: string;
  totalAmount: number;
  monthlyPayment: number;
  months: number;
  startDate: string;
  payments: Payment[];
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

function fmtDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

async function loadFont(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function generateDebtStatementPDF(personName: string, debtItems: DebtItem[]) {
  const [regularFont, boldFont] = await Promise.all([
    loadFont("/fonts/Inter-Regular.ttf"),
    loadFont("/fonts/Inter-Bold.ttf"),
  ]);

  const doc = new jsPDF();
  doc.addFileToVFS("Inter-Regular.ttf", regularFont);
  doc.addFileToVFS("Inter-Bold.ttf", boldFont);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");
  doc.addFont("Inter-Bold.ttf", "Inter", "bold");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();

  // === HEADER BAND ===
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 36, "F");

  // Accent stripe
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, 4, 36, "F");

  doc.setFont("Inter", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("UTI", 12, 15);

  doc.setFont("Inter", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Utang Tracker Interface", 12, 23);
  doc.text("DEBT STATEMENT", 12, 30);

  doc.setFont("Inter", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${fmtDate(now.toISOString())}`, pageWidth - 12, 30, { align: "right" });

  // === PERSON SECTION ===
  doc.setFont("Inter", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(personName, 12, 54);

  doc.setFont("Inter", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${debtItems.length} debt item${debtItems.length !== 1 ? "s" : ""}`, 12, 61);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(12, 65, pageWidth - 12, 65);

  // === SUMMARY CARDS ===
  const totalDebt = debtItems.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = debtItems.reduce((s, i) => s + i.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalRemaining = Math.max(totalDebt - totalPaid, 0);
  const totalMonthly = debtItems.reduce((s, i) => s + i.monthlyPayment, 0);

  const cards = [
    { label: "TOTAL DEBT",   value: fmt(totalDebt),      accent: [239, 68, 68]  as [number,number,number], light: [254, 242, 242] as [number,number,number] },
    { label: "TOTAL PAID",   value: fmt(totalPaid),      accent: [34, 197, 94]  as [number,number,number], light: [240, 253, 244] as [number,number,number] },
    { label: "REMAINING",    value: fmt(totalRemaining), accent: [249, 115, 22] as [number,number,number], light: [255, 247, 237] as [number,number,number] },
    { label: "MONTHLY DUE",  value: fmt(totalMonthly),   accent: [59, 130, 246] as [number,number,number], light: [239, 246, 255] as [number,number,number] },
  ];

  const cardY = 70;
  const cardW = (pageWidth - 24 - 9) / 4;

  cards.forEach((card, i) => {
    const x = 12 + i * (cardW + 3);
    doc.setFillColor(...card.light);
    doc.roundedRect(x, cardY, cardW, 22, 2, 2, "F");
    doc.setFillColor(...card.accent);
    doc.roundedRect(x, cardY, cardW, 2.5, 1, 1, "F");

    doc.setFont("Inter", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(107, 114, 128);
    doc.text(card.label, x + 4, cardY + 8);

    doc.setFont("Inter", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...card.accent);
    doc.text(card.value, x + 4, cardY + 17);
  });

  // === DEBT ITEMS ===
  let y = cardY + 30;

  debtItems.forEach((item, idx) => {
    const paid = item.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(item.totalAmount - paid, 0);
    const isFullyPaid = remaining <= 0;
    const progress = item.totalAmount > 0 ? Math.min((paid / item.totalAmount) * 100, 100) : 100;
    const dueDate = new Date(item.startDate);
    dueDate.setMonth(dueDate.getMonth() + item.months);
    const monthsLeft = item.monthlyPayment > 0 ? Math.ceil(remaining / item.monthlyPayment) : 0;

    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    // Item number badge
    doc.setFillColor(59, 130, 246);
    doc.circle(16, y + 3.5, 3.5, "F");
    doc.setFont("Inter", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(String(idx + 1), 16, y + 4.8, { align: "center" });

    // Item name
    doc.setFont("Inter", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(item.itemName, 23, y + 5);

    // Paid badge
    if (isFullyPaid) {
      const nameWidth = doc.getTextWidth(item.itemName);
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(23 + nameWidth + 3, y, 20, 7, 1.5, 1.5, "F");
      doc.setFont("Inter", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(22, 163, 74);
      doc.text("PAID", 23 + nameWidth + 13, y + 4.8, { align: "center" });
    }

    // Dates row
    doc.setFont("Inter", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Started ${fmtDate(item.startDate)}   ·   Due ${fmtDate(dueDate.toISOString())}${!isFullyPaid ? `   ·   ${monthsLeft} month${monthsLeft !== 1 ? "s" : ""} left` : ""}`,
      23,
      y + 12
    );

    y += 16;

    // Stats table
    autoTable(doc, {
      startY: y,
      margin: { left: 12, right: 12 },
      head: [["Total Amount", "Monthly", "Duration", "Paid", "Remaining"]],
      body: [[
        fmt(item.totalAmount),
        fmt(item.monthlyPayment),
        `${item.months} months`,
        fmt(paid),
        isFullyPaid ? "Fully Paid" : fmt(remaining),
      ]],
      styles: { font: "Inter", fontSize: 8.5, cellPadding: 4 },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [248, 250, 252],
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "left",
      },
      bodyStyles: { textColor: [30, 41, 59], halign: "left" },
      columnStyles: {
        0: { fontStyle: "bold" },
        4: {
          textColor: isFullyPaid ? [22, 163, 74] : [249, 115, 22],
          fontStyle: "bold",
        },
      },
      theme: "plain",
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.3,
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    // Progress bar
    const barW = pageWidth - 24;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(12, y, barW, 3, 1.5, 1.5, "F");
    doc.setFillColor(isFullyPaid ? 34 : 59, isFullyPaid ? 197 : 130, isFullyPaid ? 94 : 246);
    doc.roundedRect(12, y, (barW * progress) / 100, 3, 1.5, 1.5, "F");

    doc.setFont("Inter", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${progress.toFixed(0)}% paid`, pageWidth - 12, y + 2.5, { align: "right" });

    y += 8;

    // Payment history
    if (item.payments.length > 0) {
      doc.setFont("Inter", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("PAYMENT HISTORY", 12, y + 3);
      y += 5;

      autoTable(doc, {
        startY: y,
        margin: { left: 12, right: 12 },
        head: [["Date", "Amount"]],
        body: item.payments.map((p) => [fmtDate(p.paidAt), fmt(p.amount)]),
        styles: { font: "Inter", fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [71, 85, 105],
          fontStyle: "bold",
          fontSize: 7,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
        },
        bodyStyles: { textColor: [51, 65, 85] },
        columnStyles: { 1: { textColor: [22, 163, 74], fontStyle: "bold" } },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        theme: "plain",
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.3,
      });

      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Item separator
    if (idx < debtItems.length - 1) {
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(12, y, pageWidth - 12, y);
      y += 8;
    }
  });

  // === FOOTER (all pages) ===
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFont("Inter", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`UTI Debt Statement  ·  ${personName}  ·  ${fmtDate(now.toISOString())}`, 12, pageHeight - 4.5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 12, pageHeight - 4.5, { align: "right" });
  }

  doc.save(`UTI_${personName.replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`);
}
