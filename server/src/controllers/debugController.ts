import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const setRandomSubscriptionDueToday = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSubs = await prisma.subscription.findMany({
      where: { 
        status: 'ACTIVE',
        NOT: {
          next_billing_date: today
        }
      },
    });

    if (activeSubs.length === 0) {
      return res.status(404).json({ message: 'No eligible active subscriptions found (all are already due today).' });
    }

    const randomIndex = Math.floor(Math.random() * activeSubs.length);
    const randomSub = activeSubs[randomIndex];

    const updatedSub = await prisma.subscription.update({
      where: { subscription_id: randomSub.subscription_id },
      data: { next_billing_date: today },
      include: { customer: true, plan: true }
    });

    const serializedSub = {
      ...updatedSub,
      subscription_id: updatedSub.subscription_id.toString(),
      customer_id: updatedSub.customer_id.toString(),
      plan_id: updatedSub.plan_id.toString(),
      customer: {
        ...updatedSub.customer,
        customer_id: updatedSub.customer.customer_id.toString()
      },
      plan: {
        ...updatedSub.plan,
        plan_id: updatedSub.plan.plan_id.toString(),
        monthly_price: updatedSub.plan.monthly_price.toNumber()
      }
    };

    res.json({
      message: `Subscription #${updatedSub.subscription_id} (${updatedSub.customer.name}) set to due TODAY.`,
      subscription: serializedSub
    });
  } catch (error) {
    console.error('Error setting random subscription due:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resetInvoices = async (req: Request, res: Response) => {
  try {
    const { count } = await prisma.invoice.deleteMany({});
    res.json({ message: `Reset complete. Deleted ${count} invoices.` });
  } catch (error) {
    console.error('Error resetting invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
