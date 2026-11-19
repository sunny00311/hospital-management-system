-- 041_update_user_last_login.sql
-- params: [ user_id ]

UPDATE `users`
SET `last_login_at` = CURRENT_TIMESTAMP
WHERE `user_id` = ?;