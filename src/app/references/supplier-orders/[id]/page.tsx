import { prisma } from '@/lib/prisma';
import SupplierOrderDetailClient from './supplier-order-detail-client';

export const dynamic = 'force-dynamic';

export default async function SupplierOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params;
  const id = Number(idString);
  const [orderRaw, variantsRaw] = await Promise.all([
    prisma.supplierOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: { include: { variant: { include: { material: true } } } },
        reminders: true,
      },
    }),
    prisma.variant.findMany({ orderBy: { internalRef: 'asc' }, include: { material: true } }),
  ]);

  if (!orderRaw) return <div>Order not found</div>;

  // Convert Decimal types to strings for client component
  const order = {
    ...orderRaw,
    supplier: {
      ...orderRaw.supplier,
      currentBalance: orderRaw.supplier.currentBalance.toString(),
    },
    lines: orderRaw.lines.map(line => ({
      ...line,
      quantityOrdered: line.quantityOrdered.toString(),
      quantityReceived: line.quantityReceived.toString(),
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

  return <SupplierOrderDetailClient order={order} variants={variants} />;
}