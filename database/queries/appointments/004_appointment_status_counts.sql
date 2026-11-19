-- 004_appointment_status_counts.sql
-- Appointment counts by status for a date range.
-- params: [ from, to ]

SELECT
  `status`,
  COUNT(*) AS count
FROM `appointments`
WHERE `appointment_at` >= ?
  AND `appointment_at` < ?
GROUP BY `status`
ORDER BY `status`;