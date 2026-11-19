-- 005_report_departments.sql
-- Department summary report.
-- params: [ from, to, limit, offset ]
--   from / to : appointment date range (half-open). Empty/NULL disables.

SELECT
  dept.`department_id`,
  dept.`department_name`,
  COUNT(DISTINCT d.`doctor_id`) AS doctor_count,
  COUNT(a.`appointment_id`) AS appointment_count
FROM `departments` AS dept
LEFT JOIN `doctors` AS d ON d.`department_id` = dept.`department_id`
LEFT JOIN `appointments` AS a ON a.`doctor_id` = d.`doctor_id`
  AND (? IS NULL OR a.`appointment_at` >= ?)
  AND (? IS NULL OR a.`appointment_at` < ?)
GROUP BY dept.`department_id`, dept.`department_name`
ORDER BY dept.`department_name` ASC
LIMIT ? OFFSET ?;