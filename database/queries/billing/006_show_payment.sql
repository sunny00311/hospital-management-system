-- 006_show_payment.sql
-- Payment details/receipt.
-- params: [ payment_id ]

SELECT
  py.`payment_id`,
  py.`payment_number`,
  py.`bill_id`,
  b.`bill_number`,
  b.`patient_id`,
  p.`full_name` AS patient_name,
  py.`amount`,
  py.`payment_method`,
  py.`reference`,
  py.`paid_at`,
  u.`full_name` AS paid_by_name
FROM `payments` AS py
JOIN `bills` AS b ON b.`bill_id` = py.`bill_id`
JOIN `patients` AS p ON p.`patient_id` = b.`patient_id`
LEFT JOIN `users` AS u ON u.`user_id` = py.`paid_by`
WHERE py.`payment_id` = ?;