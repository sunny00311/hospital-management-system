-- 003_patient_appointments.sql
-- Appointment history for a patient (no clinical notes).
-- params: [ patient_id, limit, offset ]

SELECT
  a.`appointment_id`,
  a.`appointment_at`,
  a.`duration_minutes`,
  a.`status`,
  a.`reason`,
  d.`full_name` AS doctor_name,
  dept.`department_name`
FROM `appointments` AS a
JOIN `doctors` AS d ON d.`doctor_id` = a.`doctor_id`
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
WHERE a.`patient_id` = ?
ORDER BY a.`appointment_at` DESC
LIMIT ? OFFSET ?;