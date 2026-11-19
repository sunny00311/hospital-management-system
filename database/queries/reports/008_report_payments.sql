-- 008_report_payments.sql
-- Payment history report.
-- params: [ from, to, payment_method, patient_id, limit, offset ]

SELECT
  py.`payment_id`,
  py.`payment_number`,
  py.`bill_id`,
  b.`bill_number`,
  p.`full_name` AS patient_name,
  py.`amount`,
  py.`payment_method`,
  py.`reference`,
  py.`paid_at`
FROM `payments` AS py
JOIN `bills` AS b ON b.`bill_id` = py.`bill_id`
JOIN `patients` AS p ON p.`patient_id` = b.`patient_id`
WHERE (? IS NULL OR py.`paid_at` >= ?)
  AND (? IS NULL OR py.`paid_at` < ?)
  AND (? IS NULL OR py.`payment_method` = ?)
  AND (? IS NULL OR b.`patient_id` = ?)
ORDER BY py.`paid_at` DESC
LIMIT ? OFFSET ?;