-- 004_report_doctors.sql
-- Doctor workload report.
-- params: [ from, to, department_id, q, limit, offset ]
--   from / to      : appointment date range (half-open). Empty/NULL disables.
--   department_id  : filter to a department. Empty/NULL disables.
--   q              : partial doctor name or specialization. Empty/NULL disables.

SELECT
  d.`doctor_id`,
  d.`full_name` AS doctor_name,
  d.`specialization`,
  dept.`department_name`,
  COUNT(a.`appointment_id`) AS total_appointments,
  SUM(CASE WHEN a.`status` = 'Completed'  THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN a.`status` = 'Cancelled'  THEN 1 ELSE 0 END) AS cancelled_count,
  SUM(CASE WHEN a.`status` = 'No-show'    THEN 1 ELSE 0 END) AS no_show_count,
  SUM(CASE WHEN a.`status` = 'Scheduled'  THEN 1 ELSE 0 END) AS scheduled_count
FROM `doctors` AS d
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
LEFT JOIN `appointments` AS a ON a.`doctor_id` = d.`doctor_id`
  AND (? IS NULL OR a.`appointment_at` >= ?)
  AND (? IS NULL OR a.`appointment_at` < ?)
WHERE (? IS NULL OR d.`department_id` = ?)
  AND (? IS NULL
       OR d.`full_name` LIKE CONCAT('%', ?, '%')
       OR d.`specialization` LIKE CONCAT('%', ?, '%'))
GROUP BY d.`doctor_id`, d.`full_name`, d.`specialization`, dept.`department_name`
ORDER BY total_appointments DESC, d.`full_name` ASC
LIMIT ? OFFSET ?;