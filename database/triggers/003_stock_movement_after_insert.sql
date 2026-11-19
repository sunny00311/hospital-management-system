-- 003_stock_movement_after_insert.sql
-- Execution order: 3 of 3 (triggers)
-- AFTER INSERT on stock_movements:
--   Recalculates and updates medicines.stock_quantity from the movement ledger.
--   This guarantees stock_quantity always reflects the sum of movements, so
--   the ledger is the source of truth and stock cannot drift from the ledger.
--
--   NOTE: balance_after in the movement row is informational. The trigger
--   recomputes the actual stock from the ledger to enforce consistency.

DROP TRIGGER IF EXISTS `trg_stock_movements_after_insert`;

DELIMITER //

CREATE TRIGGER `trg_stock_movements_after_insert`
AFTER INSERT ON `stock_movements`
FOR EACH ROW
BEGIN
  DECLARE v_balance INT DEFAULT 0;

  SELECT COALESCE(SUM(`quantity_delta`), 0) INTO v_balance
  FROM `stock_movements` WHERE `medicine_id` = NEW.`medicine_id`;

  UPDATE `medicines`
  SET `stock_quantity` = v_balance,
      `updated_at` = CURRENT_TIMESTAMP
  WHERE `medicine_id` = NEW.`medicine_id`;
END //

DELIMITER ;