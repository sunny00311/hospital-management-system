-- 001_list_patients.sql
-- Search and list patients.
--
-- mysql2 uses positional ? placeholders. Each ? is bound separately, so a
-- filter value that appears multiple times must be passed multiple times.
-- The application layer passes values in this exact order:
--   params: [ q, q, q, q, from, from, to, to, limit, offset ]
--
--   q       : partial name, phone, or email match (case-insensitive). Empty/NULL
--             disables the filter.
--   from    : registration date start (inclusive), YYYY-MM-DD. Empty/NULL disables.
--   to      : registration date end (exclusive), YYYY-MM-DD. Empty/NULL disables.
--   limit   : page size (1..100).
--   offset  : row offset for pagination.
--
-- Returns patient summary rows (no clinical notes).

SELECT
  p.`patient_id`,
  p.`full_name`,
  p.`gender`,
  p.`date_of_birth`,
  p.`phone`,
  p.`email`,
  p.`blood_group`,
  p.`created_at`
FROM `patients` AS p
WHERE (? IS NULL
       OR p.`full_name` LIKE CONCAT('%', ?, '%')
       OR p.`phone` LIKE CONCAT('%', ?, '%')
       OR p.`email` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR p.`created_at` >= ?)
  AND (? IS NULL OR p.`created_at` < ?)
ORDER BY p.`full_name` ASC
LIMIT ? OFFSET ?;