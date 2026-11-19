-- 016_list_medicines.sql
-- Search and list medicines (catalogue and stock).
-- params: [ q, category, limit, offset ]
--   q       : partial medicine name or generic name match. Empty/NULL disables.
--   category: filter to a category. Empty/NULL disables.
--   limit   : page size (1..100).
--   offset  : row offset for pagination.

SELECT
  m.`medicine_id`,
  m.`medicine_name`,
  m.`generic_name`,
  m.`category`,
  m.`unit_price`,
  m.`stock_quantity`,
  m.`reorder_level`,
  m.`unit`,
  m.`is_active`
FROM `medicines` AS m
WHERE (? IS NULL
       OR m.`medicine_name` LIKE CONCAT('%', ?, '%')
       OR m.`generic_name` LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR m.`category` = ?)
ORDER BY m.`medicine_name` ASC
LIMIT ? OFFSET ?;