-- 010_update_bill_status.sql
-- Update a bill's status (application-layer controlled transitions only).
-- params: [ status, bill_id ]

UPDATE `bills`
SET `status` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `bill_id` = ?;