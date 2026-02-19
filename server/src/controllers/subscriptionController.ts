import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

export const addSubscription = async (req: Request, res: Response) => {
  try {
    const { customer_id, plan_id, payment_method_token, payment_type } = req.body;

    if (!customer_id || !plan_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // We assume start_date is now, and next_billing_date is 1 month from now for simplicity
    // Ideally we fetch the plan's billing cycle to calculate this.
    const plan = await prisma.plan.findUnique({ where: { plan_id: BigInt(plan_id) } });
    if (!plan) {
         return res.status(404).json({ error: 'Plan not found' });
    }

    const nextBillingDate = new Date();
    if (plan.billing_cycle === 'ANNUAL') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    const newSubscription = await prisma.subscription.create({
      data: {
        customer_id: BigInt(customer_id),
        plan_id: BigInt(plan_id),
        payment_type: payment_type || 'RECURRING',
        start_date: new Date(),
        next_billing_date: new Date(), // Waiting subscriptions are due immediately (first payment)
        status: 'WAITING',
      },
    });

    res.json({ 
        message: 'Subscription added successfully', 
        subscription_id: newSubscription.subscription_id.toString() 
    });
  } catch (error) {
    console.error('Error adding subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const modifySubscription = async (req: Request, res: Response) => {
  try {
    const { subscription_id, plan_id, status, payment_type } = req.body;

    if (!subscription_id) {
      return res.status(400).json({ error: 'Missing subscription_id' });
    }

    const dataToUpdate: any = {};
    if (plan_id) dataToUpdate.plan_id = BigInt(plan_id);
    if (status) dataToUpdate.status = status;
    if (payment_type) {
        dataToUpdate.payment_type = payment_type;
        dataToUpdate.payment_method_token = payment_type === "RECURRING" ? "tok_recurring_visa" : "tok_onetime_card";
    }

    // Use transaction to update subscription and customer status together
    const updatedSubscription = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update the subscription
      const subscription = await tx.subscription.update({
        where: { subscription_id: BigInt(subscription_id) },
        data: dataToUpdate,
      });

      // If the subscription is being activated, also activate the customer
      if (status === 'ACTIVE') {
        await tx.customer.update({
          where: { customer_id: subscription.customer_id },
          data: { status: 'ACTIVE' }
        });
      }

      return subscription;
    });

    res.json({ 
        message: 'Subscription updated successfully',
        subscription_id: updatedSubscription.subscription_id.toString()
    });
  } catch (error) {
    console.error('Error modifying subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cascade delete: Invoices -> Subscription
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete all invoices associated with this subscription
      await tx.invoice.deleteMany({
        where: { subscription_id: BigInt(id as string) }
      });

      // 2. Delete the subscription
      await tx.subscription.delete({
        where: { subscription_id: BigInt(id as string) },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
