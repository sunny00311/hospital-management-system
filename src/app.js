'use strict';

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const pool = require('./config/db');
const securityHeaders = require('./middleware/security-headers');
const { csrfToken, csrf } = require('./middleware/csrf');
const { flash: flashMiddleware, setFlash } = require('./middleware/flash');
const rateLimit = require('./middleware/rate-limit');
const errorHandler = require('./middleware/error-handler');
const requireAuth = require('./middleware/require-auth');
const guestOnly = require('./middleware/guest-only');
const { authorize } = require('./middleware/authorize');
const { validateId, validateFilters } = require('./middleware/validate-request');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const patientRoutes = require('./routes/patients.routes');
const departmentRoutes = require('./routes/departments.routes');
const doctorRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const medicalRecordRoutes = require('./routes/medical-records.routes');
const prescriptionRoutes = require('./routes/prescriptions.routes');
const medicineRoutes = require('./routes/medicines.routes');
const billRoutes = require('./routes/bills.routes');
const paymentRoutes = require('./routes/payments.routes');
const reportRoutes = require('./routes/reports.routes');

const app = express();

// Trust proxy for secure cookies behind load balancer
app.set('trust proxy', 1);

// Session store - use MemoryStore for dev if MySQL unavailable
let sessionStore;
if (process.env.NODE_ENV === 'production') {
  sessionStore = new MySQLStore(
    {
      clearExpired: true,
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 24 * 60 * 60 * 1000,
    },
    pool
  );
} else {
  // MemoryStore for development (no DB dependency)
  const MemoryStore = require('memorystore')(session);
  sessionStore = new MemoryStore({
    checkPeriod: 86400000 // 24 hours
  });
}

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.SESSION_SECURE === '1',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'hms.sid',
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Security headers (must be before routes)
securityHeaders(app);

// CSRF token generation (before auth to protect login)
app.use(csrfToken);

// Flash messages
app.use(flashMiddleware);

// Make user and CSRF token available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.csrfToken = req.session.csrfToken || '';
  next();
});

// Rate limiters
app.post('/login', rateLimit.loginLimiter);

// Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/patients', patientRoutes);
app.use('/departments', departmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/', medicalRecordRoutes);
app.use('/', prescriptionRoutes);
app.use('/medicines', medicineRoutes);
app.use('/bills', billRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);

// Root redirect
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Not found',
    message: 'The requested page was not found.',
  });
});

// Centralized error handler (last)
app.use(errorHandler);

module.exports = app;