'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { buildCsvError, normalizeText, parseCsvContent, resolveHeader, type CsvImportResult } from '../import-csv';

const schema = z.object({ name: z.string().min(1, 'Required') });

async function getCsvContent(formData: FormData) {
  const entry = formData.get('csv');

  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  if (entry instanceof File) return entry.text();

  return null;
}

function emptyResult(errors: CsvImportResult['errors']): CsvImportResult {
  return {
    success: false,
    created: 0,
    skipped: 0,
    warnings: [],
    errors,
  };
}

export async function createCategory(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({ name: formData.get('name') });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.category.create({ data: parsed.data });
  revalidatePath('/references/categories');
}

export async function updateCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const parsed = schema.safeParse({ name: formData.get('name') });
  if (!Number.isFinite(id) || id <= 0 || !parsed.success) throw new Error('Invalid input');

  await prisma.category.update({ where: { id }, data: { name: parsed.data.name } });
  revalidatePath('/references/categories');
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid id');

  await prisma.category.delete({ where: { id } });
  revalidatePath('/references/categories');
}

export async function importCsvCategories(formData: FormData): Promise<CsvImportResult> {
  const csvContent = await getCsvContent(formData);

  if (!csvContent) {
    return emptyResult([buildCsvError(1, 'csv', 'Aucun fichier CSV n’a été envoyé.')]);
  }

  if (csvContent.length > 1_000_000) {
    return emptyResult([buildCsvError(1, 'csv', 'Le fichier CSV est trop volumineux. La taille maximale est de 1 Mo.')]);
  }

  const parsedCsv = parseCsvContent(csvContent);

  if (parsedCsv.errors.length > 0) {
    return emptyResult(parsedCsv.errors);
  }

  const nameHeader = resolveHeader(parsedCsv.headers, ['name', 'nom', 'catégorie', 'categorie', 'category']);

  if (!nameHeader) {
    return emptyResult([
      buildCsvError(1, 'name', 'En-tête requis manquant. Utilisez: name, nom, catégorie, categorie ou category.'),
    ]);
  }

  const errors: CsvImportResult['errors'] = [];
  const warnings: string[] = [];
  const seenNames = new Set<string>();
  const toCreate: Array<{ name: string }> = [];
  let skipped = 0;

  const existingCategories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const existingNames = new Set(existingCategories.map((category) => normalizeText(category.name)));

  for (const row of parsedCsv.rows) {
    const name = row.values[nameHeader]?.trim();

    if (!name) {
      errors.push(buildCsvError(row.lineNumber, 'name', 'Le nom de la catégorie est requis.'));
      continue;
    }

    if (name.length > 100) {
      errors.push(buildCsvError(row.lineNumber, 'name', 'Le nom de la catégorie ne doit pas dépasser 100 caractères.'));
      continue;
    }

    const normalizedName = normalizeText(name);

    if (seenNames.has(normalizedName)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: "${name}" est déjà présente dans ce fichier.`);
      continue;
    }

    seenNames.add(normalizedName);

    if (existingNames.has(normalizedName)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: "${name}" existe déjà.`);
      continue;
    }

    toCreate.push({ name });
  }

  if (toCreate.length > 0) {
    await prisma.category.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  revalidatePath('/references/categories');

  return {
    success: errors.length === 0,
    created: toCreate.length,
    skipped,
    warnings,
    errors,
  };
}
