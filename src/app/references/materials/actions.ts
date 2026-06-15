'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { buildCsvError, MAX_IMPORT_FILE_SIZE, normalizeText, parseCsvContent, parseSpreadsheetBuffer, resolveHeader, type CsvImportResult } from '../import-csv';

const schema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  unit: z.string().min(1),
  packaging: z.string().optional(),
  initialQuantity: z.coerce.number().nonnegative().default(0),
});

async function getImportContent(formData: FormData) {
  const entry = formData.get('csv');

  if (!entry) return null;

  if (entry instanceof File) {
    const name = entry.name.toLowerCase();

    if (name.endsWith('.csv')) {
      return { content: await entry.text(), isSpreadsheet: false };
    }

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return { content: await entry.arrayBuffer(), isSpreadsheet: true };
    }

    return { error: buildCsvError(1, 'file', 'Format non supporté. Utilisez .xlsx, .xls ou .csv.') };
  }

  if (typeof entry === 'string') {
    return { content: entry, isSpreadsheet: false };
  }

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

    if (parsed.data.initialQuantity > 0) {
      const variant = await tx.variant.create({
        data: {
          materialId: material.id,
          initialQuantity: String(parsed.data.initialQuantity),
        },
      });

      await tx.stock.create({
        data: {
          variantId: variant.id,
          currentQty: String(parsed.data.initialQuantity),
          lastUpdated: new Date(),
        },
      });

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
    const variants = await tx.variant.findMany({
      where: { materialId: id },
      select: { id: true },
    });

    await tx.movement.deleteMany({
      where: {
        variantId: {
          in: variants.map(v => v.id),
        },
      },
    });

    await tx.stock.deleteMany({
      where: {
        variantId: {
          in: variants.map(v => v.id),
        },
      },
    });

    await tx.variant.deleteMany({
      where: { materialId: id },
    });

    await tx.material.delete({
      where: { id },
    });
  });

  revalidatePath('/references/materials');
}

export async function importCsvMaterials(formData: FormData): Promise<CsvImportResult> {
  const importContent = await getImportContent(formData);

  if (!importContent) {
    return emptyResult([buildCsvError(1, 'file', 'Aucun fichier n’a été envoyé.')]);
  }

  if (importContent.error) {
    return emptyResult([importContent.error]);
  }

  const fileSize = importContent.content instanceof ArrayBuffer
    ? importContent.content.byteLength
    : new Blob([importContent.content]).size;

  if (fileSize > MAX_IMPORT_FILE_SIZE) {
    return emptyResult([buildCsvError(1, 'file', `Le fichier est trop volumineux. La taille maximale est de ${MAX_IMPORT_FILE_SIZE / (1024 * 1024)} Mo.`)]);
  }

  const parsedCsv = importContent.isSpreadsheet
    ? parseSpreadsheetBuffer(importContent.content as ArrayBuffer)
    : parseCsvContent(importContent.content as string);

  if (parsedCsv.errors.length > 0) {
    return emptyResult(parsedCsv.errors);
  }

  const nameHeader = resolveHeader(parsedCsv.headers, ['name', 'nom', 'matériau', 'materiel', 'material']);
  const unitHeader = resolveHeader(parsedCsv.headers, ['unit', 'unité', 'unite']);
  const categoryHeader = resolveHeader(parsedCsv.headers, ['category', 'categorie', 'catégorie', 'categoryname', 'nomcategorie', 'categoryid', 'idcategorie']);
  const packagingHeader = resolveHeader(parsedCsv.headers, ['packaging', 'emballage']);

  if (!nameHeader || !unitHeader || !categoryHeader) {
    return emptyResult([
      buildCsvError(1, 'csv', 'En-têtes requis manquants. Utilisez au minimum: name, unit et category.'),
    ]);
  }

  const errors: CsvImportResult['errors'] = [];
  const warnings: string[] = [];
  const seenMaterials = new Set<string>();
  const toCreate: Array<{ categoryId: number; name: string; unit: string; packaging?: string }> = [];
  let skipped = 0;

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const categoryById = new Map(categories.map((category) => [String(category.id), category]));
  const categoryByName = new Map(categories.map((category) => [normalizeText(category.name), category]));

  const existingMaterials = await prisma.material.findMany({
    select: { id: true, categoryId: true, name: true },
  });
  const existingMaterialKeys = new Set(
    existingMaterials.map((material) => `${material.categoryId}:${normalizeText(material.name)}`)
  );

  for (const row of parsedCsv.rows) {
    const name = row.values[nameHeader]?.trim();
    const unit = row.values[unitHeader]?.trim();
    const packaging = packagingHeader ? row.values[packagingHeader]?.trim() : undefined;
    const categoryValue = row.values[categoryHeader]?.trim();

    if (!name) {
      errors.push(buildCsvError(row.lineNumber, 'name', 'Le nom du matériau est requis.'));
    }

    if (name && name.length > 150) {
      errors.push(buildCsvError(row.lineNumber, 'name', 'Le nom du matériau ne doit pas dépasser 150 caractères.'));
    }

    if (!unit) {
      errors.push(buildCsvError(row.lineNumber, 'unit', 'L’unité de mesure est requise.'));
    }

    if (unit && unit.length > 30) {
      errors.push(buildCsvError(row.lineNumber, 'unit', 'L’unité de mesure ne doit pas dépasser 30 caractères.'));
    }

    if (!categoryValue) {
      errors.push(buildCsvError(row.lineNumber, 'category', 'La catégorie est requise. Utilisez son nom ou son ID.'));
    }

    if (!name || !unit || !categoryValue || (name && name.length > 150) || (unit && unit.length > 30)) {
      continue;
    }

    const category = categoryById.get(categoryValue) ?? categoryByName.get(normalizeText(categoryValue));

    if (!category) {
      errors.push(buildCsvError(row.lineNumber, 'category', `La catégorie "${categoryValue}" n’existe pas. Créez-la d’abord ou utilisez son ID.`));
      continue;
    }

    const materialKey = `${category.id}:${normalizeText(name)}`;

    if (seenMaterials.has(materialKey)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: "${name}" existe déjà dans ce fichier pour la catégorie "${category.name}".`);
      continue;
    }

    seenMaterials.add(materialKey);

    if (existingMaterialKeys.has(materialKey)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: "${name}" existe déjà dans la catégorie "${category.name}".`);
      continue;
    }

    toCreate.push({
      categoryId: category.id,
      name,
      unit,
      packaging: packaging || undefined,
    });
  }

  if (toCreate.length > 0) {
    await prisma.material.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  revalidatePath('/references/materials');

  return {
    success: errors.length === 0,
    created: toCreate.length,
    skipped,
    warnings,
    errors,
  };
}
