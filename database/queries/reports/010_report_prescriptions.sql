-- 010_report_prescriptions.sql
-- Prescription summary (authorized clinical users only).
-- params: [ from, to, patient_id, doctor_id, limit, offset ]

SELECT
  pr.`prescription_id`,
  pr.`prescribed_at`,
  pr.`status`,
  p.`full_name` AS patient_name,
  d.`full_name` AS doctor_name,
  pi.`medicine_name`,
  pi.`dosage`,
  pi.`frequency`,
  pi.`quantity`
FROM `prescriptions` AS pr
JOIN `patients` AS p ON p.`patient_id` = pr.`patient_id`
JOIN `doctors` AS d ON d.`doctor_id` = pr.`doctor_id`
LEFT JOIN (
  SELECT pi.`prescription_id`, m.`medicine_name`, pi.`dosage`,
         pi.`frequency`, pi.`quantity`
  FROM `prescription_items` AS pi
  JOIN `medicines` AS m ON m.`medicine_id` = pi.`medicine_id`
) AS pi ON pi.`prescription_id` = pr.`prescription_id`
WHERE (? IS NULL OR pr.`prescribed_at` >= ?)
  AND (? IS NULL OR pr.`prescribed_at` < ?)
  AND (? IS NULL OR pr.`patient_id` = ?)
  AND (? IS NULL OR pr.`doctor_id` = ?)
ORDER BY pr.`prescribed_at` DESC
LIMIT ? OFFSET ?;