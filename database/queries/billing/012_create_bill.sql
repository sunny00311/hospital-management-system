-- 012_create_bill.sql
-- Insert a bill header. The application layer passes a pre-generated bill_number.
-- params: [ bill_number, patient_id, appointment_id, status, total_amount,
--           paid_amount, outstanding_amount, bill_date, due_date, created_by ]

INSERT INTO `bills`
  (`bill_number`, `patient_id`, `appointment_id`, `status`, `total_amount`,
   `paid_amount`, `outstanding_amount`, `bill_date`, `due_date`, `created_by`)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);