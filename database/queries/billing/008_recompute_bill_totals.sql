-- 008_recompute_bill_totals.sql
-- Recompute a bill's total_amount from trusted bill_items and update the header.
-- params: [ bill_id ]

UPDATE `bills`
SET `total_amount` = COALESCE((
  SELECT SUM(`quantity` * `unit_price`) FROM `bill_items` WHERE `bill_id` = ?
), 0),
    `outstanding_amount` = `total_amount` - `paid_amount`,
    `updated_at` = CURRENT_TIMESTAMP
WHERE `bill_id` = ?;