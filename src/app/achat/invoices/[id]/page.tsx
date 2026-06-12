import { prisma } from '@/lib/prisma';
import InvoiceDetailClient from './invoice-detail-client';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params;
  const id = Number(idString);
  const [invoiceRaw, variantsRaw, categoriesRaw] = await Promise.all([
    prisma.supplierInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: { include: { variant: { include: { material: true } } } },
      },
    }),
    prisma.variant.findMany({ orderBy: { id: 'asc' }, include: { material: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!invoiceRaw) return <div>Invoice not found</div>;

  // Convert Decimal types to strings for client component
  const invoice = {
    ...invoiceRaw,
    totalTTC: invoiceRaw.totalTTC.toString(),
    supplier: {
      ...invoiceRaw.supplier,
      currentBalance: invoiceRaw.supplier.currentBalance.toString(),
    },
    lines: invoiceRaw.lines.map(line => ({
      ...line,
      quantity: line.quantity.toString(),
      unitPurchasePrice: line.unitPurchasePrice.toString(),
      variant: {
        ...line.variant,
        avgUnitPrice: line.variant.avgUnitPrice.toString(),
        minAlert: line.variant.minAlert.toString(),
        initialQuantity: line.variant.initialQuantity.toString(),
      },
    })),
  };

  const variants = variantsRaw.map(variant => ({
    ...variant,
    avgUnitPrice: variant.avgUnitPrice.toString(),
    minAlert: variant.minAlert.toString(),
    initialQuantity: variant.initialQuantity.toString(),
  }));

  return <InvoiceDetailClient invoice={invoice} variants={variants} categories={categoriesRaw} />;
}