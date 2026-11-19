-- 007_create_bill_items.sql
-- Insert a bill line item (historical unit-price snapshot).
-- params: [ bill_id, description, quantity, unit_price, medicine_id ]

INSERT INTO `bill_items`
  (`bill_id`, `description`, `quantity`, `unit_price`, `medicine_id`)
VALUES (?, ?, ?, ?, ?);