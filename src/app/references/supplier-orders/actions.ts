'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/session-server';

const orderSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  orderDate: z.coerce.date(),
  requestedDeliveryDate: z.coerce.date().optional(),
  shippingMethod: z.string().optional(),
});

export async function createSupplierOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = orderSchema.safeParse({
    supplierId: formData.get('supplierId'),
    orderDate: formData.get('orderDate'),
    requestedDeliveryDate: formData.get('requestedDeliveryDate') || undefined,
    shippingMethod: formData.get('shippingMethod') || undefined,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.supplierOrder.create({
    data: {
      supplierId: parsed.data.supplierId,
      orderDate: parsed.data.orderDate,
      requestedDeliveryDate: parsed.data.requestedDeliveryDate,
      shippingMethod: parsed.data.shippingMethod,
    },
  });
  revalidatePath('/supplier-orders');
}

export async function updateSupplierOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  const status = String(formData.get('status'));
  await prisma.supplierOrder.update({ where: { id }, data: { status: status as any } });
  revalidatePath('/supplier-orders');
}

export async function deleteSupplierOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  // prevent deletion if lines exist
  const count = await prisma.supplierOrderLine.count({ where: { orderId: id } });
  if (count > 0) throw new Error('Cannot delete order with lines');
  await prisma.supplierOrder.delete({ where: { id } });
  revalidatePath('/supplier-orders');
}

const lineSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
  quantityOrdered: z.coerce.number().positive(),
});

export async function addOrderLine(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = lineSchema.safeParse({
    orderId: formData.get('orderId'),
    variantId: formData.get('variantId'),
    quantityOrdered: formData.get('quantityOrdered'),
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.supplierOrderLine.create({
    data: {
      orderId: parsed.data.orderId,
      variantId: parsed.data.variantId,
      quantityOrdered: String(parsed.data.quantityOrdered),
    },
  });

  revalidatePath(`/supplier-orders/${parsed.data.orderId}`);
}

export async function receiveOnLine(formData: FormData): Promise<void> {
  await requireAdmin();
  const lineId = z.coerce.number().int().positive().parse(formData.get('lineId'));
  const qty = z.coerce.number().positive().parse(formData.get('quantityReceived'));
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const line = await tx.supplierOrderLine.findUniqueOrThrow({ where: { id: lineId } });
    const order = await tx.supplierOrder.findUniqueOrThrow({ where: { id: line.orderId } });

    const ordered = Number(line.quantityOrdered);
    const received = Number(line.quantityReceived);
    if (received + qty > ordered) throw new Error('Receiving exceeds ordered quantity');

    // Movement IN without unitPrice (price will be from invoice later)
    await tx.movement.create({
      data: {
        variantId: line.variantId,
        type: 'IN',
        quantity: String(qty),
        movementDate: now,
        documentType: 'SUPPLIER_ORDER_RECEIPT',
        documentId: line.id,
        note: `Receipt for order #${order.id}`,
      },
    });

    // Update Stock
    const stock = await tx.stock.upsert({
      where: { variantId: line.variantId },
      create: { variantId: line.variantId, currentQty: 0 },
      update: {},
    });

    const newQty = Number(stock.currentQty) + qty;
    await tx.stock.update({ where: { id: stock.id }, data: { currentQty: String(newQty), lastUpdated: now } });

    // Update line
    await tx.supplierOrderLine.update({
      where: { id: lineId },
      data: { quantityReceived: String(received + qty), lastReceiptDate: now },
    });

    // Update order status if needed
    const lines = await tx.supplierOrderLine.findMany({ where: { orderId: order.id } });
    const fully = lines.every(l => Number(l.quantityReceived) >= Number(l.quantityOrdered));
    const partial = lines.some(l => Number(l.quantityReceived) > 0) && !fully;
    await tx.supplierOrder.update({
      where: { id: order.id },
      data: { status: fully ? 'RECEIVED' : partial ? 'PARTIALLY_RECEIVED' : order.status },
    });
  });

  // We need the orderId to revalidate detail page; fetch it quickly
  const line = await prisma.supplierOrderLine.findUnique({ where: { id: lineId }, select: { orderId: true } });
  revalidatePath('/supplier-orders');
  if (line) revalidatePath(`/supplier-orders/${line.orderId}`);
}

export async function deleteOrderLine(formData: FormData): Promise<void> {
  await requireAdmin();
  const lineId = z.coerce.number().int().positive().parse(formData.get('lineId'));
  const line = await prisma.supplierOrderLine.findUniqueOrThrow({ where: { id: lineId } });
  if (Number(line.quantityReceived) > 0) throw new Error('Cannot delete a line that has receipts');
  await prisma.supplierOrderLine.delete({ where: { id: lineId } });
  revalidatePath(`/supplier-orders/${line.orderId}`);
}

const reminderSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  reminderDate: z.coerce.date(),
  contactType: z.enum(['PHONE','EMAIL','VISIT','MESSAGE','OTHER']),
  subject: z.string().optional(),
  result: z.string().optional(),
});

export async function addReminder(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = reminderSchema.safeParse({
    orderId: formData.get('orderId'),
    reminderDate: formData.get('reminderDate'),
    contactType: formData.get('contactType'),
    subject: formData.get('subject') || undefined,
    result: formData.get('result') || undefined,
  });
  if (!parsed.success) throw new Error('Invalid input');

  await prisma.supplierOrderReminder.create({ data: parsed.data });
  revalidatePath(`/supplier-orders/${parsed.data.orderId}`);
}

export async function deleteReminder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().parse(formData.get('id'));
  const rem = await prisma.supplierOrderReminder.delete({ where: { id } });
  revalidatePath(`/supplier-orders/${rem.orderId}`);
}