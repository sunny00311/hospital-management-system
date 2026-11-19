-- 003_report_appointments.sql
-- Daily/period appointment report.
-- params: [ from, to, patient_id, doctor_id, department_id, status, limit, offset ]

SELECT
  a.`appointment_id`,
  a.`appointment_at`,
  a.`duration_minutes`,
  a.`status`,
  a.`reason`,
  p.`full_name` AS patient_name,
  d.`full_name` AS doctor_name,
  dept.`department_name`
FROM `appointments` AS a
JOIN `patients` AS p ON p.`patient_id` = a.`patient_id`
JOIN `doctors` AS d ON d.`doctor_id` = a.`doctor_id`
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
WHERE (? IS NULL OR a.`appointment_at` >= ?)
  AND (? IS NULL OR a.`appointment_at` < ?)
  AND (? IS NULL OR a.`patient_id` = ?)
  AND (? IS NULL OR a.`doctor_id` = ?)
  AND (? IS NULL OR d.`department_id` = ?)
  AND (? IS NULL OR a.`status` = ?)
ORDER BY a.`appointment_at` ASC
LIMIT ? OFFSET ?;