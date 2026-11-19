-- 034_update_doctor.sql
-- params: [ department_id, full_name, specialization, phone, email,
--            consultation_fee, is_active, doctor_id ]

UPDATE `doctors`
SET `department_id` = ?, `full_name` = ?, `specialization` = ?,
    `phone` = ?, `email` = ?, `consultation_fee` = ?,
    `is_active` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `doctor_id` = ?;