-- 018_create_medicine.sql
-- Add a medicine to the catalogue.
-- params: [ medicine_name, generic_name, category, unit_price, stock_quantity,
--           reorder_level, unit, is_active ]

INSERT INTO `medicines`
  (`medicine_name`, `generic_name`, `category`, `unit_price`, `stock_quantity`,
   `reorder_level`, `unit`, `is_active`)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);