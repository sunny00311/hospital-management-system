-- 024_create_medical_record.sql
-- Insert a medical record for an appointment (1:0..1 relationship enforced by
-- the UNIQUE appointment_id column).
-- params: [ appointment_id, diagnosis, treatment, notes, recorded_by ]

INSERT INTO `medical_records`
  (`appointment_id`, `diagnosis`, `treatment`, `notes`, `recorded_by`)
VALUES (?, ?, ?, ?, ?);