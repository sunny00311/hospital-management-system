-- 001_validate_payment.sql
-- Execution order: 1 of 2 (triggers)
-- BEFORE INSERT on payments:
--   1. Reject zero/negative payments.
--   2. Reject payments that would exceed the bill's outstanding balance
--      (prevents overpayment at the row level).
--   3. Reject payments against cancelled bills.
--   4. Reject duplicate payment numbers.
--   5. Reject invalid payment methods.
--   6. Reject payments for non-existent bills.
--
-- This is a defense-in-depth guard. The application layer must still lock the
-- bill row and recalculate the balance inside a transaction, because triggers
-- run per-statement and cannot coordinate with concurrent transactions.

DROP TRIGGER IF EXISTS `trg_payments_before_insert`;

DELIMITER //

CREATE TRIGGER `trg_payments_before_insert`
BEFORE INSERT ON `payments`
FOR EACH ROW
BEGIN
  DECLARE v_outstanding DECIMAL(12,2) DEFAULT 0;
  DECLARE v_status VARCHAR(30) DEFAULT '';
  DECLARE v_exists INT DEFAULT 0;

  -- Reject zero or negative amounts.
  IF NEW.`amount` <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payment amount must be greater than zero.';
  END IF;

  -- Reject invalid payment methods.
  IF NEW.`payment_method` NOT IN ('Cash','Card','Insurance','UPI','Bank Transfer') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid payment method.';
  END IF;

  -- Reject duplicate payment numbers.
  SELECT COUNT(*) INTO v_exists
  FROM `payments` WHERE `payment_number` = NEW.`payment_number`;
  IF v_exists > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payment number already exists.';
  END IF;

  -- Validate bill exists and fetch its status/outstanding balance.
  SELECT COUNT(*) INTO v_exists
  FROM `bills` WHERE `bill_id` = NEW.`bill_id`;
  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Bill not found.';
  END IF;

  SELECT `status`, `outstanding_amount`
  INTO v_status, v_outstanding
  FROM `bills` WHERE `bill_id` = NEW.`bill_id`;

  IF v_status = 'Cancelled' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot record payment against a cancelled bill.';
  END IF;

  -- Reject overpayment against the current outstanding balance.
  IF NEW.`amount` > v_outstanding THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Payment exceeds the outstanding bill balance.';
  END IF;
END //

DELIMITER ;