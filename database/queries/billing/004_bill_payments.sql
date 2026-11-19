-- 004_bill_payments.sql
-- Payment history for a bill.
-- params: [ bill_id ]

SELECT
  py.`payment_id`,
  py.`payment_number`,
  py.`amount`,
  py.`payment_method`,
  py.`reference`,
  py.`paid_at`,
  u.`full_name` AS paid_by_name
FROM `payments` AS py
LEFT JOIN `users` AS u ON u.`user_id` = py.`paid_by`
WHERE py.`bill_id` = ?
ORDER BY py.`paid_at` ASC;