-- 002_show_doctor.sql
-- Doctor details.
-- params: [ doctor_id ]

SELECT
  d.`doctor_id`,
  d.`department_id`,
  d.`full_name`,
  d.`specialization`,
  d.`phone`,
  d.`email`,
  d.`consultation_fee`,
  d.`is_active`,
  d.`created_at`
FROM `doctors` AS d
WHERE d.`doctor_id` = ?;