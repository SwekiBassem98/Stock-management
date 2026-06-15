import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface OrderLine {
  id: number;
  quantityOrdered: string;
  quantityReceived: string;
  variant: {
    id: number;
    internalRef: string | null;
    supplierRef: string | null;
    thickness?: string | null;
    material: {
      name: string;
    };
  };
}

interface Order {
  id: number;
  status: string;
  orderDate: Date;
  requestedDeliveryDate: Date | null;
  shippingMethod: string | null;
  supplier: {
    name: string;
  };
  lines: OrderLine[];
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  CONFIRMED: 'Confirmé',
  PARTIALLY_RECEIVED: 'Partiellement Reçu',
  RECEIVED: 'Reçu',
  CANCELLED: 'Annulé',
};

// Helper function to format numbers - remove trailing zeros
const formatNumber = (value: string | number): string => {
  const num = Number(value);
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return parseFloat(num.toFixed(4)).toString();
};

export const generateSupplierOrderPDF = (order: Order) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Company information
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
  
  // Order title
  doc.setFontSize(16);
  doc.text(`COMMANDE FOURNISSEUR #${order.id}`, margin, 35);
  
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
  
  // Order details box
  const orderBoxX = pageWidth - 80;
  const orderBoxY = 50;
  const orderBoxWidth = 60;
  const orderBoxHeight = 40;
  
  doc.setDrawColor(200, 200, 200);
  doc.rect(orderBoxX, orderBoxY, orderBoxWidth, orderBoxHeight);
  
  // Order details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Numéro:', orderBoxX + 5, orderBoxY + 8);
  doc.text('Date:', orderBoxX + 5, orderBoxY + 16);
  doc.text('Statut:', orderBoxX + 5, orderBoxY + 24);
  doc.text('Fournisseur:', orderBoxX + 5, orderBoxY + 32);
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(order.id), orderBoxX + 25, orderBoxY + 8);
  doc.text(new Date(order.orderDate).toLocaleDateString('fr-FR'), orderBoxX + 25, orderBoxY + 16);
  doc.text(statusLabels[order.status] || order.status, orderBoxX + 25, orderBoxY + 24);
  
  // Supplier name (truncate if too long)
  const supplierName = order.supplier.name.length > 15 
    ? order.supplier.name.substring(0, 15) + '...' 
    : order.supplier.name;
  doc.text(supplierName, orderBoxX + 25, orderBoxY + 32);
  
  // Table data preparation
  const tableData = order.lines.length > 0 ? order.lines.map((line) => {
    const variantName = line.variant.material.name;
    const variantRef = [line.variant.internalRef || line.variant.supplierRef || `ID: ${line.variant.id}`, line.variant.thickness]
      .filter(Boolean)
      .join(' ');
    const remaining = Number(line.quantityOrdered) - Number(line.quantityReceived);
    
    return [
      `${variantName}\n${variantRef}`,
      formatNumber(line.quantityOrdered),
      formatNumber(line.quantityReceived),
      formatNumber(remaining.toString())
    ];
  }) : [['Aucune ligne de commande', '-', '-', '-']];
  
  // Table configuration
  const tableConfig = {
    startY: 110,
    head: [['Matériau', 'Commandé', 'Reçu', 'En Attente']],
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
      0: { cellWidth: 90 }, // Matériau
      1: { cellWidth: 25, halign: 'center' as const }, // Commandé
      2: { cellWidth: 25, halign: 'center' as const }, // Reçu
      3: { cellWidth: 25, halign: 'center' as const }, // En Attente
    },
    margin: { left: margin, right: margin },
  };
  
  // Generate table
  autoTable(doc, tableConfig);
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Additional info section
  const infoBoxY = finalY + 10;
  
  // Requested delivery date if available
  if (order.requestedDeliveryDate) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Date Livraison Demandée:', margin, infoBoxY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(order.requestedDeliveryDate).toLocaleDateString('fr-FR'), margin + 55, infoBoxY);
  }
  
  // Shipping method if available
  if (order.shippingMethod) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Méthode d\'Expédition:', margin, infoBoxY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(order.shippingMethod, margin + 55, infoBoxY + 8);
  }
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'normal');
  
  const footerText = `Commande générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Page number
  doc.text('Page 1', pageWidth - margin, footerY, { align: 'right' });
  
  return doc;
};

export const downloadSupplierOrderPDF = (order: Order) => {
  const doc = generateSupplierOrderPDF(order);
  const filename = `Commande_${order.id}.pdf`;
  doc.save(filename);
};
