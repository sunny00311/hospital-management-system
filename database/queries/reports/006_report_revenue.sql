-- 006_report_revenue.sql
-- Monthly/period revenue report.
-- params: [ from, to, payment_method, limit, offset ]
--   from / to        : payment date range (half-open). Empty/NULL disables.
--   payment_method   : filter to a payment method. Empty/NULL disables.

SELECT
  DATE_FORMAT(py.`paid_at`, '%Y-%m') AS revenue_month,
  COUNT(*) AS payment_count,
  SUM(py.`amount`) AS collected_amount
FROM `payments` AS py
WHERE (? IS NULL OR py.`paid_at` >= ?)
  AND (? IS NULL OR py.`paid_at` < ?)
  AND (? IS NULL OR py.`payment_method` = ?)
GROUP BY DATE_FORMAT(py.`paid_at`, '%Y-%m')
ORDER BY revenue_month ASC
LIMIT ? OFFSET ?;