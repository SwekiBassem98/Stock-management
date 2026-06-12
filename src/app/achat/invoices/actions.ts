'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAdmin } from '@/lib/session-server';

type Line = { variantId: number; quantity: number; unitPurchasePrice: number };

export async function createInvoice(formData: FormData): Promise<void> {
  await requireAdmin();
  const supplierId = z.coerce.number().int().positive().parse(formData.get('supplierId'));
  const number = String(formData.get('number') || '').trim();
  const date = z.coerce.date().parse(formData.get('date'));
  const lines = JSON.parse(String(formData.get('lines') || '[]')) as Line[];
  if (!number || lines.length === 0) throw new Error('Missing invoice number or lines');

  const totalTTC = lines.reduce((sum, l) => sum + l.quantity * l.unitPurchasePrice, 0);

  await prisma.$transaction(async (tx) => {
    const inv = await tx.supplierInvoice.create({
      data: { supplierId, number, date, totalTTC: String(totalTTC), status: 'OPEN' },
    });

    for (const l of lines) {
      const line = await tx.supplierInvoiceLine.create({
        data: {
          invoiceId: inv.id,
          variantId: l.variantId,
          quantity: String(l.quantity),
          unitPurchasePrice: String(l.unitPurchasePrice),
        },
      });

      // IN movement
      await tx.movement.create({
        data: {
          variantId: l.variantId,
          type: 'IN',
          quantity: String(l.quantity),
          unitPrice: String(l.unitPurchasePrice),
          movementDate: date,
          documentType: 'SUPPLIER_INVOICE_LINE',
          documentId: line.id,
          note: `Invoice ${number}`,
        },
      });

      // Update stock and weighted average price
      const stock = await tx.stock.upsert({
        where: { variantId: l.variantId },
        create: { variantId: l.variantId, currentQty: 0 },
        update: {},
      });
      const variant = await tx.variant.findUnique({ where: { id: l.variantId } });

      const currentQty = Number(stock.currentQty);
      const currentAvg = Number(variant?.avgUnitPrice ?? 0);
      const newQty = currentQty + l.quantity;
      const newAvg = newQty === 0 ? 0 : (currentQty * currentAvg + l.quantity * l.unitPurchasePrice) / newQty;

      await tx.stock.update({ where: { id: stock.id }, data: { currentQty: String(newQty), lastUpdated: new Date() } });
      await tx.variant.update({ where: { id: l.variantId }, data: { avgUnitPrice: String(newAvg) } });
    }
  });

  revalidatePath('/invoices');
  revalidatePath('/stock');
  revalidatePath('/movements');
}

export async function deleteInvoice(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  
  // Delete all associated lines and their movements first
  const lines = await prisma.supplierInvoiceLine.findMany({ where: { invoiceId: id } });
  
  await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      // Delete movements associated with this line
      await tx.movement.deleteMany({
        where: {
          documentType: 'SUPPLIER_INVOICE_LINE',
          documentId: line.id,
        },
      });
    }
    
    // Delete all invoice lines
    await tx.supplierInvoiceLine.deleteMany({ where: { invoiceId: id } });
    
    // Delete the invoice
    await tx.supplierInvoice.delete({ where: { id } });
  });
  
  revalidatePath('/achat/invoices');
  revalidatePath('/stock');
  revalidatePath('/movements');
}

export async function addInvoiceLine(formData: FormData): Promise<void> {
  await requireAdmin();
  const invoiceId = z.coerce.number().int().positive().parse(formData.get('invoiceId'));
  const variantId = z.coerce.number().int().positive().parse(formData.get('variantId'));
  const quantity = z.coerce.number().positive().parse(formData.get('quantity'));
  const unitPurchasePrice = z.coerce.number().nonnegative().parse(formData.get('unitPurchasePrice'));

  const invoice = await prisma.supplierInvoice.findUniqueOrThrow({ where: { id: invoiceId } });

  await prisma.$transaction(async (tx) => {
    const line = await tx.supplierInvoiceLine.create({
      data: {
        invoiceId,
        variantId,
        quantity: String(quantity),
        unitPurchasePrice: String(unitPurchasePrice),
      },
    });

    // IN movement - use current date/time for when the movement actually occurs
    await tx.movement.create({
      data: {
        variantId,
        type: 'IN',
        quantity: String(quantity),
        unitPrice: String(unitPurchasePrice),
        movementDate: new Date(),
        documentType: 'SUPPLIER_INVOICE_LINE',
        documentId: line.id,
        note: `Invoice ${invoice.number}`,
      },
    });

    // Update stock + avg price
    const stock = await tx.stock.upsert({
      where: { variantId },
      create: { variantId, currentQty: 0 },
      update: {},
    });
    const variant = await tx.variant.findUnique({ where: { id: variantId } });

    const currentQty = Number(stock.currentQty);
    const currentAvg = Number(variant?.avgUnitPrice ?? 0);
    const newQty = currentQty + quantity;
    const newAvg = newQty === 0 ? 0 : (currentQty * currentAvg + quantity * unitPurchasePrice) / newQty;

    await tx.stock.update({ where: { id: stock.id }, data: { currentQty: String(newQty), lastUpdated: new Date() } });
    await tx.variant.update({ where: { id: variantId }, data: { avgUnitPrice: String(newAvg) } });

    // Update invoice total
    const lines = await tx.supplierInvoiceLine.findMany({ where: { invoiceId } });
    const total = lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPurchasePrice), 0);
    await tx.supplierInvoice.update({ where: { id: invoiceId }, data: { totalTTC: String(total) } });
  });

  revalidatePath(`/achat/invoices/${invoiceId}`);
  revalidatePath('/stock');
  revalidatePath('/movements');
}

