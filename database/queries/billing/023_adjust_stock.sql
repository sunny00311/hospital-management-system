-- 023_adjust_stock.sql
-- Record a stock movement (purchase/dispense/adjustment/return).
-- The trigger on stock_movements recomputes medicines.stock_quantity from the
-- ledger, so this is the single point of truth for inventory.
-- params: [ medicine_id, movement_type, quantity_delta, reference_type,
--           reference_id, note, moved_by ]

INSERT INTO `stock_movements`
  (`medicine_id`, `movement_type`, `quantity_delta`, `reference_type`,
   `reference_id`, `note`, `moved_by`)
VALUES (?, ?, ?, ?, ?, ?, ?);