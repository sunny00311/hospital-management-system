-- 004_doctor_prescriptions.sql
-- Prescription summary for a doctor (no clinical notes).
-- params: [ doctor_id, from, to, limit, offset ]

SELECT
  pr.`prescription_id`,
  pr.`prescribed_at`,
  pr.`status`,
  p.`full_name` AS patient_name,
  mr.`record_id`
FROM `prescriptions` AS pr
JOIN `patients` AS p ON p.`patient_id` = pr.`patient_id`
LEFT JOIN `medical_records` AS mr ON mr.`record_id` = pr.`record_id`
WHERE pr.`doctor_id` = ?
  AND (? IS NULL OR pr.`prescribed_at` >= ?)
  AND (? IS NULL OR pr.`prescribed_at` < ?)
ORDER BY pr.`prescribed_at` DESC
LIMIT ? OFFSET ?;