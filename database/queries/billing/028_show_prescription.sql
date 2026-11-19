-- 028_show_prescription.sql
-- Prescription header and line items.
-- params: [ prescription_id ]

SELECT
  pr.`prescription_id`,
  pr.`record_id`,
  pr.`doctor_id`,
  pr.`patient_id`,
  pr.`prescribed_at`,
  pr.`status`,
  pr.`notes`,
  d.`full_name` AS doctor_name,
  p.`full_name` AS patient_name
FROM `prescriptions` AS pr
JOIN `doctors` AS d ON d.`doctor_id` = pr.`doctor_id`
JOIN `patients` AS p ON p.`patient_id` = pr.`patient_id`
WHERE pr.`prescription_id` = ?;