import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type InvoiceLine = {
  id: number;
  quantity: string;
  unitPurchasePrice: string;
  variant: {
    id: number;
    internalRef: string | null;
    supplierRef: string | null;
    material: {
      name: string;
    };
  };
};

type Invoice = {
  id: number;
  number: string;
  date: Date;
  totalTTC: string;
  status: string;
  supplier: {
    name: string;
  };
  lines: InvoiceLine[];
};

export const generateInvoicePDF = (invoice: Invoice) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Company information (you can customize this)
  const companyName = "SMART Spectra SARL";
  const companyAddress = "Avenue abou dhabi\n8050 Hammamet, Tunisie";
  const companyPhone = "Tél: +216 98 421 216";
  const companyEmail = "taher@smart.tn";
  
  // Colors
  const primaryColor = [79, 70, 229]; // Indigo
  const secondaryColor = [107, 114, 128]; // Gray
  const textColor = [31, 41, 55]; // Dark gray
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Header with company info
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 25);
  
  // Invoice title
  doc.setFontSize(16);
  doc.text(`FACTURE #${invoice.id}`, pageWidth - margin, 25, { align: 'right' });
  
  // Company details
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const companyLines = companyAddress.split('\n');
  let yPos = 55;
  
  companyLines.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  
  doc.text(companyPhone, margin, yPos);
  yPos += 5;
  doc.text(companyEmail, margin, yPos);
  
  // Invoice details box
  const invoiceBoxX = pageWidth - 80;
  const invoiceBoxY = 50;
  const invoiceBoxWidth = 60;
  const invoiceBoxHeight = 40;
  
  doc.setDrawColor(200, 200, 200);
  doc.rect(invoiceBoxX, invoiceBoxY, invoiceBoxWidth, invoiceBoxHeight);
  
  // Invoice details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Numéro:', invoiceBoxX + 5, invoiceBoxY + 8);
  doc.text('Date:', invoiceBoxX + 5, invoiceBoxY + 16);
  doc.text('Statut:', invoiceBoxX + 5, invoiceBoxY + 24);
  doc.text('Fournisseur:', invoiceBoxX + 5, invoiceBoxY + 32);
  
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.number, invoiceBoxX + 25, invoiceBoxY + 8);
  doc.text(new Date(invoice.date).toLocaleDateString('fr-FR'), invoiceBoxX + 25, invoiceBoxY + 16);
  doc.text(invoice.status, invoiceBoxX + 25, invoiceBoxY + 24);
  
  // Supplier name (truncate if too long)
  const supplierName = invoice.supplier.name.length > 15 
    ? invoice.supplier.name.substring(0, 15) + '...' 
    : invoice.supplier.name;
  doc.text(supplierName, invoiceBoxX + 25, invoiceBoxY + 32);
  
  // Table data preparation
  const tableData = invoice.lines.length > 0 ? invoice.lines.map((line) => {
    const lineTotal = Number(line.quantity) * Number(line.unitPurchasePrice);
    const variantName = line.variant.material.name;
    const variantRef = line.variant.internalRef || line.variant.supplierRef || `ID: ${line.variant.id}`;
    
    return [
      `${variantName}\n${variantRef}`,
      Number(line.quantity).toFixed(0),
      `${Number(line.unitPurchasePrice).toFixed(2)}`,
      `${lineTotal.toFixed(2)}`
    ];
  }) : [['Aucune ligne de facture', '-', '-', '0.00']];
  
  // Calculate totals
  const subtotal = invoice.lines.reduce((sum, line) => {
    return sum + (Number(line.quantity) * Number(line.unitPurchasePrice));
  }, 0);
  
  // Table configuration
  const tableConfig = {
    startY: 110,
    head: [['Variante', 'Quantité', 'Prix Unitaire', 'Total Ligne']],
    body: tableData,
    theme: 'grid' as const,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: textColor as [number, number, number],
    },
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 }, // Variante
      1: { cellWidth: 25, halign: 'center' as const }, // Quantité
      2: { cellWidth: 35, halign: 'right' as const }, // Prix Unitaire
      3: { cellWidth: 35, halign: 'right' as const }, // Total Ligne
    },
    margin: { left: margin, right: margin },
  };
  
  // Generate table
  autoTable(doc, tableConfig);
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Total section
  const totalBoxY = finalY + 10;
  const totalBoxX = pageWidth - 100;
  const totalBoxWidth = 80;
  const totalBoxHeight = 25;
  
  // Total background
  doc.setFillColor(248, 250, 252);
  doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'F');
  
  // Total border
  doc.setDrawColor(200, 200, 200);
  doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight);
  
  // Total text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('TOTAL:', totalBoxX + 5, totalBoxY + 10);
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${subtotal.toFixed(2)}`, totalBoxX + 75, totalBoxY + 10, { align: 'right' });
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'normal');
  
  const footerText = `Facture générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Page number
  doc.text('Page 1', pageWidth - margin, footerY, { align: 'right' });
  
  return doc;
};

export const downloadInvoicePDF = (invoice: Invoice) => {
  const doc = generateInvoicePDF(invoice);
  const filename = `Facture_${invoice.number}_${invoice.id}.pdf`;
  doc.save(filename);
};
