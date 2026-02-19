import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const generateTodayInvoices = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    // Start of today
    today.setHours(0, 0, 0, 0);
    
    // Find active or waiting subscriptions where next_billing_date <= today
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'WAITING'] },
        next_billing_date: {
          lte: new Date() // Less than or equal to now
        }
      },
      include: {
        plan: true
      }
    });

    let generatedCount = 0;

    // Process each subscription
    for (const sub of dueSubscriptions) {
        // 1. Create Invoice
        await prisma.invoice.create({
            data: {
                subscription_id: sub.subscription_id,
                amount_paid: sub.plan.monthly_price,
                payment_status: 'PAID', // Simulating successful auto-payment
                billing_date: new Date()
            }
        });

        // 2. Update Next Billing Date and Activate if needed
        const nextDate = new Date(sub.next_billing_date);
        if (sub.plan.billing_cycle === 'ANNUAL') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        const updateData: any = {
            next_billing_date: nextDate
        };

        if (sub.status === 'WAITING') {
            updateData.status = 'ACTIVE';
        }

        await prisma.subscription.update({
            where: { subscription_id: sub.subscription_id },
            data: updateData
        });

        generatedCount++;
    }

    res.json({
      message: `${generatedCount}건의 청구서가 성공적으로 생성되었습니다.`,
      generated_count: generatedCount
    });

  } catch (error) {
    console.error('Error generating invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getBillingHistory = async (req: Request, res: Response) => {
    try {
    const search = (req.query.search as string) || '';

    const where: any = {};
    if (search) {
        where.subscription = {
            customer: {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            }
        };
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            subscription: {
                include: {
                    customer: true,
                    plan: true
                }
            }
        },
        orderBy: {
            billing_date: 'desc'
        }
    });

        const serializedInvoices = invoices.map((inv: any) => ({
            invoice_id: inv.invoice_id.toString(),
            subscription_id: inv.subscription_id.toString(),
            amount_paid: inv.amount_paid.toNumber(),
            billing_date: inv.billing_date,
            payment_status: inv.payment_status,
            customer_name: inv.subscription.customer.name,
            customer_email: inv.subscription.customer.email,
            plan_name: inv.subscription.plan.plan_name,
            next_billing_date: inv.subscription.next_billing_date
        }));

        res.json(serializedInvoices);
    } catch (error) {
        console.error('Error fetching billing history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
