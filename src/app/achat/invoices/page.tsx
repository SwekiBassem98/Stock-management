import { prisma } from '@/lib/prisma';
import InvoicesClient from './invoices-client';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const [invoicesRaw, suppliersRaw, variantsRaw] = await Promise.all([
    prisma.supplierInvoice.findMany({
      orderBy: { id: 'desc' },
      include: { supplier: true, _count: { select: { lines: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
    prisma.variant.findMany({
      orderBy: { id: 'asc' },
      include: { material: true },
    }),
  ]);

  // Convert Decimal types to strings for client component
  const invoices = invoicesRaw.map(invoice => ({
    ...invoice,
    totalTTC: invoice.totalTTC.toString(),
    supplier: {
      ...invoice.supplier,
      currentBalance: invoice.supplier.currentBalance.toString(),
    },
  }));

  const suppliers = suppliersRaw.map(supplier => ({
    ...supplier,
    currentBalance: supplier.currentBalance.toString(),
  }));

  const variantOptions = variantsRaw.map(v => ({
    id: v.id,
    label: `${v.material.name} — ${v.internalRef ?? v.supplierRef ?? v.id}`,
  }));

  return <InvoicesClient invoices={invoices} suppliers={suppliers} variants={variantOptions} />;
}