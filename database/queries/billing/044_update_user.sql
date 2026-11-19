-- 044_update_user.sql
-- params: [ role, full_name, doctor_id, is_active, user_id ]

UPDATE `users`
SET `role` = ?, `full_name` = ?, `doctor_id` = ?,
    `is_active` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `user_id` = ?;