-- 009_create_payment.sql
-- Insert a payment row. The application layer must run this inside a transaction
-- that locks the bill row, validates the balance, and updates the bill status.
-- params: [ payment_number, bill_id, amount, payment_method, reference, paid_by ]

INSERT INTO `payments`
  (`payment_number`, `bill_id`, `amount`, `payment_method`, `reference`, `paid_by`)
VALUES (?, ?, ?, ?, ?, ?);