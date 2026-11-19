-- 020_create_prescription.sql
-- Insert a prescription header.
-- params: [ record_id, doctor_id, patient_id, status, notes ]

INSERT INTO `prescriptions`
  (`record_id`, `doctor_id`, `patient_id`, `status`, `notes`)
VALUES (?, ?, ?, ?, ?);