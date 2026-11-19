-- 002_v_doctor_workload.sql
-- Execution order: 2 of 3 (views)
-- Reusable report view: appointment workload per doctor.
-- Counts total, completed, cancelled, and no-show appointments.
-- Left-joins departments so inactive doctors still appear.

CREATE OR REPLACE VIEW `v_doctor_workload` AS
SELECT
  d.`doctor_id`,
  d.`full_name` AS doctor_name,
  d.`specialization`,
  dept.`department_name`,
  dept.`department_id`,
  d.`consultation_fee`,
  d.`is_active`,
  COUNT(a.`appointment_id`) AS total_appointments,
  SUM(CASE WHEN a.`status` = 'Scheduled'    THEN 1 ELSE 0 END) AS scheduled_count,
  SUM(CASE WHEN a.`status` = 'Completed'   THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN a.`status` = 'Cancelled'   THEN 1 ELSE 0 END) AS cancelled_count,
  SUM(CASE WHEN a.`status` = 'No-show'     THEN 1 ELSE 0 END) AS no_show_count
FROM `doctors` AS d
JOIN `departments` AS dept ON dept.`department_id` = d.`department_id`
LEFT JOIN `appointments` AS a ON a.`doctor_id` = d.`doctor_id`
GROUP BY d.`doctor_id`, d.`full_name`, d.`specialization`,
         dept.`department_name`, dept.`department_id`,
         d.`consultation_fee`, d.`is_active`;
