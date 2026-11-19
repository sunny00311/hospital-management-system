-- 003_v_inventory_alerts.sql
-- Execution order: 3 of 3 (views)
-- Reusable report view: medicine stock levels with low-stock flag.
-- A medicine is low-stock when stock_quantity <= reorder_level and active.

CREATE OR REPLACE VIEW `v_inventory_alerts` AS
SELECT
  m.`medicine_id`,
  m.`medicine_name`,
  m.`generic_name`,
  m.`category`,
  m.`unit_price`,
  m.`stock_quantity`,
  m.`reorder_level`,
  m.`unit`,
  m.`is_active`,
  CASE WHEN m.`stock_quantity` <= m.`reorder_level` THEN 1 ELSE 0 END AS low_stock,
  ROUND(m.`stock_quantity` * m.`unit_price`, 2) AS stock_value
FROM `medicines` AS m;
