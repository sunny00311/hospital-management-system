-- 002_report_patients.sql
-- Patient register report.
-- params: [ q, from, to, limit, offset ]
--   q       : partial name, phone, or email match. Empty/NULL disables.
--   from    : registration date start (inclusive), YYYY-MM-DD. Empty/NULL disables.
--   to      : registration date end (exclusive), YYYY-MM-DD. Empty/NULL disables.
--   limit   : page size (1..100).
--   offset  : row offset for pagination.

SELECT
  p.`patient_id`,
  p.`full_name`,
  p.`phone`,
  p.`email`,
  p.`date_of_birth`,
  p.`created_at` AS registration_date
FROM `patients` AS p
WHERE (? IS NULL
       OR p.`full_name` LIKE CONCAT('%', ?, '%')
       OR p.`phone` LIKE CONCAT('%', ?, '%')
       OR p.`email` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR p.`created_at` >= ?)
  AND (? IS NULL OR p.`created_at` < ?)
ORDER BY p.`patient_id` ASC
LIMIT ? OFFSET ?;