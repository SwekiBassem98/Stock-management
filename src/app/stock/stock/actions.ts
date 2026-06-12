'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/session-server';

export async function adjustStockToQuantity(formData: FormData): Promise<void> {
  await requireAdmin();
  const variantId = z.coerce.number().int().positive().parse(formData.get('variantId'));
  const newQty = z.coerce.number().nonnegative().parse(formData.get('newQty'));
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const stock = await tx.stock.upsert({
      where: { variantId },
      create: { variantId, currentQty: 0 },
      update: {},
    });
    const current = Number(stock.currentQty);
    const delta = newQty - current;
    if (delta !== 0) {
      await tx.movement.create({
        data: {
          variantId,
          type: 'ADJUST',
          quantity: String(delta),
          movementDate: now,
          documentType: 'ADJUSTMENT',
          note: `Adjusted to ${newQty}`,
        },
      });
      await tx.stock.update({ where: { id: stock.id }, data: { currentQty: String(newQty), lastUpdated: now } });
    }
  });

  revalidatePath('/stock');
  revalidatePath('/movements');
}

export async function addAdjustmentDelta(formData: FormData): Promise<void> {
  await requireAdmin();
  const variantId = z.coerce.number().int().positive().parse(formData.get('variantId'));
  const delta = z.coerce.number().refine(v => v !== 0, 'Delta cannot be 0').parse(formData.get('delta'));
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const stock = await tx.stock.upsert({
      where: { variantId },
      create: { variantId, currentQty: 0 },
      update: {},
    });
    const newQty = Number(stock.currentQty) + delta;
    if (newQty < 0) throw new Error('Stock cannot be negative');

    await tx.movement.create({
      data: {
        variantId,
        type: 'ADJUST',
        quantity: String(delta),
        movementDate: now,
        documentType: 'ADJUSTMENT',
        note: 'Manual adjustment',
      },
    });
    await tx.stock.update({ where: { id: stock.id }, data: { currentQty: String(newQty), lastUpdated: now } });
  });

  revalidatePath('/stock');
  revalidatePath('/movements');
}