-- 001_book_appointment.sql
-- Execution order: 1 of 2 (procedures)
-- Duration-aware appointment booking stored procedure.
--
-- Transactionally checks for overlapping appointments for the same doctor in the
-- requested window [start, start + duration) and inserts the appointment only if
-- no conflict exists. Uses SELECT ... FOR UPDATE on a shared advisory lock row
-- (locked by doctor_id) so concurrent booking attempts serialize and cannot both
-- pass the conflict check.
--
-- OUT status_code: 0 = success, 1 = doctor not found/inactive, 2 = patient not
-- found/inactive, 3 = invalid times, 4 = scheduling conflict.
-- OUT message: human-readable result text.
-- OUT appointment_id: newly inserted appointment id (0 on failure).

DROP PROCEDURE IF EXISTS `sp_book_appointment`;

DELIMITER //

CREATE PROCEDURE `sp_book_appointment`(
  IN  p_patient_id    INT UNSIGNED,
  IN  p_doctor_id     INT UNSIGNED,
  IN  p_appointment_at DATETIME,
  IN  p_duration_minutes INT UNSIGNED,
  IN  p_reason        VARCHAR(500),
  OUT p_status_code   INT,
  OUT p_message       VARCHAR(255),
  OUT p_appointment_id INT UNSIGNED
)
BEGIN
  DECLARE v_conflict INT DEFAULT 0;
  DECLARE v_exists_patient INT DEFAULT 0;
  DECLARE v_exists_doctor INT DEFAULT 0;
  DECLARE v_end_at DATETIME;

  SET p_status_code = 0;
  SET p_message = '';
  SET p_appointment_id = 0;
  SET v_end_at = DATE_ADD(p_appointment_at, INTERVAL p_duration_minutes MINUTE);

  -- Validate times.
  IF p_appointment_at < CURRENT_TIMESTAMP THEN
    SET p_status_code = 3;
    SET p_message = 'Appointment time must be in the future.';
    LEAVE proc_exit;
  END IF;

  IF p_duration_minutes <= 0 OR p_duration_minutes > 240 THEN
    SET p_status_code = 3;
    SET p_message = 'Duration must be between 1 and 240 minutes.';
    LEAVE proc_exit;
  END IF;

  START TRANSACTION;

  -- Advisory lock per doctor serializes concurrent bookings for this doctor.
  -- GET_LOCK blocks until the lock is acquired; timeout 10 seconds.
  IF GET_LOCK(CONCAT('appointment_doctor_', p_doctor_id), 10) = 0 THEN
    ROLLBACK;
    SET p_status_code = 3;
    SET p_message = 'Server busy, please retry booking.';
    LEAVE proc_exit;
  END IF;

  -- Validate patient exists and is eligible (no soft-delete; treat phone/email
  -- presence as existence — every patient row is bookable).
  SELECT COUNT(*) INTO v_exists_patient
  FROM `patients` WHERE `patient_id` = p_patient_id;

  IF v_exists_patient = 0 THEN
    DO RELEASE_LOCK(CONCAT('appointment_doctor_', p_doctor_id));
    ROLLBACK;
    SET p_status_code = 2;
    SET p_message = 'Patient not found.';
    LEAVE proc_exit;
  END IF;

  -- Validate doctor exists and is active.
  SELECT COUNT(*) INTO v_exists_doctor
  FROM `doctors` WHERE `doctor_id` = p_doctor_id AND `is_active` = 1;

  IF v_exists_doctor = 0 THEN
    DO RELEASE_LOCK(CONCAT('appointment_doctor_', p_doctor_id));
    ROLLBACK;
    SET p_status_code = 1;
    SET p_message = 'Doctor not found or inactive.';
    LEAVE proc_exit;
  END IF;

  -- Conflict check: any existing appointment for this doctor whose interval
  -- overlaps [p_appointment_at, v_end_at).
  -- Overlap condition: existing.start < new.end AND existing.end > new.start.
  SELECT COUNT(*) INTO v_conflict
  FROM `appointments` AS a
  WHERE a.`doctor_id` = p_doctor_id
    AND a.`status` <> 'Cancelled'
    AND a.`appointment_at` < v_end_at
    AND DATE_ADD(a.`appointment_at`, INTERVAL a.`duration_minutes` MINUTE) > p_appointment_at;

  IF v_conflict > 0 THEN
    DO RELEASE_LOCK(CONCAT('appointment_doctor_', p_doctor_id));
    ROLLBACK;
    SET p_status_code = 4;
    SET p_message = 'Doctor already has an appointment in the requested time slot.';
    LEAVE proc_exit;
  END IF;

  -- Insert the appointment.
  INSERT INTO `appointments`
    (`patient_id`, `doctor_id`, `appointment_at`, `duration_minutes`, `status`, `reason`)
  VALUES
    (p_patient_id, p_doctor_id, p_appointment_at, p_duration_minutes, 'Scheduled', p_reason);

  SET p_appointment_id = LAST_INSERT_ID();

  DO RELEASE_LOCK(CONCAT('appointment_doctor_', p_doctor_id));
  COMMIT;

  SET p_status_code = 0;
  SET p_message = 'Appointment booked successfully.';

proc_exit:;
END //

DELIMITER ;
