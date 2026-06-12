import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch comprehensive dashboard data
  const [
    totalCategories,
    totalMaterials,
    totalVariants,
    totalSuppliers,
    totalOrders,
    totalInvoices,
    totalMovements,
    stockLevels,
    recentOrders,
    recentInvoices,
    recentMovements,
    outOfStockItems,
    allStockItems,
    supplierBalances,
    ordersByStatus,
    invoicesByStatus,
    movementsByType,
    users,
  ] = await Promise.all([
    // Basic counts
    prisma.category.count(),
    prisma.material.count(),
    prisma.variant.count(),
    prisma.supplier.count(),
    prisma.supplierOrder.count(),
    prisma.supplierInvoice.count(),
    prisma.movement.count(),
    
    // Stock levels summary
    prisma.stock.aggregate({
      _sum: { currentQty: true },
      _count: true,
    }),
    
    // Recent activities (last 10)
    prisma.supplierOrder.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, _count: { select: { lines: true } } },
    }),
    
    prisma.supplierInvoice.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { supplier: true },
    }),
    
    prisma.movement.findMany({
      take: 10,
      orderBy: { movementDate: 'desc' },
      include: { variant: { include: { material: true } } },
    }),
    
    // Out of stock items
    prisma.stock.findMany({
      where: {
        currentQty: { lte: 0 }
      },
      include: { variant: { include: { material: true } } },
      take: 10,
      orderBy: { currentQty: 'asc' },
    }),
    
    // All stock items for low stock calculation
    prisma.stock.findMany({
      include: { variant: { include: { material: true } } },
    }),
    
    // Supplier balances
    prisma.supplier.findMany({
      where: { currentBalance: { not: 0 } },
      orderBy: { currentBalance: 'desc' },
      take: 10,
    }),
    
    // Orders by status
    prisma.supplierOrder.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    
    // Invoices by status
    prisma.supplierInvoice.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    
    // Movements by type
    prisma.movement.groupBy({
      by: ['type'],
      _count: { type: true },
      where: {
        movementDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    
    // Users (for admin dashboard)
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, username: true, fullName: true }
        }
      }
    }),
  ]);

  // Convert Decimal types to strings for client component
  const convertedRecentOrders = recentOrders.map(order => ({
    ...order,
    supplier: {
      ...order.supplier,
      currentBalance: order.supplier.currentBalance.toString(),
    },
  }));

  const convertedRecentInvoices = recentInvoices.map(invoice => ({
    ...invoice,
    totalTTC: invoice.totalTTC.toString(),
    supplier: {
      ...invoice.supplier,
      currentBalance: invoice.supplier.currentBalance.toString(),
    },
  }));

  const convertedRecentMovements = recentMovements.map(movement => ({
    ...movement,
    quantity: movement.quantity.toString(),
    unitPrice: movement.unitPrice?.toString() || null,
    variant: {
      ...movement.variant,
      avgUnitPrice: movement.variant.avgUnitPrice.toString(),
      minAlert: movement.variant.minAlert.toString(),
    },
  }));

  // Calculate low stock items (current qty < min alert or out of stock)
  const lowStockItems = allStockItems.filter(stock => {
    const currentQty = Number(stock.currentQty);
    const minAlert = Number(stock.variant.minAlert);
    return currentQty === 0 || (minAlert > 0 && currentQty < minAlert);
  }).slice(0, 20);

  const convertedLowStockItems = lowStockItems.map(stock => ({
    ...stock,
    currentQty: stock.currentQty.toString(),
    variant: {
      ...stock.variant,
      avgUnitPrice: stock.variant.avgUnitPrice.toString(),
      minAlert: stock.variant.minAlert.toString(),
    },
  }));

  const convertedSupplierBalances = supplierBalances.map(supplier => ({
    ...supplier,
    currentBalance: supplier.currentBalance.toString(),
  }));

  const dashboardData = {
    // Summary counts
    totalCategories,
    totalMaterials,
    totalVariants,
    totalSuppliers,
    totalOrders,
    totalInvoices,
    totalMovements,
    
    // Stock summary
    totalStockItems: stockLevels._count,
    totalStockQuantity: stockLevels._sum.currentQty?.toString() || '0',
    
    // Recent activities
    recentOrders: convertedRecentOrders,
    recentInvoices: convertedRecentInvoices,
    recentMovements: convertedRecentMovements,
    
    // Alerts and insights
    lowStockItems: convertedLowStockItems,
    supplierBalances: convertedSupplierBalances,
    
    // Analytics
    ordersByStatus,
    invoicesByStatus,
    movementsByType,
    users,
  };

  return <DashboardClient data={dashboardData} />;
}