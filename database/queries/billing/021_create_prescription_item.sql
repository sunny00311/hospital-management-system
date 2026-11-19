-- 021_create_prescription_item.sql
-- Insert a prescription line item (M:N resolution).
-- params: [ prescription_id, medicine_id, dosage, frequency, duration_days,
--           quantity, instructions ]

INSERT INTO `prescription_items`
  (`prescription_id`, `medicine_id`, `dosage`, `frequency`, `duration_days`,
   `quantity`, `instructions`)
VALUES (?, ?, ?, ?, ?, ?, ?);