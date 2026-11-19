-- 022_dispense_prescription.sql
-- Mark a prescription as dispensed and record the dispensing row.
-- params: [ prescription_id, dispensed_by ]

INSERT INTO `prescription_dispensing`
  (`prescription_id`, `dispensed_by`)
VALUES (?, ?)
ON DUPLICATE KEY UPDATE `dispensed_by` = VALUES(`dispensed_by`),
                        `dispensed_at` = CURRENT_TIMESTAMP;

UPDATE `prescriptions`
SET `status` = 'Dispensed', `updated_at` = CURRENT_TIMESTAMP
WHERE `prescription_id` = ?;