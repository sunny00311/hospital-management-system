-- 003_doctor_appointments.sql
-- Appointment workload for a doctor.
-- params: [ doctor_id, from, to, limit, offset ]

SELECT
  a.`appointment_id`,
  a.`appointment_at`,
  a.`duration_minutes`,
  a.`status`,
  a.`reason`,
  p.`full_name` AS patient_name
FROM `appointments` AS a
JOIN `patients` AS p ON p.`patient_id` = a.`patient_id`
WHERE a.`doctor_id` = ?
  AND (? IS NULL OR a.`appointment_at` >= ?)
  AND (? IS NULL OR a.`appointment_at` < ?)
ORDER BY a.`appointment_at` ASC
LIMIT ? OFFSET ?;