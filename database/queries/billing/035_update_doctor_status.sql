-- 035_update_doctor_status.sql
-- Status transition (active/inactive) instead of delete.
-- params: [ is_active, doctor_id ]

UPDATE `doctors`
SET `is_active` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `doctor_id` = ?;