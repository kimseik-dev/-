import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, subscriptions] = await prisma.$transaction([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          plan: true,
        },
        orderBy: {
            subscription_id: 'desc',
        },
      }),
    ]);

    // Transform bigints to string for JSON serialization
    const serializedSubscriptions = subscriptions.map((sub: any) => ({
        ...sub,
        subscription_id: sub.subscription_id.toString(),
        customer_id: sub.customer_id.toString(),
        plan_id: sub.plan_id.toString(),
        payment_type: sub.payment_type,
        plan: {
            ...sub.plan,
            plan_id: sub.plan.plan_id.toString(),
            monthly_price: sub.plan.monthly_price.toNumber(), // Convert Decimal to number
        },
        customer: {
            ...sub.customer,
            customer_id: sub.customer.customer_id.toString(),
        }
    }));

    res.json({
      invoices: serializedSubscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        details: error?.message || String(error),
        stack: error?.stack
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalSubscriptions,
      activeSubscriptions,
      waitingSubscriptions,
      activeSubsWithPlan,
      paidInvoices
    ] = await prisma.$transaction([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'WAITING' } }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
      prisma.invoice.findMany({
        where: {
          payment_status: 'PAID',
          billing_date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ]);

    const monthlyRevenue = activeSubsWithPlan.reduce((acc: number, sub: any) => {
      return acc + sub.plan.monthly_price.toNumber();
    }, 0);

    const actualRevenue = paidInvoices.reduce((acc: number, inv: any) => {
      return acc + inv.amount_paid.toNumber();
    }, 0);

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      waitingSubscriptions,
      monthlyRevenue,
      actualRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    const isManagement = req.query.mode === 'management';

    const where: any = {};
    if (!isManagement) {
      where.is_active = true;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { plan_id: 'desc' },
    });

    let serializedPlans = plans.map((plan: any) => ({
      ...plan,
      plan_id: plan.plan_id.toString(),
      monthly_price: plan.monthly_price.toNumber(),
    }));

    if (!isManagement) {
      serializedPlans = serializedPlans.filter((plan: any) =>
        /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(plan.plan_name)
      );
    }

    res.json(serializedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
