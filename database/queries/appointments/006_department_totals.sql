-- 006_department_totals.sql
-- Department-wise appointment counts for a date range.
-- params: [ from, to ]

SELECT
  dept.`department_id`,
  dept.`department_name`,
  COUNT(a.`appointment_id`) AS appointment_count
FROM `departments` AS dept
LEFT JOIN `doctors` AS d ON d.`department_id` = dept.`department_id`
LEFT JOIN `appointments` AS a ON a.`doctor_id` = d.`doctor_id`
  AND a.`appointment_at` >= ?
  AND a.`appointment_at` < ?
GROUP BY dept.`department_id`, dept.`department_name`
ORDER BY dept.`department_name` ASC;