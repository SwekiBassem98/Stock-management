import { prisma } from '@/lib/prisma';
import SupplierOrdersClient from './supplier-orders-client';

export const dynamic = 'force-dynamic';

export default async function SupplierOrdersPage() {
  const [ordersRaw, suppliersRaw] = await Promise.all([
    prisma.supplierOrder.findMany({
      orderBy: { id: 'desc' },
      include: { supplier: true, _count: { select: { lines: true, reminders: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Convert Decimal types to strings for client component
  const orders = ordersRaw.map(order => ({
    ...order,
    supplier: {
      ...order.supplier,
      currentBalance: order.supplier.currentBalance.toString(),
    },
  }));

  const suppliers = suppliersRaw.map(supplier => ({
    ...supplier,
    currentBalance: supplier.currentBalance.toString(),
  }));

  return <SupplierOrdersClient orders={orders} suppliers={suppliers} />;
}