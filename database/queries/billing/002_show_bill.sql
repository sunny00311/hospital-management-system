-- 002_show_bill.sql
-- Bill details with line items and payment history.
-- params: [ bill_id ]

SELECT
  b.`bill_id`,
  b.`bill_number`,
  b.`patient_id`,
  p.`full_name` AS patient_name,
  b.`appointment_id`,
  b.`status`,
  b.`total_amount`,
  b.`paid_amount`,
  b.`outstanding_amount`,
  b.`bill_date`,
  b.`due_date`,
  b.`created_at`
FROM `bills` AS b
JOIN `patients` AS p ON p.`patient_id` = b.`patient_id`
WHERE b.`bill_id` = ?;