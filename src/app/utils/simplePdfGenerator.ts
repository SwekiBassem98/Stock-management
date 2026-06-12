import jsPDF from 'jspdf';

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

export const generateSimpleInvoicePDF = (invoice: Invoice) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Company information
  const companyName = "Stock Management";
  const companyAddress = "123 Rue du Commerce, 75001 Paris, France";
  const companyPhone = "Tél: +33 1 23 45 67 89";
  const companyEmail = "contact@stockmgmt.fr";
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Header with company info
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 25);
  
  // Invoice title
  doc.setFontSize(14);
  doc.text(`FACTURE #${invoice.id}`, pageWidth - margin, 25, { align: 'right' });
  
  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Company details
  let yPos = 55;
  doc.text(companyAddress, margin, yPos);
  yPos += 6;
  doc.text(companyPhone, margin, yPos);
  yPos += 6;
  doc.text(companyEmail, margin, yPos);
  
  // Invoice details
  yPos = 55;
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.text('Numéro:', rightX - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.number, rightX - 30, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.date).toLocaleDateString('fr-FR'), rightX - 30, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', rightX - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.status, rightX - 30, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Fournisseur:', rightX - 60, yPos);
  doc.setFont('helvetica', 'normal');
  const supplierName = invoice.supplier.name.length > 20 
    ? invoice.supplier.name.substring(0, 20) + '...' 
    : invoice.supplier.name;
  doc.text(supplierName, rightX - 30, yPos);
  
  // Invoice lines section
  yPos = 110;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Lignes de Facture', margin, yPos);
  
  // Table headers
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Variante', margin, yPos);
  doc.text('Qté', margin + 80, yPos);
  doc.text('Prix Unit.', margin + 110, yPos);
  doc.text('Total', margin + 150, yPos);
  
  // Draw header line
  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // Invoice lines
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  let subtotal = 0;
  
  if (invoice.lines.length > 0) {
    invoice.lines.forEach((line) => {
      const lineTotal = Number(line.quantity) * Number(line.unitPurchasePrice);
      subtotal += lineTotal;
      
      // Variant name (truncate if too long)
      const variantName = line.variant.material.name.length > 25 
        ? line.variant.material.name.substring(0, 25) + '...' 
        : line.variant.material.name;
      
      doc.text(variantName, margin, yPos);
      doc.text(Number(line.quantity).toFixed(0), margin + 80, yPos);
      doc.text(`${Number(line.unitPurchasePrice).toFixed(2)}`, margin + 110, yPos);
      doc.text(`${lineTotal.toFixed(2)}`, margin + 150, yPos);
      
      yPos += 8;
      
      // Add reference if available
      const variantRef = line.variant.internalRef || line.variant.supplierRef;
      if (variantRef) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Réf: ${variantRef}`, margin + 5, yPos);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        yPos += 6;
      }
      
      yPos += 2; // Extra spacing between lines
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.text('Aucune ligne de facture', margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  }
  
  // Total section
  yPos += 10;
  doc.setLineWidth(0.5);
  doc.line(margin + 100, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', margin + 100, yPos);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(`${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  const footerText = `Facture générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
};

export const downloadSimpleInvoicePDF = (invoice: Invoice) => {
  const doc = generateSimpleInvoicePDF(invoice);
  const filename = `Facture_${invoice.number}_${invoice.id}.pdf`;
  doc.save(filename);
};
