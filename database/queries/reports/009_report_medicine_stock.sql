-- 009_report_medicine_stock.sql
-- Medicine stock and low-stock alerts.
-- params: [ q, category, limit, offset ]
--   q       : partial medicine name or generic name. Empty/NULL disables.
--   category: filter to a category. Empty/NULL disables.

SELECT
  m.`medicine_id`,
  m.`medicine_name`,
  m.`generic_name`,
  m.`category`,
  m.`unit_price`,
  m.`stock_quantity`,
  m.`reorder_level`,
  m.`unit`,
  CASE WHEN m.`stock_quantity` <= m.`reorder_level` THEN 1 ELSE 0 END AS low_stock
FROM `medicines` AS m
WHERE (? IS NULL
       OR m.`medicine_name` LIKE CONCAT('%', ?, '%')
       OR m.`generic_name` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR m.`category` = ?)
ORDER BY low_stock DESC, m.`stock_quantity` ASC, m.`medicine_name` ASC
LIMIT ? OFFSET ?;