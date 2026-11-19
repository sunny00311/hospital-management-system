-- 038_create_appointment.sql
-- Insert a single appointment. The application layer must run this inside a
-- transaction that has already performed a duration-aware conflict check
-- (see queries/appointments/003_check_conflict.sql).
-- params: [ patient_id, doctor_id, appointment_at, duration_minutes, reason, notes ]

INSERT INTO `appointments`
  (`patient_id`, `doctor_id`, `appointment_at`, `duration_minutes`, `reason`, `notes`)
VALUES (?, ?, ?, ?, ?, ?);