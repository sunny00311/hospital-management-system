-- 040_show_user_by_username.sql
-- Fetch a user's credentials and role for login.
-- params: [ username ]

SELECT
  u.`user_id`,
  u.`username`,
  u.`password_hash`,
  u.`role`,
  u.`full_name`,
  u.`doctor_id`,
  u.`is_active`
FROM `users` AS u
WHERE u.`username` = ?;