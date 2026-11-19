-- 017_show_medicine.sql
-- Medicine catalogue details.
-- params: [ medicine_id ]

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
  m.`created_at`
FROM `medicines` AS m
WHERE m.`medicine_id` = ?;