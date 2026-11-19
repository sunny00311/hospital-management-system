-- 004_patient_bills.sql
-- Billing history for a patient (no clinical notes).
-- params: [ patient_id, limit, offset ]

SELECT
  b.`bill_id`,
  b.`bill_number`,
  b.`status`,
  b.`total_amount`,
  b.`paid_amount`,
  b.`outstanding_amount`,
  b.`bill_date`,
  b.`due_date`
FROM `bills` AS b
WHERE b.`patient_id` = ?
ORDER BY b.`bill_date` DESC
LIMIT ? OFFSET ?;