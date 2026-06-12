import { prisma } from '@/lib/prisma';
import StockClient from './stock-client';

export const dynamic = 'force-dynamic';

export default async function StockPage() {
  const stocksRaw = await prisma.stock.findMany({
    orderBy: [{ variant: { material: { name: 'asc' } } }],
    include: { variant: { include: { material: true } } },
  });

  // Convert Decimal types to strings for client component
  const stocks = stocksRaw.map(stock => ({
    ...stock,
    currentQty: stock.currentQty.toString(),
    variant: {
      ...stock.variant,
      avgUnitPrice: stock.variant.avgUnitPrice.toString(),
      minAlert: stock.variant.minAlert.toString(),
    },
  }));

  return <StockClient stocks={stocks} />;
}