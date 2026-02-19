import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const { mode } = req.query;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (mode !== 'management') {
      where.is_active = true;
    }

    if (search) {
      where.plan_name = {
        contains: search
      };
    }

    const [total, plans] = await prisma.$transaction([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        skip: mode === 'management' ? skip : undefined, // Only paginate in management mode
        take: mode === 'management' ? limit : undefined,
        orderBy: { plan_id: 'desc' },
      }),
    ]);

    const serializedPlans = plans.map((plan: any) => ({
      ...plan,
      plan_id: plan.plan_id.toString(),
      monthly_price: plan.monthly_price.toNumber(),
    }));

    res.json({
        plans: serializedPlans,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { plan_name, monthly_price, billing_cycle } = req.body;

    const newPlan = await prisma.plan.create({
      data: {
        plan_name,
        monthly_price,
        billing_cycle,
        is_active: true,
      },
    });

    // Convert Decimal to number for response
    res.status(201).json({
      ...newPlan,
      plan_id: newPlan.plan_id.toString(),
      monthly_price: newPlan.monthly_price.toNumber(),
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan_name, monthly_price, billing_cycle } = req.body;

    const updatedPlan = await prisma.plan.update({
      where: { plan_id: BigInt(id as string) },
      data: {
        plan_name,
        monthly_price,
        billing_cycle,
      },
    });

    res.json({
      ...updatedPlan,
      plan_id: updatedPlan.plan_id.toString(),
      monthly_price: updatedPlan.monthly_price.toNumber(),
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const togglePlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const plan = await prisma.plan.findUnique({
      where: { plan_id: BigInt(id as string) },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const updatedPlan = await prisma.plan.update({
      where: { plan_id: BigInt(id as string) },
      data: {
        is_active: !plan.is_active,
      },
    });

    res.json({
      ...updatedPlan,
      plan_id: updatedPlan.plan_id.toString(),
      monthly_price: updatedPlan.monthly_price.toNumber(),
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.plan.delete({
      where: { plan_id: BigInt(id as string) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Cannot delete plan because it is being used by active subscriptions.' 
      });
    }
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
