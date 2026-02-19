import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, customers, activeCount, newThisMonthCount] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }, // Enforce newest-first sort
        include: {
          _count: {
            select: { subscriptions: true }
          }
        }
      }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count({ 
        where: { 
          created_at: {
            gte: startOfMonth
          }
        } 
      })
    ]);

    const serializedCustomers = customers.map((customer: any) => ({
      ...customer,
      customer_id: customer.customer_id.toString(),
      subscription_count: customer._count.subscriptions
    }));

    res.json({
      customers: serializedCustomers,
      stats: {
        totalCustomers: await prisma.customer.count(), // Total across all pages (ignoring filters for stats usually, but let's stick to global stats)
        activeCustomers: activeCount,
        newCustomersThisMonth: newThisMonthCount
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, status = 'ACTIVE' } = req.body;

    // Check if email already exists
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        email,
        status,
      },
    });

    res.json({
      ...newCustomer,
      customer_id: newCustomer.customer_id.toString(),
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    const updatedCustomer = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.update({
        where: { customer_id: BigInt(id as string) },
        data: {
          name,
          email,
          status,
        },
      });

      // If customer is set to INACTIVE, update all their subscriptions to INACTIVE
      if (status === 'INACTIVE') {
        await tx.subscription.updateMany({
          where: { customer_id: BigInt(id as string) },
          data: { status: 'INACTIVE' }
        });
      }

      return customer;
    });

    res.json({
      ...updatedCustomer,
      customer_id: updatedCustomer.customer_id.toString(),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cascade delete: Invoices -> Subscriptions -> Customer
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Find all subscriptions for this customer
      const subscriptions = await tx.subscription.findMany({
        where: { customer_id: BigInt(id as string) },
        select: { subscription_id: true }
      });

      const subscriptionIds = subscriptions.map((sub: { subscription_id: bigint }) => sub.subscription_id);

      // 2. Delete all invoices associated with these subscriptions
      if (subscriptionIds.length > 0) {
        await tx.invoice.deleteMany({
          where: { subscription_id: { in: subscriptionIds } }
        });
      }

      // 3. Delete subscriptions
      await tx.subscription.deleteMany({
        where: { customer_id: BigInt(id as string) }
      });

      // 4. Delete the customer
      await tx.customer.delete({
        where: { customer_id: BigInt(id as string) },
      });
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
