-- 025_update_medical_record.sql
-- Update a medical record (application-layer policy gates edits).
-- params: [ diagnosis, treatment, notes, record_id ]

UPDATE `medical_records`
SET `diagnosis` = ?, `treatment` = ?, `notes` = ?,
    `updated_at` = CURRENT_TIMESTAMP
WHERE `record_id` = ?;