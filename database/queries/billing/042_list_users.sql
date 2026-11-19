-- 042_list_users.sql
-- List users (admin-only).
-- params: [ limit, offset ]

SELECT
  u.`user_id`,
  u.`username`,
  u.`role`,
  u.`full_name`,
  u.`doctor_id`,
  u.`is_active`,
  u.`last_login_at`,
  u.`created_at`
FROM `users` AS u
ORDER BY u.`full_name` ASC
LIMIT ? OFFSET ?;