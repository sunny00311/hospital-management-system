-- 003_constraints_and_indexes.sql
-- Execution order: 3 of 3 (schema)
-- Additional constraints and indexes not declared inline.
-- Inline constraints are declared in 002_create_tables.sql; this file adds
-- supplementary indexes for common filter columns and any deferred constraints.

USE `hospital_management`;

-- Doctors: index for status filtering combined with department.
CREATE INDEX `idx_doctors_department_status`
  ON `doctors` (`department_id`, `is_active`);

-- Appointments: compound index for date-range + status filters.
CREATE INDEX `idx_appointments_at_status`
  ON `appointments` (`appointment_at`, `status`);

-- Appointments: compound index for doctor + date-range conflict checks.
CREATE INDEX `idx_appointments_doctor_at`
  ON `appointments` (`doctor_id`, `appointment_at`);

-- Bills: index for date-range and patient filters.
CREATE INDEX `idx_bills_patient_status`
  ON `bills` (`patient_id`, `status`);

-- Payments: index for method filtering.
CREATE INDEX `idx_payments_method`
  ON `payments` (`payment_method`);

-- Prescription items: compound index for report joins.
CREATE INDEX `idx_prescription_items_medicine_qty`
  ON `prescription_items` (`medicine_id`, `quantity`);

-- Users: index for active-by-role lookups.
CREATE INDEX `idx_users_active_role`
  ON `users` (`is_active`, `role`);
