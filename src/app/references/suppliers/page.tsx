import { prisma } from '@/lib/prisma';
import SuppliersClient from './suppliers-client';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliersRaw = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { orders: true, invoices: true } },
    },
  });

  // Convert Decimal types to strings for client component
  const suppliers = suppliersRaw.map(supplier => ({
    ...supplier,
    currentBalance: supplier.currentBalance.toString(),
  }));

  return <SuppliersClient suppliers={suppliers} />;
}
