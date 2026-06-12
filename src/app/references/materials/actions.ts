'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  unit: z.string().min(1),
  packaging: z.string().optional(),
  initialQuantity: z.coerce.number().nonnegative().default(0),
});

export async function createMaterial(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    unit: formData.get('unit'),
    packaging: (formData.get('packaging') || undefined) as string | undefined,
    initialQuantity: formData.get('initialQuantity') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.$transaction(async (tx) => {
    const material = await tx.material.create({ 
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        unit: parsed.data.unit,
        packaging: parsed.data.packaging,
      }
    });

    // Create a default variant with initial quantity if provided
    if (parsed.data.initialQuantity > 0) {
      const variant = await tx.variant.create({
        data: {
          materialId: material.id,
          initialQuantity: String(parsed.data.initialQuantity),
        },
      });

      // Create stock record with initial quantity
      await tx.stock.create({
        data: {
          variantId: variant.id,
          currentQty: String(parsed.data.initialQuantity),
          lastUpdated: new Date(),
        },
      });

      // Create adjustment movement
      await tx.movement.create({
        data: {
          variantId: variant.id,
          type: 'ADJUST',
          quantity: String(parsed.data.initialQuantity),
          movementDate: new Date(),
          note: `Initial stock for material ${material.name}`,
        },
      });
    }
  });

  revalidatePath('/references/materials');
}

export async function updateMaterial(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  const parsed = schema.safeParse({
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    unit: formData.get('unit'),
    packaging: (formData.get('packaging') || undefined) as string | undefined,
    initialQuantity: formData.get('initialQuantity') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.material.update({
    where: { id },
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      unit: parsed.data.unit,
      packaging: parsed.data.packaging,
    },
  });
  revalidatePath('/references/materials');
}

export async function deleteMaterial(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  
  await prisma.$transaction(async (tx) => {
    // Get all variants of this material
    const variants = await tx.variant.findMany({
      where: { materialId: id },
      select: { id: true },
    });

    // Delete all movements associated with these variants
    await tx.movement.deleteMany({
      where: {
        variantId: {
          in: variants.map(v => v.id),
        },
      },
    });

    // Delete all stock records associated with these variants
    await tx.stock.deleteMany({
      where: {
        variantId: {
          in: variants.map(v => v.id),
        },
      },
    });

    // Delete all variants of this material
    await tx.variant.deleteMany({
      where: { materialId: id },
    });

    // Finally delete the material
    await tx.material.delete({
      where: { id },
    });
  });

  revalidatePath('/references/materials');
}