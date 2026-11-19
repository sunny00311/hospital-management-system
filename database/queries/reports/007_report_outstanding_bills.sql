-- 007_report_outstanding_bills.sql
-- Outstanding balances report.
-- params: [ q, q, q, status, limit, offset ]
--   q       : partial patient name or bill number match. Empty/NULL disables.
--   status  : filter to a bill status. Empty/NULL disables.

SELECT
  b.`bill_id`,
  b.`bill_number`,
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
  AND (? IS NULL OR b.`status` = ?)
  AND b.`outstanding_amount` > 0
ORDER BY b.`outstanding_amount` DESC, b.`bill_date` ASC
LIMIT ? OFFSET ?;