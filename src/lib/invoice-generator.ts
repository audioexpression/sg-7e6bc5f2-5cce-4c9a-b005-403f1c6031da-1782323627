import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  member: {
    name: string;
    address: string;
    email: string;
  };
  billingPeriod: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  baseAmount: number;
  discount?: number;
  taxAmount: number;
  totalAmount: number;
  monthExemptions?: Array<{
    month: string;
    exempt: boolean;
    reason?: string;
  }>;
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  
  // Colors
  const primaryBlue = "#1E40AF";
  const accentYellow = "#FBBF24";
  const darkGray = "#374151";
  const lightGray = "#F3F4F6";
  
  // Add logo (circular badge)
  const logoX = 20;
  const logoY = 15;
  const logoRadius = 15;
  
  // Draw yellow circle background
  doc.setFillColor(accentYellow);
  doc.circle(logoX, logoY, logoRadius, "F");
  
  // Draw blue inner circle
  doc.setFillColor(primaryBlue);
  doc.circle(logoX, logoY, logoRadius - 3, "F");
  
  // Add "BBFC" text in logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BBFC", logoX, logoY + 1, { align: "center" });
  
  // Club name and tagline
  doc.setTextColor(primaryBlue);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BALI BULLDOGS F.C.", 45, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(darkGray);
  doc.text("WE NEVER WALK ALONE", 45, 27);
  
  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue);
  doc.text("INVOICE", 200, 20, { align: "right" });
  
  // Invoice number and dates
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 200, 27, { align: "right" });
  doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString("id-ID")}`, 200, 33, { align: "right" });
  doc.text(`Due: ${new Date(data.dueDate).toLocaleDateString("id-ID")}`, 200, 39, { align: "right" });
  
  // Horizontal line
  doc.setDrawColor(accentYellow);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);
  
  // Club information (left column)
  let yPos = 55;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue);
  doc.text("FROM:", 20, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.setFontSize(9);
  yPos += 5;
  doc.text("PT DOJI BALI INDONESIA", 20, yPos);
  yPos += 4;
  doc.text("(Bali Bulldogs)", 20, yPos);
  yPos += 4;
  doc.text("Jl. Subak Sari No.72, Tibubeneng", 20, yPos);
  yPos += 4;
  doc.text("Kec. Kuta Utara, Kabupaten Badung", 20, yPos);
  yPos += 4;
  doc.text("Bali 80361, Indonesia", 20, yPos);
  yPos += 5;
  doc.text("Phone: +62 813-8447-4406", 20, yPos);
  yPos += 4;
  doc.text("Email: info@balibulldogsfc.com", 20, yPos);
  
  // Member information (right column)
  yPos = 55;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue);
  doc.setFontSize(10);
  doc.text("BILL TO:", 120, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.setFontSize(9);
  yPos += 5;
  doc.text(data.member.name, 120, yPos);
  yPos += 4;
  const addressLines = doc.splitTextToSize(data.member.address, 70);
  doc.text(addressLines, 120, yPos);
  yPos += addressLines.length * 4;
  doc.text(data.member.email, 120, yPos);
  
  // Billing period
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue);
  doc.setFontSize(10);
  doc.text(`Billing Period: ${data.billingPeriod}`, 20, yPos);
  
  // Items table
  yPos += 5;
  const tableData: any[][] = [];
  
  // Add month-by-month breakdown if available
  if (data.monthExemptions && data.monthExemptions.length > 0) {
    data.monthExemptions.forEach((exemption) => {
      if (!exemption.exempt) {
        tableData.push([
          exemption.month,
          "Monthly Membership Fee",
          "1",
          `Rp ${(data.baseAmount / data.monthExemptions!.filter(e => !e.exempt).length).toLocaleString("id-ID")}`,
          `Rp ${(data.baseAmount / data.monthExemptions!.filter(e => !e.exempt).length).toLocaleString("id-ID")}`
        ]);
      } else {
        tableData.push([
          exemption.month,
          `Exempt (${exemption.reason || "N/A"})`,
          "0",
          "Rp 0",
          "Rp 0"
        ]);
      }
    });
  } else {
    // Fallback for quarterly without exemptions
    tableData.push([
      data.billingPeriod,
      "Membership Fee",
      "1",
      `Rp ${data.baseAmount.toLocaleString("id-ID")}`,
      `Rp ${data.baseAmount.toLocaleString("id-ID")}`
    ]);
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [["Period", "Description", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryBlue,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkGray
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" }
    }
  });
  
  // Summary section
  yPos = (doc as any).lastAutoTable.finalY + 10;
  const summaryX = 130;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  
  // Subtotal
  doc.text("Subtotal:", summaryX, yPos);
  doc.text(`Rp ${data.baseAmount.toLocaleString("id-ID")}`, 200, yPos, { align: "right" });
  
  // Discount (if applicable)
  if (data.discount && data.discount > 0) {
    yPos += 5;
    doc.setTextColor("#059669"); // Green for discount
    doc.text("Annual Discount (10%):", summaryX, yPos);
    doc.text(`- Rp ${data.discount.toLocaleString("id-ID")}`, 200, yPos, { align: "right" });
    
    yPos += 5;
    doc.setTextColor(darkGray);
    doc.text("Subtotal after discount:", summaryX, yPos);
    doc.text(`Rp ${(data.baseAmount - data.discount).toLocaleString("id-ID")}`, 200, yPos, { align: "right" });
  }
  
  // Tax
  yPos += 5;
  doc.text("Government Tax (10%):", summaryX, yPos);
  doc.text(`Rp ${data.taxAmount.toLocaleString("id-ID")}`, 200, yPos, { align: "right" });
  
  // Total
  yPos += 7;
  doc.setDrawColor(primaryBlue);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos - 2, 200, yPos - 2);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryBlue);
  doc.text("TOTAL DUE:", summaryX, yPos);
  doc.text(`Rp ${data.totalAmount.toLocaleString("id-ID")}`, 200, yPos, { align: "right" });
  
  // Bank information section
  yPos += 15;
  doc.setDrawColor(accentYellow);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue);
  doc.text("PAYMENT INFORMATION", 20, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkGray);
  yPos += 6;
  
  // Bank details in two columns
  doc.text("Bank Name:", 20, yPos);
  doc.text("PT. BANK CENTRAL ASIA (BCA)", 65, yPos);
  
  yPos += 5;
  doc.text("Account Number:", 20, yPos);
  doc.text("6130576000", 65, yPos);
  
  yPos += 5;
  doc.text("Currency:", 20, yPos);
  doc.text("IDR", 65, yPos);
  
  yPos += 5;
  doc.text("Swift Code:", 20, yPos);
  doc.text("CENAIDJA", 65, yPos);
  
  yPos += 5;
  doc.text("Bank Address:", 20, yPos);
  doc.text("Jl. Raya Kuta 55XX, Kuta, Badung, Bali, 80361", 65, yPos);
  
  yPos += 7;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Alternative: Wise payment also accepted", 20, yPos);
  
  // Footer
  yPos = 280;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(darkGray);
  doc.text("Thank you for being part of the Bali Bulldogs family!", 105, yPos, { align: "center" });
  doc.text("Questions? Contact us at info@balibulldogsfc.com or +62 813-8447-4406", 105, yPos + 4, { align: "center" });
  
  return doc;
};