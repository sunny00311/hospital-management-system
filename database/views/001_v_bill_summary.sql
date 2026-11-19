-- 001_v_bill_summary.sql
-- Execution order: 1 of 3 (views)
-- Reusable report view: bill totals, payments made, and outstanding balance per bill.
-- Historical bill totals come from bill_items (snapshot prices), not the medicines
-- catalogue. Derived totals match the bills.header paid/outstanding columns.
-- Used by dashboard KPIs, billing pages, and revenue/outstanding-bills reports.

CREATE OR REPLACE VIEW `v_bill_summary` AS
SELECT
  b.`bill_id`,
  b.`bill_number`,
  b.`patient_id`,
  p.`full_name` AS patient_name,
  b.`appointment_id`,
  b.`status`,
  b.`bill_date`,
  b.`due_date`,
  b.`total_amount`,
  b.`paid_amount`,
  b.`outstanding_amount`,
  COALESCE(pay.total_paid, 0) AS payments_total,
  (b.`total_amount` - COALESCE(pay.total_paid, 0)) AS computed_outstanding,
  CASE
    WHEN b.`total_amount` = 0 THEN 'Paid'
    WHEN COALESCE(pay.total_paid, 0) >= b.`total_amount` THEN 'Paid'
    WHEN COALESCE(pay.total_paid, 0) > 0 THEN 'Partially Paid'
    ELSE 'Pending'
  END AS derived_status
FROM `bills` AS b
JOIN `patients` AS p ON p.`patient_id` = b.`patient_id`
LEFT JOIN (
  SELECT `bill_id`, SUM(`amount`) AS total_paid
  FROM `payments`
  GROUP BY `bill_id`
) AS pay ON pay.`bill_id` = b.`bill_id`;
