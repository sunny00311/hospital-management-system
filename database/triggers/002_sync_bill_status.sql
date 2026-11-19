-- 002_sync_bill_status.sql
-- Execution order: 2 of 2 (triggers)
-- AFTER INSERT on payments:
--   Recalculates the bill's paid_amount, outstanding_amount, and status from
--   trusted payment rows. This keeps the bill header in sync with payments
--   without trusting client-submitted totals.
--
-- Status transitions: Pending -> Partially Paid -> Paid. Overdue is set by the
-- application layer when due_date passes and a balance remains.
-- Overdue is never set by this trigger to avoid overriding explicit payment
-- processing.

DROP TRIGGER IF EXISTS `trg_payments_after_insert`;

DELIMITER //

CREATE TRIGGER `trg_payments_after_insert`
AFTER INSERT ON `payments`
FOR EACH ROW
BEGIN
  DECLARE v_total DECIMAL(12,2) DEFAULT 0;
  DECLARE v_new_status VARCHAR(30) DEFAULT '';

  SELECT COALESCE(SUM(`amount`), 0) INTO v_total
  FROM `payments` WHERE `bill_id` = NEW.`bill_id`;

  UPDATE `bills`
  SET `paid_amount` = v_total,
      `outstanding_amount` = `total_amount` - v_total,
      `updated_at` = CURRENT_TIMESTAMP
  WHERE `bill_id` = NEW.`bill_id`;

  -- Derive status from trusted payment totals.
  SELECT `status` INTO v_new_status
  FROM `bills` WHERE `bill_id` = NEW.`bill_id`;

  IF v_new_status <> 'Overdue' AND v_new_status <> 'Cancelled' THEN
    UPDATE `bills`
    SET `status` = CASE
      WHEN v_total >= `total_amount` THEN 'Paid'
      WHEN v_total > 0 THEN 'Partially Paid'
      ELSE 'Pending'
    END,
    `updated_at` = CURRENT_TIMESTAMP
    WHERE `bill_id` = NEW.`bill_id`;
  END IF;
END //

DELIMITER ;