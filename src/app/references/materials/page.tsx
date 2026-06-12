import { prisma } from '@/lib/prisma';
import MaterialsClient from './materials-client';

export const dynamic = 'force-dynamic';

export default async function MaterialsPage() {
  const [materials, categories] = await Promise.all([
    prisma.material.findMany({
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
      include: { category: true, _count: { select: { variants: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <MaterialsClient materials={materials} categories={categories} />;
}
