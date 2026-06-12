import { prisma } from '@/lib/prisma';
import MovementsClient from './movements-client';

export const dynamic = 'force-dynamic';

export default async function MovementsPage() {
  const [movementsRaw, variantsRaw] = await Promise.all([
    prisma.movement.findMany({
      orderBy: { movementDate: 'desc' },
      take: 200,
      include: { variant: { include: { material: true } } },
    }),
    prisma.variant.findMany({ orderBy: { id: 'asc' }, include: { material: true } }),
  ]);

  // Convert Decimal types to strings for client component
  const movements = movementsRaw.map(movement => ({
    ...movement,
    quantity: movement.quantity.toString(),
    unitPrice: movement.unitPrice?.toString() || null,
    variant: {
      ...movement.variant,
      avgUnitPrice: movement.variant.avgUnitPrice.toString(),
      minAlert: movement.variant.minAlert.toString(),
    },
  }));

  const variants = variantsRaw.map(variant => ({
    ...variant,
    avgUnitPrice: variant.avgUnitPrice.toString(),
    minAlert: variant.minAlert.toString(),
  }));

  return <MovementsClient movements={movements} variants={variants} />;
}