-- 045_update_user_password.sql
-- params: [ password_hash, user_id ]

UPDATE `users`
SET `password_hash` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `user_id` = ?;