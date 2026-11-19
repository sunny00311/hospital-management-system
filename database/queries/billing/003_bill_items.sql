-- 003_bill_items.sql
-- Line items for a bill (historical unit-price snapshots).
-- params: [ bill_id ]

SELECT
  bi.`bill_item_id`,
  bi.`bill_id`,
  bi.`description`,
  bi.`quantity`,
  bi.`unit_price`,
  bi.`line_total`,
  bi.`medicine_id`
FROM `bill_items` AS bi
WHERE bi.`bill_id` = ?
ORDER BY bi.`bill_item_id` ASC;