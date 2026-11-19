-- 046_show_stock_movements.sql
-- Stock movement ledger for a medicine.
-- params: [ medicine_id, limit, offset ]

SELECT
  sm.`movement_id`,
  sm.`medicine_id`,
  m.`medicine_name`,
  sm.`movement_type`,
  sm.`quantity_delta`,
  sm.`balance_after`,
  sm.`reference_type`,
  sm.`reference_id`,
  sm.`note`,
  sm.`moved_at`,
  u.`full_name` AS moved_by_name
FROM `stock_movements` AS sm
JOIN `medicines` AS m ON m.`medicine_id` = sm.`medicine_id`
LEFT JOIN `users` AS u ON u.`user_id` = sm.`moved_by`
WHERE sm.`medicine_id` = ?
ORDER BY sm.`moved_at` DESC
LIMIT ? OFFSET ?;