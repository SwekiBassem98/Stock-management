'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1, 'Required') });

export async function createCategory(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({ name: formData.get('name') });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.category.create({ data: parsed.data });
  revalidatePath('/ref/categories');
}

export async function updateCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const parsed = schema.safeParse({ name: formData.get('name') });
  if (!Number.isFinite(id) || id <= 0 || !parsed.success) throw new Error('Invalid input');

  await prisma.category.update({ where: { id }, data: { name: parsed.data.name } });
  revalidatePath('/ref/categories');
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid id');

  await prisma.category.delete({ where: { id } });
  revalidatePath('/ref/categories');
}