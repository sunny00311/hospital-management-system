-- 003_check_conflict.sql
-- Duration-aware overlap check for a doctor's schedule.
-- Returns 1 if a conflicting appointment exists, 0 otherwise.
-- params: [ doctor_id, start, end ]
--   start: proposed appointment start (DATETIME)
--   end:   proposed appointment end = start + duration (DATETIME)
-- Overlap condition: existing.start < new.end AND existing.end > new.start.
-- Only non-cancelled appointments are considered.

SELECT COUNT(*) AS conflict_count
FROM `appointments` AS a
WHERE a.`doctor_id` = ?
  AND a.`status` <> 'Cancelled'
  AND a.`appointment_at` < ?
  AND DATE_ADD(a.`appointment_at`, INTERVAL a.`duration_minutes` MINUTE) > ?;