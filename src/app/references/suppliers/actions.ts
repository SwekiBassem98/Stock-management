'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  currentBalance: z.coerce.number().nonnegative().default(0),
});

export async function createSupplier(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    address: (formData.get('address') || undefined) as string | undefined,
    currentBalance: formData.get('currentBalance') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.supplier.create({
    data: {
      ...parsed.data,
      currentBalance: String(parsed.data.currentBalance),
    },
  });
  revalidatePath('/ref/suppliers');
}

export async function updateSupplier(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  const parsed = schema.safeParse({
    name: formData.get('name'),
    address: (formData.get('address') || undefined) as string | undefined,
    currentBalance: formData.get('currentBalance') ?? 0,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.supplier.update({
    where: { id },
    data: {
      ...parsed.data,
      currentBalance: String(parsed.data.currentBalance),
    },
  });
  revalidatePath('/ref/suppliers');
}

export async function deleteSupplier(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  await prisma.supplier.delete({ where: { id } });
  revalidatePath('/ref/suppliers');
}