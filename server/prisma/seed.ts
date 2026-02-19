
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Plans
  const basicPlan = await prisma.plan.upsert({
    where: { plan_name: '베이직' },
    update: {},
    create: {
      plan_name: '베이직',
      monthly_price: 9900,
      billing_cycle: 'MONTHLY',
      currency: 'KRW',
      is_active: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { plan_name: '프로' },
    update: {},
    create: {
      plan_name: '프로',
      monthly_price: 19900,
      billing_cycle: 'MONTHLY',
      currency: 'KRW',
      is_active: true,
    },
  });

  const annualPlan = await prisma.plan.upsert({
    where: { plan_name: '연간 베이직' },
    update: {},
    create: {
      plan_name: '연간 베이직',
      monthly_price: 99000,
      billing_cycle: 'ANNUAL',
      currency: 'KRW',
      is_active: true,
    },
  });

  // Create Customers and Subscriptions
  const customersData = [
    { name: '홍길동', email: 'hong@example.com', status: 'ACTIVE' },
    { name: '김철수', email: 'kim@example.com', status: 'ACTIVE' },
    { name: '이영희', email: 'lee@example.com', status: 'INACTIVE' },
    { name: '박민수', email: 'park@example.com', status: 'ACTIVE' },
    { name: '최지은', email: 'choi@example.com', status: 'ACTIVE' },
  ];

  for (const cData of customersData) {
    const customer = await prisma.customer.upsert({
      where: { email: cData.email },
      update: {},
      create: {
        name: cData.name,
        email: cData.email,
        status: cData.status,
      },
    });

    // Create Subscription for each customer
    // Random plan
    const plans = [basicPlan, proPlan, annualPlan];
    const plan = plans[Math.floor(Math.random() * plans.length)];

    await prisma.subscription.create({
      data: {
        customer_id: customer.customer_id,
        plan_id: plan.plan_id,
        start_date: new Date(),
        next_billing_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'ACTIVE',
        payment_method_token: `token_${customer.email}`,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
