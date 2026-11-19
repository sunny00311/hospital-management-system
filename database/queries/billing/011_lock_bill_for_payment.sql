-- 011_lock_bill_for_payment.sql
-- Lock a bill row for the duration of a payment transaction
-- (SELECT ... FOR UPDATE). Used inside a transaction before validating balance
-- and inserting a payment, to prevent concurrent overpayment.
-- params: [ bill_id ]

SELECT `bill_id`, `status`, `total_amount`, `paid_amount`, `outstanding_amount`
FROM `bills`
WHERE `bill_id` = ?
FOR UPDATE;