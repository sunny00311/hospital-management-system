-- 027_show_medical_record_by_id.sql
-- Medical record details by record id (clinical data, restricted access).
-- params: [ record_id ]

SELECT
  mr.`record_id`,
  mr.`appointment_id`,
  mr.`diagnosis`,
  mr.`treatment`,
  mr.`notes`,
  mr.`recorded_at`,
  mr.`updated_at`,
  u.`full_name` AS recorded_by_name,
  d.`full_name` AS doctor_name
FROM `medical_records` AS mr
LEFT JOIN `users` AS u ON u.`user_id` = mr.`recorded_by`
JOIN `appointments` AS a ON a.`appointment_id` = mr.`appointment_id`
JOIN `doctors` AS d ON d.`doctor_id` = a.`doctor_id`
WHERE mr.`record_id` = ?;