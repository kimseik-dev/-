import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Subscription routes
import addSubscriptionRoute from './routes/api/v1/subscription/add';
import modifySubscriptionRoute from './routes/api/v1/subscription/modify';
import deleteSubscriptionRoute from './routes/api/v1/subscription/delete';

// Invoice routes
import invoiceRoutes from './routes/api/v1/invoices';
import dashboardStatsRoutes from './routes/api/v1/dashboard-stats';

// Customer routes
import customerListRoute from './routes/api/v1/customers';
import customerAddRoute from './routes/api/v1/customers/add';
import customerModifyRoute from './routes/api/v1/customers/modify';
import customerDeleteRoute from './routes/api/v1/customers/delete';

// Billing routes
import billingGenerateRoute from './routes/api/v1/billing/generate';
import billingHistoryRoute from './routes/api/v1/billing/history';

// Plan routes
import planListRoute from './routes/api/v1/plans';
import planAddRoute from './routes/api/v1/plans/add';
import planModifyRoute from './routes/api/v1/plans/modify';
import planDeleteRoute from './routes/api/v1/plans/delete';

// Debug routes
import debugSetDueTodayRoute from './routes/api/v1/debug/set-due-today';
import debugResetInvoicesRoute from './routes/api/v1/debug/reset-invoices';

import prisma from './prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
// Subscription
app.use('/api/v1/subscription/add', addSubscriptionRoute);
app.use('/api/v1/subscription/modify', modifySubscriptionRoute);
app.use('/api/v1/subscription/delete', deleteSubscriptionRoute);

// Invoice
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/dashboard-stats', dashboardStatsRoutes);

// Customer
app.use('/api/v1/customers', customerListRoute); // GET only
app.use('/api/v1/customers/add', customerAddRoute);
app.use('/api/v1/customers/modify', customerModifyRoute);
app.use('/api/v1/customers/delete', customerDeleteRoute);

// Billing
app.use('/api/v1/billing/generate', billingGenerateRoute);
app.use('/api/v1/billing/history', billingHistoryRoute);

// Plan
app.use('/api/v1/plans', planListRoute); // GET only
app.use('/api/v1/plans/add', planAddRoute);
app.use('/api/v1/plans/modify', planModifyRoute);
app.use('/api/v1/plans/delete', planDeleteRoute);

// Debug
app.use('/api/v1/debug/set-due-today', debugSetDueTodayRoute);
app.use('/api/v1/debug/reset-invoices', debugResetInvoicesRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
