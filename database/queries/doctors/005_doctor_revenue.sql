-- 005_doctor_revenue.sql
-- Revenue collected per doctor for a period (payments joined through bills).
-- params: [ doctor_id, from, to ]

SELECT
  d.`doctor_id`,
  d.`full_name` AS doctor_name,
  COUNT(pay.`payment_id`) AS payment_count,
  COALESCE(SUM(pay.`amount`), 0) AS collected_amount
FROM `doctors` AS d
LEFT JOIN `appointments` AS a ON a.`doctor_id` = d.`doctor_id`
LEFT JOIN `bills` AS b ON b.`appointment_id` = a.`appointment_id`
LEFT JOIN `payments` AS pay ON pay.`bill_id` = b.`bill_id`
WHERE (? IS NULL OR d.`doctor_id` = ?)
  AND (? IS NULL OR pay.`paid_at` >= ?)
  AND (? IS NULL OR pay.`paid_at` < ?)
GROUP BY d.`doctor_id`, d.`full_name`;