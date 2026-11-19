-- 005_today_appointments.sql
-- Today's appointments with patient and doctor.
-- params: [ today_start, today_end ]

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
WHERE a.`appointment_at` >= ?
  AND a.`appointment_at` < ?
ORDER BY a.`appointment_at` ASC;