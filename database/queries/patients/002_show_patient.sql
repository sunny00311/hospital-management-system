-- 002_show_patient.sql
-- Patient profile with appointment and billing history (clinical notes excluded).
-- params: [ patient_id ]

SELECT
  p.`patient_id`,
  p.`full_name`,
  p.`gender`,
  p.`date_of_birth`,
  p.`phone`,
  p.`email`,
  p.`address`,
  p.`blood_group`,
  p.`created_at`
FROM `patients` AS p
WHERE p.`patient_id` = ?;