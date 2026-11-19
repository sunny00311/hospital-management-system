-- 030_show_prescription_dispensing.sql
-- Dispensing record for a prescription.
-- params: [ prescription_id ]

SELECT
  pd.`dispensing_id`,
  pd.`prescription_id`,
  pd.`dispensed_at`,
  u.`full_name` AS dispensed_by_name
FROM `prescription_dispensing` AS pd
LEFT JOIN `users` AS u ON u.`user_id` = pd.`dispensed_by`
WHERE pd.`prescription_id` = ?;