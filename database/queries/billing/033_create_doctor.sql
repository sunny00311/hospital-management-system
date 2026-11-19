-- 033_create_doctor.sql
-- params: [ department_id, full_name, specialization, phone, email,
--            consultation_fee, is_active ]

INSERT INTO `doctors`
  (`department_id`, `full_name`, `specialization`, `phone`, `email`,
   `consultation_fee`, `is_active`)
VALUES (?, ?, ?, ?, ?, ?, ?);