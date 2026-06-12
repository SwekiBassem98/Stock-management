'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  materialId: z.coerce.number().int().positive(),
  supplierRef: z.string().optional(),
  internalRef: z.string().optional(),
  color: z.string().optional(),
  thickness: z.string().optional(),
  avgUnitPrice: z.coerce.number().nonnegative().default(0),
  minAlert: z.coerce.number().nonnegative().default(0),
  initialQuantity: z.coerce.number().nonnegative().default(0),
});

export async function createVariant(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    materialId: formData.get('materialId'),
    supplierRef: (formData.get('supplierRef') || undefined) as string | undefined,
    internalRef: (formData.get('internalRef') || undefined) as string | undefined,
    color: (formData.get('color') || undefined) as string | undefined,
    thickness: (formData.get('thickness') || undefined) as string | undefined,
    avgUnitPrice: formData.get('avgUnitPrice') ?? 0,
    minAlert: formData.get('minAlert') ?? 0,
    initialQuantity: formData.get('initialQuantity') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.$transaction(async (tx) => {
    const variant = await tx.variant.create({
      data: {
        ...parsed.data,
        avgUnitPrice: String(parsed.data.avgUnitPrice),
        minAlert: String(parsed.data.minAlert),
        initialQuantity: String(parsed.data.initialQuantity),
      },
    });

    // Create initial stock with initialQuantity
    await tx.stock.create({
      data: {
        variantId: variant.id,
        currentQty: String(parsed.data.initialQuantity),
        lastUpdated: new Date(),
      },
    });

    // Create initial movement if quantity > 0
    if (parsed.data.initialQuantity > 0) {
      await tx.movement.create({
        data: {
          variantId: variant.id,
          type: 'ADJUST',
          quantity: String(parsed.data.initialQuantity),
          movementDate: new Date(),
          note: `Initial stock setup for variant ${variant.id}`,
        },
      });
    }
  });
  revalidatePath('/ref/variants');
}

export async function updateVariant(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  const parsed = schema.safeParse({
    materialId: formData.get('materialId'),
    supplierRef: (formData.get('supplierRef') || undefined) as string | undefined,
    internalRef: (formData.get('internalRef') || undefined) as string | undefined,
    color: (formData.get('color') || undefined) as string | undefined,
    thickness: (formData.get('thickness') || undefined) as string | undefined,
    avgUnitPrice: formData.get('avgUnitPrice') ?? 0,
    minAlert: formData.get('minAlert') ?? 0,
    initialQuantity: formData.get('initialQuantity') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.variant.update({
    where: { id },
    data: {
      ...parsed.data,
      avgUnitPrice: String(parsed.data.avgUnitPrice),
      minAlert: String(parsed.data.minAlert),
      initialQuantity: String(parsed.data.initialQuantity),
    },
  });
  revalidatePath('/ref/variants');
}

export async function deleteVariant(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  await prisma.variant.delete({ where: { id } });
  revalidatePath('/ref/variants');
}