export async function deleteInvoiceLine(formData: FormData): Promise<void> {
  await requireAdmin();
  const lineId = z.coerce.number().int().positive().parse(formData.get('lineId'));
  const invoiceId = z.coerce.number().int().positive().parse(formData.get('invoiceId'));
  
  // Get the line info before deletion
  const line = await prisma.supplierInvoiceLine.findUniqueOrThrow({ where: { id: lineId } });
  
  await prisma.$transaction(async (tx) => {
    // Delete movements associated with this line
    await tx.movement.deleteMany({
      where: {
        documentType: 'SUPPLIER_INVOICE_LINE',
        documentId: lineId,
      },
    });
    
    // Get stock for this variant
    const stock = await tx.stock.findUnique({ where: { variantId: line.variantId } });
    
    if (stock) {
      // Recalculate stock by removing this line's quantity
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unitPurchasePrice);
      const currentQty = Number(stock.currentQty);
      const variant = await tx.variant.findUnique({ where: { id: line.variantId } });
      const currentAvg = Number(variant?.avgUnitPrice ?? 0);
      
      const newQty = Math.max(0, currentQty - quantity);
      let newAvg = 0;
      
      if (newQty > 0 && currentQty > 0) {
        // Recalculate weighted average: remove the contribution of this line
        newAvg = (currentQty * currentAvg - quantity * unitPrice) / newQty;
      }
      
      await tx.stock.update({
        where: { id: stock.id },
        data: { currentQty: String(newQty), lastUpdated: new Date() },
      });
      
      await tx.variant.update({
        where: { id: line.variantId },
        data: { avgUnitPrice: String(newAvg) },
      });
    }
    
    // Delete the line
    await tx.supplierInvoiceLine.delete({ where: { id: lineId } });
    
    // Update invoice total
    const remainingLines = await tx.supplierInvoiceLine.findMany({ where: { invoiceId } });
    const total = remainingLines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPurchasePrice), 0);
    await tx.supplierInvoice.update({ where: { id: invoiceId }, data: { totalTTC: String(total) } });
  });
  
  revalidatePath(`/achat/invoices/${invoiceId}`);
  revalidatePath('/stock');
  revalidatePath('/movements');
}

// Create material from invoice page
export async function createMaterialFromInvoice(formData: FormData): Promise<number> {
  const schema = z.object({
    categoryId: z.coerce.number().int().positive(),
    name: z.string().min(1),
    unit: z.string().min(1),
    packaging: z.string().optional(),
  });

  const parsed = schema.safeParse({
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    unit: formData.get('unit'),
    packaging: (formData.get('packaging') || undefined) as string | undefined,
  });
  
  if (!parsed.success) throw new Error('Invalid material input');

  const material = await prisma.material.create({ data: parsed.data });
  revalidatePath('/references/materials');
  return material.id;
}

// Create variant from invoice page
export async function createVariantFromInvoice(formData: FormData): Promise<number> {
  const schema = z.object({
    materialId: z.coerce.number().int().positive(),
    supplierRef: z.string().optional(),
    internalRef: z.string().optional(),
    color: z.string().optional(),
    thickness: z.string().optional(),
    avgUnitPrice: z.coerce.number().nonnegative().default(0),
    minAlert: z.coerce.number().nonnegative().default(0),
  });

  const parsed = schema.safeParse({
    materialId: formData.get('materialId'),
    supplierRef: (formData.get('supplierRef') || undefined) as string | undefined,
    internalRef: (formData.get('internalRef') || undefined) as string | undefined,
    color: (formData.get('color') || undefined) as string | undefined,
    thickness: (formData.get('thickness') || undefined) as string | undefined,
    avgUnitPrice: formData.get('avgUnitPrice') ?? 0,
    minAlert: formData.get('minAlert') ?? 0,
  });
  
  if (!parsed.success) throw new Error('Invalid variant input');

  const variant = await prisma.variant.create({
    data: {
      ...parsed.data,
      avgUnitPrice: String(parsed.data.avgUnitPrice),
      minAlert: String(parsed.data.minAlert),
    },
  });
  
  revalidatePath('/references/variants');
  return variant.id;
}