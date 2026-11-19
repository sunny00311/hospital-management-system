-- 037_update_patient.sql
-- params: [ full_name, gender, date_of_birth, phone, email, address, blood_group, patient_id ]

UPDATE `patients`
SET `full_name` = ?, `gender` = ?, `date_of_birth` = ?,
    `phone` = ?, `email` = ?, `address` = ?,
    `blood_group` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `patient_id` = ?;