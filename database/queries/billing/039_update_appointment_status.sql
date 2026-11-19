-- 039_update_appointment_status.sql
-- Status transition for an appointment (Scheduled/Completed/Cancelled/No-show).
-- params: [ status, appointment_id ]

UPDATE `appointments`
SET `status` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `appointment_id` = ?;