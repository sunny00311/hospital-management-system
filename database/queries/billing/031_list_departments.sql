-- 031_list_departments.sql
-- List departments with doctor counts.
-- params: [ limit, offset ]

SELECT
  d.`department_id`,
  d.`department_name`,
  d.`description`,
  d.`is_active`,
  COUNT(doc.`doctor_id`) AS doctor_count
FROM `departments` AS d
LEFT JOIN `doctors` AS doc ON doc.`department_id` = d.`department_id`
GROUP BY d.`department_id`, d.`department_name`, d.`description`, d.`is_active`
ORDER BY d.`department_name` ASC
LIMIT ? OFFSET ?;