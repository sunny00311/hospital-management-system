-- 019_update_medicine.sql
-- Update a medicine's catalogue data.
-- params: [ medicine_name, generic_name, category, unit_price, reorder_level,
--           unit, is_active, medicine_id ]

UPDATE `medicines`
SET `medicine_name` = ?, `generic_name` = ?, `category` = ?,
    `unit_price` = ?, `reorder_level` = ?, `unit` = ?,
    `is_active` = ?, `updated_at` = CURRENT_TIMESTAMP
WHERE `medicine_id` = ?;