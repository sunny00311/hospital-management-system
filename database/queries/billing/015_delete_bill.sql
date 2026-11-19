-- 015_delete_bill.sql
-- Cancel a bill by transitioning its status to 'Cancelled'. No hard delete:
-- financial history is preserved.
-- params: [ bill_id ]

UPDATE `bills`
SET `status` = 'Cancelled', `updated_at` = CURRENT_TIMESTAMP
WHERE `bill_id` = ?;