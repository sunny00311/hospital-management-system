'use strict';

/**
 * src/middleware/authorize.js
 *
 * Role-based authorization. Permissions are explicit server-side checks, not
 * role-name comparisons scattered across controllers. The permission matrix
 * below is the single source of truth.
 *
 * Roles: admin, receptionist, doctor, pharmacist, accountant.
 *
 * A capability is granted only when the matrix says yes. Unknown roles are
 * denied by default.
 */

const ROLES = ['admin', 'receptionist', 'doctor', 'pharmacist', 'accountant'];

// permission -> set of roles that may perform it.
const PERMISSIONS = {
  dashboard:            ROLES,
  patients_read:        ['admin', 'receptionist'],
  patients_write:       ['admin', 'receptionist'],
  departments_read:     ROLES,
  departments_write:    ['admin'],
  doctors_read:         ROLES,
  doctors_write:        ['admin', 'pharmacist'],
  appointments_read:    ROLES,
  appointments_write:   ['admin', 'receptionist', 'doctor'],
  clinical_read:        ['admin', 'doctor'],
  clinical_write:       ['admin', 'doctor'],
  prescription_write:   ['admin', 'doctor'],
  prescription_read:    ['admin', 'doctor', 'pharmacist'],
  inventory_read:       ROLES,
  inventory_write:      ['admin', 'pharmacist'],
  billing_read:         ['admin', 'accountant'],
  billing_write:        ['admin', 'accountant'],
  payment_write:        ['admin', 'accountant'],
  financial_reports:    ['admin', 'accountant'],
  clinical_reports:     ['admin', 'doctor'],
  report_export:        ROLES,
};

function hasPermission(role, permission) {
  if (!ROLES.includes(role)) return false;
  const allowed = PERMISSIONS[permission];
  return Array.isArray(allowed) && allowed.includes(role);
}

function authorize(permission) {
  return (req, res, next) => {
    const user = req.session && req.session.user;
    if (!user) return res.redirect('/login');
    if (hasPermission(user.role, permission)) return next();
    return res.status(403).render('errors/403', {
      title: 'Access denied',
      message: 'You do not have permission to access this resource.',
    });
  };
}

module.exports = { authorize, hasPermission, PERMISSIONS, ROLES };