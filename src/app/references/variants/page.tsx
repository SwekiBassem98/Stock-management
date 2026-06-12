import { prisma } from '@/lib/prisma';
import VariantsClient from './variants-client';

export const dynamic = 'force-dynamic';

export default async function VariantsPage() {
  const [variantsRaw, materials] = await Promise.all([
    prisma.variant.findMany({
      orderBy: [{ material: { name: 'asc' } }, { internalRef: 'asc' }],
      include: { material: { include: { category: true } } },
    }),
    prisma.material.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Convert Decimal types to strings for client component
  const variants = variantsRaw.map(variant => ({
    ...variant,
    avgUnitPrice: variant.avgUnitPrice.toString(),
    minAlert: variant.minAlert.toString(),
    initialQuantity: variant.initialQuantity.toString(),
  }));

  return <VariantsClient variants={variants} materials={materials} />;
}
