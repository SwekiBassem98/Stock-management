import { prisma } from '@/lib/prisma';
import VariantsClient from './variants-client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

function buildVariantWhere(query: string): any {
  const search = query.trim();

  if (!search) return {};

  return {
    OR: [
      { material: { name: { contains: search, mode: 'insensitive' } } },
      { material: { category: { name: { contains: search, mode: 'insensitive' } } } },
      { internalRef: { contains: search, mode: 'insensitive' } },
      { supplierRef: { contains: search, mode: 'insensitive' } },
      { color: { contains: search, mode: 'insensitive' } },
      { thickness: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export default async function VariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const query = params.q?.trim() || '';
  const where = buildVariantWhere(query);
  const skip = (page - 1) * PAGE_SIZE;

  const [variantsRaw, total] = await Promise.all([
    prisma.variant.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: [{ material: { name: 'asc' } }, { internalRef: 'asc' }],
      include: { material: { include: { category: true } } },
    }),
    prisma.variant.count({ where }),
  ]);
  const materials = await prisma.material.findMany({ orderBy: { name: 'asc' } });

  const variants = variantsRaw.map(variant => ({
    ...variant,
    avgUnitPrice: variant.avgUnitPrice.toString(),
    minAlert: variant.minAlert.toString(),
    initialQuantity: variant.initialQuantity.toString(),
  }));

  return (
    <VariantsClient
      variants={variants}
      materials={materials}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        query,
      }}
    />
  );
}
