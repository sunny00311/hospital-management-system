-- 029_show_prescription_items.sql
-- Line items for a prescription.
-- params: [ prescription_id ]

SELECT
  pi.`prescription_item_id`,
  pi.`medicine_id`,
  pi.`dosage`,
  pi.`frequency`,
  pi.`duration_days`,
  pi.`quantity`,
  pi.`instructions`,
  m.`medicine_name`,
  m.`unit`
FROM `prescription_items` AS pi
JOIN `medicines` AS m ON m.`medicine_id` = pi.`medicine_id`
WHERE pi.`prescription_id` = ?
ORDER BY pi.`prescription_item_id` ASC;