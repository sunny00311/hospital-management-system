-- 005_patient_medical_records.sql
-- Clinical history for a patient (restricted access only; diagnosis/treatment).
-- params: [ patient_id, limit, offset ]

SELECT
  mr.`record_id`,
  mr.`appointment_id`,
  mr.`diagnosis`,
  mr.`treatment`,
  mr.`notes`,
  mr.`recorded_at`,
  d.`full_name` AS doctor_name
FROM `medical_records` AS mr
JOIN `appointments` AS a ON a.`appointment_id` = mr.`appointment_id`
JOIN `doctors` AS d ON d.`doctor_id` = a.`doctor_id`
WHERE a.`patient_id` = ?
ORDER BY mr.`recorded_at` DESC
LIMIT ? OFFSET ?;