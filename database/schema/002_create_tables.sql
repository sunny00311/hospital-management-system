-- 002_create_tables.sql
-- Execution order: 2 of 3 (schema)
-- Creates all tables in dependency order. Uses InnoDB, utf8mb4, FK/PK/UNIQUE,
-- NOT NULL and CHECK constraints, DECIMAL for money, and appropriate indexes.

USE `hospital_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- users: authentication accounts mapped to roles for role-based access control
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id`      INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `username`     VARCHAR(50)      NOT NULL,
  `password_hash` VARCHAR(255)    NOT NULL,
  `role`         ENUM('admin','receptionist','doctor','pharmacist','accountant') NOT NULL,
  `full_name`    VARCHAR(120)     NOT NULL,
  `doctor_id`    INT UNSIGNED     NULL,
  `is_active`    TINYINT(1)       NOT NULL DEFAULT 1,
  `last_login_at` DATETIME        NULL,
  `created_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- departments: department master (1:M doctors)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `department_id`   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(120)     NOT NULL,
  `description`     VARCHAR(500)     NULL,
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uq_departments_name` (`department_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- doctors: doctor master, belongs to one department
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `doctor_id`       INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `department_id`   INT UNSIGNED     NOT NULL,
  `full_name`       VARCHAR(120)     NOT NULL,
  `specialization`  VARCHAR(150)     NOT NULL,
  `phone`           VARCHAR(20)      NULL,
  `email`           VARCHAR(120)     NULL,
  `consultation_fee` DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`doctor_id`),
  KEY `idx_doctors_department` (`department_id`),
  KEY `idx_doctors_active` (`is_active`),
  CONSTRAINT `fk_doctors_department`
    FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_doctors_fee` CHECK (`consultation_fee` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- patients: patient master (1:M appointments and bills)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `patient_id`     INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `full_name`      VARCHAR(120)     NOT NULL,
  `gender`         ENUM('Male','Female','Other') NOT NULL,
  `date_of_birth`  DATE             NOT NULL,
  `phone`          VARCHAR(20)      NULL,
  `email`          VARCHAR(120)     NULL,
  `address`        VARCHAR(300)     NULL,
  `blood_group`    ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown') NOT NULL DEFAULT 'Unknown',
  `created_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `uq_patients_phone` (`phone`),
  UNIQUE KEY `uq_patients_email` (`email`),
  KEY `idx_patients_name` (`full_name`),
  CONSTRAINT `chk_patients_phone_format` CHECK (`phone` IS NULL OR `phone` REGEXP '^[0-9+\\-() ]{7,20}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- appointments: patient-doctor booking (belongs to patient and doctor)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `appointment_id`   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `patient_id`       INT UNSIGNED    NOT NULL,
  `doctor_id`        INT UNSIGNED    NOT NULL,
  `appointment_at`   DATETIME        NOT NULL,
  `duration_minutes` INT UNSIGNED    NOT NULL DEFAULT 30,
  `status`           ENUM('Scheduled','Completed','Cancelled','No-show') NOT NULL DEFAULT 'Scheduled',
  `reason`           VARCHAR(500)    NULL,
  `notes`            VARCHAR(1000)   NULL,
  `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `idx_appointments_patient` (`patient_id`),
  KEY `idx_appointments_doctor` (`doctor_id`),
  KEY `idx_appointments_at` (`appointment_at`),
  KEY `idx_appointments_status` (`status`),
  CONSTRAINT `fk_appointments_patient`
    FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_appointments_doctor`
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_appointments_duration` CHECK (`duration_minutes` > 0 AND `duration_minutes` <= 240)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- medical_records: visit diagnosis/treatment, optional 1:1 with appointment
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE `medical_records` (
  `record_id`      INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `appointment_id` INT UNSIGNED     NOT NULL,
  `diagnosis`      TEXT             NOT NULL,
  `treatment`      TEXT             NULL,
  `notes`          TEXT             NULL,
  `recorded_by`    INT UNSIGNED     NULL,
  `recorded_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `uq_medical_records_appointment` (`appointment_id`),
  KEY `idx_medical_records_recorded_by` (`recorded_by`),
  CONSTRAINT `fk_medical_records_appointment`
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_medical_records_user`
    FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- prescriptions: prescription header (belongs to a medical record)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `prescription_id` INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `record_id`       INT UNSIGNED     NOT NULL,
  `doctor_id`       INT UNSIGNED     NOT NULL,
  `patient_id`      INT UNSIGNED     NOT NULL,
  `prescribed_at`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status`          ENUM('Active','Dispensed','Cancelled') NOT NULL DEFAULT 'Active',
  `notes`           TEXT             NULL,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `idx_prescriptions_record` (`record_id`),
  KEY `idx_prescriptions_doctor` (`doctor_id`),
  KEY `idx_prescriptions_patient` (`patient_id`),
  CONSTRAINT `fk_prescriptions_record`
    FOREIGN KEY (`record_id`) REFERENCES `medical_records` (`record_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_prescriptions_doctor`
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_prescriptions_patient`
    FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- medicines: medicine catalogue and stock (used by prescription items)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `medicines`;
CREATE TABLE `medicines` (
  `medicine_id`     INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `medicine_name`   VARCHAR(150)     NOT NULL,
  `generic_name`    VARCHAR(150)     NULL,
  `category`        VARCHAR(100)     NULL,
  `unit_price`      DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  `stock_quantity`  INT UNSIGNED     NOT NULL DEFAULT 0,
  `reorder_level`   INT UNSIGNED     NOT NULL DEFAULT 0,
  `unit`            VARCHAR(30)      NOT NULL DEFAULT 'tablet',
  `is_active`       TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`),
  UNIQUE KEY `uq_medicines_name` (`medicine_name`),
  KEY `idx_medicines_category` (`category`),
  CONSTRAINT `chk_medicines_price` CHECK (`unit_price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- prescription_items: prescription medicine lines (resolves M:N)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `prescription_items`;
CREATE TABLE `prescription_items` (
  `prescription_item_id` INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `prescription_id`      INT UNSIGNED   NOT NULL,
  `medicine_id`          INT UNSIGNED   NOT NULL,
  `dosage`               VARCHAR(100)   NOT NULL,
  `frequency`            VARCHAR(100)   NOT NULL,
  `duration_days`        INT UNSIGNED   NOT NULL DEFAULT 1,
  `quantity`             INT UNSIGNED   NOT NULL DEFAULT 1,
  `instructions`         VARCHAR(300)   NULL,
  PRIMARY KEY (`prescription_item_id`),
  KEY `idx_prescription_items_prescription` (`prescription_id`),
  KEY `idx_prescription_items_medicine` (`medicine_id`),
  CONSTRAINT `fk_prescription_items_prescription`
    FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_prescription_items_medicine`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_prescription_items_qty` CHECK (`quantity` > 0),
  CONSTRAINT `chk_prescription_items_duration` CHECK (`duration_days` > 0 AND `duration_days` <= 365)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- bills: bill header (belongs to patient; may reference one appointment)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `bill_id`        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `bill_number`    VARCHAR(30)      NOT NULL,
  `patient_id`     INT UNSIGNED     NOT NULL,
  `appointment_id` INT UNSIGNED     NULL,
  `status`         ENUM('Draft','Pending','Partially Paid','Paid','Overdue','Cancelled') NOT NULL DEFAULT 'Pending',
  `total_amount`   DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `paid_amount`    DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `outstanding_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `bill_date`      DATE             NOT NULL,
  `due_date`       DATE             NULL,
  `created_by`     INT UNSIGNED     NULL,
  `created_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bill_id`),
  UNIQUE KEY `uq_bills_number` (`bill_number`),
  UNIQUE KEY `uq_bills_appointment` (`appointment_id`),
  KEY `idx_bills_patient` (`patient_id`),
  KEY `idx_bills_status` (`status`),
  KEY `idx_bills_date` (`bill_date`),
  CONSTRAINT `fk_bills_patient`
    FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_bills_appointment`
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_bills_user`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `chk_bills_amounts` CHECK (`total_amount` >= 0 AND `paid_amount` >= 0 AND `outstanding_amount` >= 0),
  CONSTRAINT `chk_bills_balance` CHECK (`paid_amount` <= `total_amount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- bill_items: bill line items (historical unit-price snapshots)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `bill_items`;
CREATE TABLE `bill_items` (
  `bill_item_id`  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `bill_id`       INT UNSIGNED     NOT NULL,
  `description`   VARCHAR(255)     NOT NULL,
  `quantity`      INT UNSIGNED     NOT NULL DEFAULT 1,
  `unit_price`    DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `line_total`    DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  `medicine_id`   INT UNSIGNED     NULL,
  PRIMARY KEY (`bill_item_id`),
  KEY `idx_bill_items_bill` (`bill_id`),
  KEY `idx_bill_items_medicine` (`medicine_id`),
  CONSTRAINT `fk_bill_items_bill`
    FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_bill_items_medicine`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `chk_bill_items_qty` CHECK (`quantity` > 0),
  CONSTRAINT `chk_bill_items_price` CHECK (`unit_price` >= 0),
  CONSTRAINT `chk_bill_items_total` CHECK (`line_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- payments: payment transactions (bill has 0:M payments)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `payment_id`     INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `payment_number` VARCHAR(30)      NOT NULL,
  `bill_id`        INT UNSIGNED     NOT NULL,
  `amount`         DECIMAL(12,2)    NOT NULL,
  `payment_method` ENUM('Cash','Card','Insurance','UPI','Bank Transfer') NOT NULL,
  `reference`      VARCHAR(80)      NULL,
  `paid_by`        INT UNSIGNED     NULL,
  `paid_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `uq_payments_number` (`payment_number`),
  KEY `idx_payments_bill` (`bill_id`),
  KEY `idx_payments_date` (`paid_at`),
  CONSTRAINT `fk_payments_bill`
    FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_payments_user`
    FOREIGN KEY (`paid_by`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `chk_payments_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- stock_movements: inventory ledger for dispensing and adjustments
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `movement_id`    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `medicine_id`    INT UNSIGNED     NOT NULL,
  `movement_type`  ENUM('Purchase','Dispense','Adjustment','Return') NOT NULL,
  `quantity_delta` INT              NOT NULL,
  `balance_after`  INT UNSIGNED     NOT NULL,
  `reference_type` VARCHAR(30)      NULL,
  `reference_id`   INT UNSIGNED     NULL,
  `note`           VARCHAR(255)     NULL,
  `moved_by`       INT UNSIGNED     NULL,
  `moved_at`       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`movement_id`),
  KEY `idx_stock_movements_medicine` (`medicine_id`),
  KEY `idx_stock_movements_type` (`movement_type`),
  CONSTRAINT `fk_stock_movements_medicine`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_stock_movements_user`
    FOREIGN KEY (`moved_by`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `chk_stock_movements_delta` CHECK (`quantity_delta` <> 0),
  CONSTRAINT `chk_stock_movements_balance` CHECK (`balance_after` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- prescriptions_dispensing: links dispensing to stock deduction for audit
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS `prescription_dispensing`;
CREATE TABLE `prescription_dispensing` (
  `dispensing_id`   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `prescription_id` INT UNSIGNED     NOT NULL,
  `dispensed_by`    INT UNSIGNED     NULL,
  `dispensed_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dispensing_id`),
  UNIQUE KEY `uq_dispensing_prescription` (`prescription_id`),
  CONSTRAINT `fk_dispensing_prescription`
    FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_dispensing_user`
    FOREIGN KEY (`dispensed_by`) REFERENCES `users` (`user_id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
