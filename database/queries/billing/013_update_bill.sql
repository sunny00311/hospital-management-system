-- 013_update_bill.sql
-- Update a bill header. Application-layer policy must gate this (e.g. reject
-- after payment/finalization).
-- params: [ patient_id, appointment_id, bill_date, due_date, bill_id ]

UPDATE `bills`
SET `patient_id` = ?, `appointment_id` = ?, `bill_date` = ?, `due_date` = ?,
    `updated_at` = CURRENT_TIMESTAMP
WHERE `bill_id` = ?;