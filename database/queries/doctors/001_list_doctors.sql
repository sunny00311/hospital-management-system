-- 001_list_doctors.sql
-- Search and list doctors.
-- params: [ q, department_id, status, limit, offset ]
--   q           : partial name or specialization match. Empty/NULL disables.
--   department_id: filter to a department. Empty/NULL disables.
--   status      : 'active' or 'inactive'. Empty/NULL disables.
--   limit       : page size (1..100).
--   offset      : row offset for pagination.

SELECT
  d.`doctor_id`,
  d.`full_name`,
  d.`specialization`,
  d.`department_id`,
  dept.`department_name`,
  d.`consultation_fee`,
  d.`is_active`,
  d.`phone`,
  d.`email`
FROM `doctors` AS d
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
WHERE (? IS NULL
       OR d.`full_name` LIKE CONCAT('%', ?, '%')
       OR d.`specialization` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR d.`department_id` = ?)
  AND (? IS NULL
       OR (? = 'active' AND d.`is_active` = 1)
       OR (? = 'inactive' AND d.`is_active` = 0))
ORDER BY d.`full_name` ASC
LIMIT ? OFFSET ?;