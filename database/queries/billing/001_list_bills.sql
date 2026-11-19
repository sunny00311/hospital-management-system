-- 001_list_bills.sql
-- Search and list bills with patient and status filters.
-- params: [ q, from, to, status, limit, offset ]
--   q       : partial patient name or bill number match. Empty/NULL disables.
--   from    : bill date start (inclusive), YYYY-MM-DD. Empty/NULL disables.
--   to      : bill date end (exclusive), YYYY-MM-DD. Empty/NULL disables.
--   status  : bill status filter. Empty/NULL disables.
--   limit   : page size (1..100).
--   offset  : row offset for pagination.

SELECT
  b.`bill_id`,
  b.`bill_number`,
  b.`patient_id`,
  p.`full_name` AS patient_name,
  b.`status`,
  b.`total_amount`,
  b.`paid_amount`,
  b.`outstanding_amount`,
  b.`bill_date`,
  b.`due_date`
FROM `bills` AS b
JOIN `patients` AS p ON p.`patient_id` = b.`patient_id`
WHERE (? IS NULL
       OR p.`full_name` LIKE CONCAT('%', ?, '%')
       OR b.`bill_number` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR b.`bill_date` >= ?)
  AND (? IS NULL OR b.`bill_date` < ?)
  AND (? IS NULL OR b.`status` = ?)
ORDER BY b.`bill_date` DESC, b.`bill_id` DESC
LIMIT ? OFFSET ?;