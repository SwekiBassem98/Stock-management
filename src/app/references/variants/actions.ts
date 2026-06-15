'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { buildCsvError, normalizeText, parseCsvContent, resolveHeader, type CsvImportResult } from '../import-csv';

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

function parseNonNegativeNumber(value: string | undefined, fallback = 0) {
  const normalized = value?.trim().replace(',', '.');

  if (!normalized) return fallback;

  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) return null;

  return number;
}

function variantIdentity(variant: {
  materialId: number;
  supplierRef?: string | null;
  internalRef?: string | null;
  color?: string | null;
  thickness?: string | null;
}) {
  return [
    variant.materialId,
    variant.supplierRef || '',
    variant.internalRef || '',
    variant.color || '',
    variant.thickness || '',
  ].join('|').toLowerCase();
}

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
  revalidatePath('/references/variants');
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
  revalidatePath('/references/variants');
}

export async function deleteVariant(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  await prisma.variant.delete({ where: { id } });
  revalidatePath('/references/variants');
}

export async function importCsvVariants(formData: FormData): Promise<CsvImportResult> {
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

  const materialHeader = resolveHeader(parsedCsv.headers, ['material', 'materiel', 'matériau', 'materialid', 'idmateriel', 'idmatiere']);
  const internalRefHeader = resolveHeader(parsedCsv.headers, ['internalref', 'refinterne', 'referenceinterne']);
  const supplierRefHeader = resolveHeader(parsedCsv.headers, ['supplierref', 'reffournisseur', 'referencefournisseur']);
  const colorHeader = resolveHeader(parsedCsv.headers, ['color', 'couleur']);
  const thicknessHeader = resolveHeader(parsedCsv.headers, ['thickness', 'epaisseur']);
  const avgUnitPriceHeader = resolveHeader(parsedCsv.headers, ['avgunitprice', 'prixunitairemoyen', 'prixmoyen']);
  const minAlertHeader = resolveHeader(parsedCsv.headers, ['minalert', 'seuildalerte', 'seuildalerteminimum']);
  const initialQuantityHeader = resolveHeader(parsedCsv.headers, ['initialquantity', 'quantiteinitiale']);

  if (!materialHeader) {
    return emptyResult([
      buildCsvError(1, 'material', 'En-tête requis manquant. Utilisez: material, matériau, materialid ou idmatiere.'),
    ]);
  }

  const errors: CsvImportResult['errors'] = [];
  const warnings: string[] = [];
  const seenVariants = new Set<string>();
  const toCreate: Array<{
    materialId: number;
    supplierRef?: string;
    internalRef?: string;
    color?: string;
    thickness?: string;
    avgUnitPrice: number;
    minAlert: number;
    initialQuantity: number;
  }> = [];
  let skipped = 0;

  const materials = await prisma.material.findMany({
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });
  const materialById = new Map(materials.map((material) => [String(material.id), material]));
  const materialByName = new Map<string, number>();

  materials.forEach((material) => {
    const normalizedName = normalizeText(material.name);
    const existingCount = materialByName.get(normalizedName);

    materialByName.set(normalizedName, existingCount === undefined ? material.id : -1);
  });

  const existingVariants = await prisma.variant.findMany({
    select: {
      materialId: true,
      supplierRef: true,
      internalRef: true,
      color: true,
      thickness: true,
    },
  });
  const existingVariantKeys = new Set(existingVariants.map(variantIdentity));

  for (const row of parsedCsv.rows) {
    const materialValue = row.values[materialHeader]?.trim();
    const internalRef = internalRefHeader ? row.values[internalRefHeader]?.trim() : undefined;
    const supplierRef = supplierRefHeader ? row.values[supplierRefHeader]?.trim() : undefined;
    const color = colorHeader ? row.values[colorHeader]?.trim() : undefined;
    const thickness = thicknessHeader ? row.values[thicknessHeader]?.trim() : undefined;

    const avgUnitPrice = avgUnitPriceHeader
      ? parseNonNegativeNumber(row.values[avgUnitPriceHeader])
      : 0;
    const minAlert = minAlertHeader
      ? parseNonNegativeNumber(row.values[minAlertHeader])
      : 0;
    const initialQuantity = initialQuantityHeader
      ? parseNonNegativeNumber(row.values[initialQuantityHeader])
      : 0;

    if (!materialValue) {
      errors.push(buildCsvError(row.lineNumber, 'material', 'Le matériau est requis. Utilisez son nom ou son ID.'));
    }

    if (avgUnitPrice === null) {
      errors.push(buildCsvError(row.lineNumber, 'avgUnitPrice', 'Le prix unitaire moyen doit être un nombre positif ou nul.'));
    }

    if (minAlert === null) {
      errors.push(buildCsvError(row.lineNumber, 'minAlert', 'Le seuil d’alerte minimum doit être un nombre positif ou nul.'));
    }

    if (initialQuantity === null) {
      errors.push(buildCsvError(row.lineNumber, 'initialQuantity', 'La quantité initiale doit être un nombre positif ou nul.'));
    }

    if (!materialValue || avgUnitPrice === null || minAlert === null || initialQuantity === null) {
      continue;
    }

    let materialId: number | undefined;

    if (materialById.has(materialValue)) {
      materialId = Number(materialValue);
    } else {
      materialId = materialByName.get(normalizeText(materialValue));
    }

    if (!materialId) {
      errors.push(buildCsvError(row.lineNumber, 'material', `Le matériau "${materialValue}" n’existe pas. Créez-le d’abord ou utilisez son ID.`));
      continue;
    }

    if (materialId === -1) {
      errors.push(buildCsvError(row.lineNumber, 'material', `Le matériau "${materialValue}" correspond à plusieurs matériaux. Utilisez son ID.`));
      continue;
    }

    const variantPayload = {
      materialId,
      supplierRef: supplierRef || undefined,
      internalRef: internalRef || undefined,
      color: color || undefined,
      thickness: thickness || undefined,
      avgUnitPrice,
      minAlert,
      initialQuantity,
    };
    const variantKey = variantIdentity(variantPayload);

    if (seenVariants.has(variantKey)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: cette variante est déjà présente dans ce fichier.`);
      continue;
    }

    seenVariants.add(variantKey);

    if (existingVariantKeys.has(variantKey)) {
      skipped += 1;
      warnings.push(`Ligne ${row.lineNumber}: cette variante existe déjà.`);
      continue;
    }

    toCreate.push(variantPayload);
  }

  if (toCreate.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const variantPayload of toCreate) {
        const variant = await tx.variant.create({
          data: {
            materialId: variantPayload.materialId,
            supplierRef: variantPayload.supplierRef,
            internalRef: variantPayload.internalRef,
            color: variantPayload.color,
            thickness: variantPayload.thickness,
            avgUnitPrice: String(variantPayload.avgUnitPrice),
            minAlert: String(variantPayload.minAlert),
            initialQuantity: String(variantPayload.initialQuantity),
          },
        });

        await tx.stock.create({
          data: {
            variantId: variant.id,
            currentQty: String(variantPayload.initialQuantity),
            lastUpdated: new Date(),
          },
        });

        if (variantPayload.initialQuantity > 0) {
          await tx.movement.create({
            data: {
              variantId: variant.id,
              type: 'ADJUST',
              quantity: String(variantPayload.initialQuantity),
              movementDate: new Date(),
              note: `Initial stock setup for variant ${variant.id}`,
            },
          });
        }
      }
    });
  }

  revalidatePath('/references/variants');

  return {
    success: errors.length === 0,
    created: toCreate.length,
    skipped,
    warnings,
    errors,
  };
}
