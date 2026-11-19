-- 002_show_appointment.sql
-- Appointment details (no clinical notes).
-- params: [ appointment_id ]

SELECT
  a.`appointment_id`,
  a.`patient_id`,
  a.`doctor_id`,
  a.`appointment_at`,
  a.`duration_minutes`,
  a.`status`,
  a.`reason`,
  a.`notes`,
  a.`created_at`,
  p.`full_name` AS patient_name,
  d.`full_name` AS doctor_name,
  dept.`department_name`
FROM `appointments` AS a
JOIN `patients` AS p ON p.`patient_id` = a.`patient_id`
JOIN `doctors` AS d ON d.`doctor_id` = a.`doctor_id`
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
WHERE a.`appointment_id` = ?;