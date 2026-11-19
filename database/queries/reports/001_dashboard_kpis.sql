-- 001_dashboard_kpis.sql
-- Dashboard KPI cards. All values come from MySQL; nothing is hardcoded.
-- params: [ today_start, today_end, period_start, period_end ]
--   today_start / today_end : half-open range for "today" appointments.
--   period_start / period_end: half-open range for revenue collection.

SELECT
  (SELECT COUNT(*) FROM `patients`) AS total_patients,
  (SELECT COUNT(*) FROM `appointments`
   WHERE `appointment_at` >= ? AND `appointment_at` < ?) AS appointments_today,
  (SELECT COUNT(*) FROM `appointments`
   WHERE `status` = 'Completed'
     AND `appointment_at` >= ? AND `appointment_at` < ?) AS completed_today,
  (SELECT COUNT(*) FROM `appointments`
   WHERE `status` = 'Scheduled'
     AND `appointment_at` >= ? AND `appointment_at` < ?) AS awaiting_action,
  (SELECT COALESCE(SUM(`amount`), 0) FROM `payments`
   WHERE `paid_at` >= ? AND `paid_at` < ?) AS revenue_collected,
  (SELECT COALESCE(SUM(`outstanding_amount`), 0) FROM `bills`
   WHERE `status` <> 'Paid' AND `status` <> 'Cancelled') AS outstanding_balance;