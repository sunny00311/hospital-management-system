-- 043_create_user.sql
-- params: [ username, password_hash, role, full_name, doctor_id ]

INSERT INTO `users`
  (`username`, `password_hash`, `role`, `full_name`, `doctor_id`)
VALUES (?, ?, ?, ?, ?);