-- 002_demo_data.sql
-- Execution order: 2 of 3 (seeds)
-- Synthetic demo data. All names, contact details, and clinical content are
-- fabricated for development and documentation only. No real patient data.
--
-- Uses explicit IDs so that relationships stay deterministic and re-runnable.
-- Appointments, bills, and payments are backdated relative to CURRENT_DATE so
-- the dashboard and reports show meaningful values without waiting.

USE `hospital_management`;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `prescription_dispensing`;
DELETE FROM `prescription_items`;
DELETE FROM `prescriptions`;
DELETE FROM `medical_records`;
DELETE FROM `payments`;
DELETE FROM `bill_items`;
DELETE FROM `bills`;
DELETE FROM `appointments`;
DELETE FROM `stock_movements`;
DELETE FROM `patients`;
DELETE FROM `doctors`;
DELETE FROM `medicines` WHERE `medicine_id` > 1000;
DELETE FROM `users` WHERE `username` <> 'admin';
SET FOREIGN_KEY_CHECKS = 1;

-- Doctors ----------------------------------------------------------------------
-- Explicit IDs 1..12, each tied to a department (1..10) from reference data.
INSERT INTO `doctors` (`doctor_id`, `department_id`, `full_name`, `specialization`, `phone`, `email`, `consultation_fee`, `is_active`) VALUES
  (1,  1, 'Dr. Aarav Sharma',   'General Physician',   '9800000001', 'aarav.sharma@hms.example',   500.00, 1),
  (2,  2, 'Dr. Meera Patel',    'Pediatrician',        '9800000002', 'meera.patel@hms.example',    600.00, 1),
  (3,  3, 'Dr. Rohan Verma',    'Cardiologist',        '9800000003', 'rohan.verma@hms.example',   1200.00, 1),
  (4,  4, 'Dr. Ananya Singh',   'Orthopedic Surgeon',  '9800000004', 'ananya.singh@hms.example',  1000.00, 1),
  (5,  5, 'Dr. Kabir Nair',     'Neurologist',         '9800000005', 'kabir.nair@hms.example',    1100.00, 1),
  (6,  6, 'Dr. Ishita Rao',     'Dermatologist',       '9800000006', 'ishita.rao@hms.example',     700.00, 1),
  (7,  7, 'Dr. Vikram Iyer',    'ENT Specialist',      '9800000007', 'vikram.iyer@hms.example',    650.00, 1),
  (8,  8, 'Dr. Nisha Gupta',    'Ophthalmologist',     '9800000008', 'nisha.gupta@hms.example',    700.00, 1),
  (9,  9, 'Dr. Arjun Mehta',    'Gynecologist',        '9800000009', 'arjun.mehta@hms.example',    800.00, 1),
  (10, 1, 'Dr. Priya Joshi',    'Internal Medicine',   '9800000010', 'priya.joshi@hms.example',    550.00, 1),
  (11, 10, 'Dr. Sameer Khan',   'Emergency Physician','9800000011', 'sameer.khan@hms.example',    900.00, 1),
  (12, 3, 'Dr. Tanvi Desai',    'Cardiac Surgeon',     '9800000012', 'tanvi.desai@hms.example',   1500.00, 0);

-- Users tied to doctors (clinical accounts) ------------------------------------
-- Passwords are bcrypt("change-me") — local dev only.
INSERT INTO `users` (`username`, `password_hash`, `role`, `full_name`, `doctor_id`, `is_active`) VALUES
  ('reception', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'receptionist', 'Reception Desk', NULL, 1),
  ('dr.sharma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor', 'Dr. Aarav Sharma', 1, 1),
  ('pharmacist','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'pharmacist', 'Pharmacy Desk', NULL, 1),
  ('accounts',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'accountant', 'Billing Desk', NULL, 1);

-- Patients ----------------------------------------------------------------------
INSERT INTO `patients` (`patient_id`, `full_name`, `gender`, `date_of_birth`, `phone`, `email`, `address`, `blood_group`) VALUES
  (1,  'Ramesh Kumar',     'Male',   '1985-03-14', '9810000001', 'ramesh.kumar@example.com',   '12 MG Road, Bengaluru',            'B+'),
  (2,  'Sunita Devi',      'Female', '1990-07-22', '9810000002', 'sunita.devi@example.com',    '45 Park Street, Kolkata',          'O+'),
  (3,  'Abdul Rahman',     'Male',   '1978-11-02', '9810000003', 'abdul.rahman@example.com',   '8 Gandhi Nagar, Delhi',            'A+'),
  (4,  'Lakshmi Narayan',  'Male',   '2001-01-19', '9810000004', 'lakshmi.n@example.com',      '77 Anna Nagar, Chennai',           'AB+'),
  (5,  'Priyanka Singh',   'Female', '1995-09-30', '9810000005', 'priyanka.singh@example.com', '23 Civil Lines, Jaipur',           'O-'),
  (6,  'Manoj Verma',      'Male',   '1969-05-08', '9810000006', 'manoj.verma@example.com',    '56 Gomti Nagar, Lucknow',          'B-'),
  (7,  'Fatima Begum',     'Female', '1988-12-25', '9810000007', 'fatima.begum@example.com',   '9 Banjara Hills, Hyderabad',       'A-'),
  (8,  'Deepak Joshi',     'Male',   '1992-04-17', '9810000008', 'deepak.joshi@example.com',   '34 FC Road, Pune',                 'O+'),
  (9,  'Anita Deshmukh',   'Female', '1983-08-11', '9810000009', 'anita.deshmukh@example.com', '18 Salt Lake, Kolkata',            'AB-'),
  (10, 'Vijay Nair',       'Male',   '1975-02-28', '9810000010', 'vijay.nair@example.com',     '62 Marine Drive, Kochi',           'A+'),
  (11, 'Kavita Rao',       'Female', '1998-06-05', '9810000011', 'kavita.rao@example.com',     '5 Jubilee Hills, Hyderabad',       'B+'),
  (12, 'Rohit Sharma',     'Male',   '2015-10-12', '9810000012', 'rohit.sharma@example.com',   '21 Sector 14, Noida',              'O+'),
  (13, 'Sneha Reddy',      'Female', '2019-01-30', '9810000013', 'sneha.reddy@example.com',    '44 Whitefield, Bengaluru',         'A+'),
  (14, 'Amit Patel',       'Male',   '1980-09-09', '9810000014', 'amit.patel@example.com',     '13 C G Road, Ahmedabad',           'B+'),
  (15, 'Geeta Kumari',     'Female', '1993-03-03', '9810000015', 'geeta.kumari@example.com',   '27 MG Marg, Patna',                'O+'),
  (16, 'Suresh Iyer',      'Male',   '1972-07-18', '9810000016', 'suresh.iyer@example.com',    '88 T Nagar, Chennai',              'A-'),
  (17, 'Neha Kapoor',      'Female', '2003-11-27', '9810000017', 'neha.kapoor@example.com',    '31 Hauz Khas, Delhi',              'B-'),
  (18, 'Rajesh Chauhan',   'Male',   '1966-01-15', '9810000018', 'rajesh.chauhan@example.com', '6 Civil Hospital Rd, Shimla',      'O+'),
  (19, 'Pooja Agarwal',    'Female', '1987-05-21', '9810000019', 'pooja.agarwal@example.com',  '90 Alambagh, Lucknow',             'AB+'),
  (20, 'Harish Kumar',     'Male',   '1991-08-08', '9810000020', 'harish.kumar@example.com',   '14 Gomti Nagar, Lucknow',          'O+');

-- Appointments ------------------------------------------------------------------
-- Backdated and forward-looking rows across the last 60 days and next 7 days.
INSERT INTO `appointments` (`appointment_id`, `patient_id`, `doctor_id`, `appointment_at`, `duration_minutes`, `status`, `reason`) VALUES
  (1,  1,  1,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 DAY) + INTERVAL 9 HOUR, 30, 'Completed', 'Fever and body ache'),
  (2,  2,  9,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 44 DAY) + INTERVAL 11 HOUR, 30, 'Completed', 'Prenatal checkup'),
  (3,  3,  3,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 42 DAY) + INTERVAL 10 HOUR, 30, 'Completed', 'Chest pain follow-up'),
  (4,  4,  4,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 40 DAY) + INTERVAL 14 HOUR, 30, 'No-show',   'Knee pain'),
  (5,  5,  6,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 38 DAY) + INTERVAL 15 HOUR, 30, 'Completed', 'Skin rash'),
  (6,  6,  1,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 35 DAY) + INTERVAL 9 HOUR, 30, 'Completed', 'Diabetes review'),
  (7,  7,  7,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 33 DAY) + INTERVAL 12 HOUR, 30, 'Cancelled', 'Ear pain'),
  (8,  8,  8,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY) + INTERVAL 16 HOUR, 30, 'Completed', 'Vision check'),
  (9,  9,  5,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY) + INTERVAL 10 HOUR, 30, 'Completed', 'Migraine'),
  (10, 10, 3,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY) + INTERVAL 11 HOUR, 30, 'Completed', 'Hypertension review'),
  (11, 11, 9,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY) + INTERVAL 14 HOUR, 30, 'Completed', 'Menstrual pain'),
  (12, 12, 2,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY) + INTERVAL 9 HOUR, 30, 'Completed', 'Vaccination'),
  (13, 13, 2,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY) + INTERVAL 10 HOUR, 30, 'Completed', 'Fever and cough'),
  (14, 14, 6,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY) + INTERVAL 13 HOUR, 30, 'Completed', 'Acne treatment'),
  (15, 15, 1,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY) + INTERVAL 11 HOUR, 30, 'Completed', 'General consultation'),
  (16, 16, 4,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY) + INTERVAL 15 HOUR, 30, 'Completed', 'Shoulder pain'),
  (17, 17, 5,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY) + INTERVAL 9 HOUR, 30, 'Completed', 'Seizure follow-up'),
  (18, 18, 3,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY) + INTERVAL 10 HOUR, 30, 'Completed', 'Angina evaluation'),
  (19, 19, 7,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY) + INTERVAL 12 HOUR, 30, 'Completed', 'Sinusitis'),
  (20, 20, 8,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY) + INTERVAL 14 HOUR, 30, 'Cancelled', 'Eye infection'),
  -- Today's appointments (relative to current date).
  (21, 1,  1,  CURRENT_DATE + INTERVAL 9 HOUR,  30, 'Scheduled', 'Follow-up consultation'),
  (22, 3,  3,  CURRENT_DATE + INTERVAL 10 HOUR, 30, 'Scheduled', 'Cardiac review'),
  (23, 5,  6,  CURRENT_DATE + INTERVAL 11 HOUR, 30, 'Scheduled', 'Dermatology follow-up'),
  (24, 2,  9,  CURRENT_DATE + INTERVAL 12 HOUR, 30, 'Scheduled', 'Prenatal visit'),
  (25, 7,  7,  CURRENT_DATE + INTERVAL 14 HOUR, 30, 'Scheduled', 'Throat infection'),
  (26, 11, 2,  CURRENT_DATE + INTERVAL 15 HOUR, 30, 'Scheduled', 'Child vaccination'),
  -- Future appointments.
  (27, 6,  1,  DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 9 HOUR, 30, 'Scheduled', 'Diabetes review'),
  (28, 10, 3,  DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR, 30, 'Scheduled', 'Cardiac stress test'),
  (29, 14, 4,  DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 11 HOUR, 30, 'Scheduled', 'Knee evaluation'),
  (30, 17, 5,  DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY) + INTERVAL 14 HOUR, 30, 'Scheduled', 'Neurology follow-up'),
  (31, 9,  8,  DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY) + INTERVAL 15 HOUR, 30, 'Scheduled', 'Eye check'),
  (32, 13, 2,  DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY) + INTERVAL 9 HOUR, 30, 'Scheduled', 'Child growth review');

-- Medical records for completed appointments ------------------------------------
INSERT INTO `medical_records` (`record_id`, `appointment_id`, `diagnosis`, `treatment`, `notes`, `recorded_by`, `recorded_at`) VALUES
  (1,  1,  'Acute viral fever',                'Paracetamol 500mg, rest, hydration',                    'Reviewed vitals; advise follow-up if fever persists', 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 DAY) + INTERVAL 10 HOUR),
  (2,  2,  'Normal pregnancy, 2nd trimester',  'Prenatal vitamins, iron supplementation',                'Next visit in 4 weeks',                              3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 44 DAY) + INTERVAL 12 HOUR),
  (3,  3,  'Stable angina, mild',              'Amlodipine 5mg daily, ECG monitoring',                   'Advise low-salt diet and regular exercise',           3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 42 DAY) + INTERVAL 11 HOUR),
  (4,  5,  'Contact dermatitis',               'Cetirizine 10mg, topical corticosteroid',                'Avoid allergen exposure',                            3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 38 DAY) + INTERVAL 16 HOUR),
  (5,  6,  'Type 2 diabetes, controlled',      'Metformin 500mg twice daily',                             'Monitor fasting glucose weekly',                      3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 35 DAY) + INTERVAL 10 HOUR),
  (6,  8,  'Refractive error, myopia',         'Corrective lenses; regular eye exam',                     'Schedule annual review',                             3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY) + INTERVAL 17 HOUR),
  (7,  9,  'Tension-type headache',            'Ibuprofen 400mg as needed, stress management',           'Advise sleep hygiene',                               3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY) + INTERVAL 11 HOUR),
  (8,  10, 'Hypertension, stage 1',            'Amlodipine 5mg daily',                                    'Home BP monitoring recommended',                     3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY) + INTERVAL 12 HOUR),
  (9,  11, 'Dysmenorrhea',                     'Ibuprofen 400mg, warm compress',                          'Advise dietary review',                              3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY) + INTERVAL 15 HOUR),
  (10, 12, 'Routine immunization',             'Administered scheduled vaccine',                          'No adverse reaction observed',                       3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY) + INTERVAL 10 HOUR),
  (11, 13, 'Upper respiratory infection',      'Amoxicillin 250mg, ORS, rest',                            'Recheck if cough persists beyond 5 days',             3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY) + INTERVAL 11 HOUR),
  (12, 14, 'Acne vulgaris',                    'Topical treatment, Cetirizine 10mg',                     'Avoid oily cosmetics',                               3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY) + INTERVAL 14 HOUR),
  (13, 15, 'General health check',             'Multivitamin, lifestyle advice',                          'Annual screening advised',                           3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY) + INTERVAL 12 HOUR),
  (14, 16, 'Rotator cuff strain',              'Ibuprofen 400mg, physiotherapy referral',                'Avoid heavy lifting for 4 weeks',                     3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY) + INTERVAL 16 HOUR),
  (15, 17, 'Epilepsy, controlled',             'Continue anticonvulsant regimen',                         'EEG follow-up in 3 months',                           3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY) + INTERVAL 10 HOUR),
  (16, 18, 'Chronic stable angina',            'Atorvastatin 10mg, Amlodipine 5mg',                      'Cardiac rehabilitation advised',                      3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY) + INTERVAL 11 HOUR),
  (17, 19, 'Acute sinusitis',                  'Amoxicillin 250mg, steam inhalation',                   'Complete full antibiotic course',                     3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY) + INTERVAL 13 HOUR);

-- Prescriptions -----------------------------------------------------------------
INSERT INTO `prescriptions` (`prescription_id`, `record_id`, `doctor_id`, `patient_id`, `prescribed_at`, `status`) VALUES
  (1,  1,  1,  1,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 DAY), 'Dispensed'),
  (2,  2,  9,  2,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 44 DAY), 'Dispensed'),
  (3,  3,  3,  3,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 42 DAY), 'Dispensed'),
  (4,  4,  6,  5,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 38 DAY), 'Dispensed'),
  (5,  5,  1,  6,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 35 DAY), 'Dispensed'),
  (6,  6,  8,  8,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'Dispensed'),
  (7,  7,  5,  9,  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY), 'Dispensed'),
  (8,  8,  3,  10, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY), 'Dispensed'),
  (9,  9,  9,  11, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY), 'Dispensed'),
  (10, 10, 2,  12, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY), 'Dispensed'),
  (11, 11, 2,  13, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY), 'Dispensed'),
  (12, 12, 6,  14, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 'Dispensed'),
  (13, 14, 4,  16, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY), 'Dispensed'),
  (14, 15, 5,  17, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY),  'Dispensed'),
  (15, 16, 3,  18, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY),  'Dispensed'),
  (16, 17, 7,  19, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY),  'Dispensed');

-- Prescription line items --------------------------------------------------------
-- dosage / frequency / duration_days / quantity (quantity = dose per day * days)
INSERT INTO `prescription_items` (`prescription_id`, `medicine_id`, `dosage`, `frequency`, `duration_days`, `quantity`, `instructions`) VALUES
  (1,  1,  '500mg', 'Three times daily', 5, 15, 'After meals'),
  (1,  10, '1 sachet', 'Three times daily', 3, 3, 'Dissolve in water'),
  (2,  11, '60000 IU', 'Once weekly', 4, 4, 'With milk'),
  (3,  7,  '5mg', 'Once daily', 30, 30, 'At bedtime'),
  (4,  4,  '10mg', 'Once daily', 7, 7, 'At night'),
  (5,  6,  '500mg', 'Twice daily', 30, 60, 'After meals'),
  (6,  5,  '20mg', 'Once daily', 14, 14, 'Before breakfast'),
  (7,  2,  '400mg', 'Twice daily as needed', 5, 10, 'With food'),
  (8,  7,  '5mg', 'Once daily', 30, 30, 'Morning'),
  (9,  2,  '400mg', 'Twice daily', 3, 6, 'With food'),
  (10, 10, '1 sachet', 'As needed', 2, 2, 'Dissolve in water'),
  (11, 3,  '250mg', 'Three times daily', 7, 21, 'After meals'),
  (11, 10, '1 sachet', 'Three times daily', 3, 3, 'Dissolve in water'),
  (12, 4,  '10mg', 'Once daily', 10, 10, 'At night'),
  (13, 2,  '400mg', 'Three times daily', 7, 21, 'With food'),
  (14, 1,  '500mg', 'Twice daily', 7, 14, 'After meals'),
  (15, 8,  '10mg', 'Once daily', 30, 30, 'At bedtime'),
  (15, 7,  '5mg', 'Once daily', 30, 30, 'Morning'),
  (16, 3,  '250mg', 'Three times daily', 7, 21, 'Complete full course');

-- Prescription dispensing (stock already reflects these deductions) ---------------
INSERT INTO `prescription_dispensing` (`prescription_id`, `dispensed_by`, `dispensed_at`) VALUES
  (1,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 DAY)),
  (2,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 44 DAY)),
  (3,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 42 DAY)),
  (4,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 38 DAY)),
  (5,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 35 DAY)),
  (6,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)),
  (7,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY)),
  (8,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY)),
  (9,  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY)),
  (10, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY)),
  (11, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY)),
  (12, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY)),
  (13, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY)),
  (14, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY)),
  (15, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY)),
  (16, 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY));

-- Bills --------------------------------------------------------------------------
-- bill_number format: BILL-YYYYMMDD-XXXX
INSERT INTO `bills` (`bill_id`, `bill_number`, `patient_id`, `appointment_id`, `status`, `total_amount`, `paid_amount`, `outstanding_amount`, `bill_date`, `due_date`, `created_by`) VALUES
  (1,  'BILL-0001', 1,  1,  'Paid',          750.00,  750.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 38 DAY), 4),
  (2,  'BILL-0002', 2,  2,  'Paid',          645.00,  645.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 44 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 37 DAY), 4),
  (3,  'BILL-0003', 3,  3,  'Paid',         1270.00, 1270.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 42 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), 4),
  (4,  'BILL-0004', 5,  5,  'Paid',          760.00,  760.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 38 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 31 DAY), 4),
  (5,  'BILL-0005', 6,  6,  'Paid',         1055.00, 1055.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 28 DAY), 4),
  (6,  'BILL-0006', 8,  8,  'Paid',          730.00,  730.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 23 DAY), 4),
  (7,  'BILL-0007', 9,  9,  'Partially Paid', 1145.00, 500.00,  645.00, DATE_SUB(CURRENT_DATE, INTERVAL 28 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 21 DAY), 4),
  (8,  'BILL-0008', 10, 10, 'Paid',         1220.00, 1220.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY), 4),
  (9,  'BILL-0009', 11, 11, 'Paid',          865.00,  865.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 22 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), 4),
  (10, 'BILL-0010', 12, 12, 'Paid',          645.00,  645.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), 4),
  (11, 'BILL-0011', 13, 13, 'Paid',          705.00,  705.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), 4),
  (12, 'BILL-0012', 14, 14, 'Pending',       790.00,    0.00,  790.00, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), 4),
  (13, 'BILL-0013', 16, 16, 'Partially Paid', 1090.00, 400.00,  690.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 4),
  (14, 'BILL-0014', 17, 17, 'Paid',          1120.00, 1120.00,    0.00, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY),  DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 4),
  (15, 'BILL-0015', 18, 18, 'Overdue',       1240.00,    0.00, 1240.00, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY),  DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 4),
  (16, 'BILL-0016', 19, 19, 'Pending',        735.00,    0.00,  735.00, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY),  DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 4),
  (17, 'BILL-0017', 3,  NULL, 'Pending',      1200.00,    0.00, 1200.00, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 4),
  (18, 'BILL-0018', 1,  NULL, 'Partially Paid', 600.00,  200.00,  400.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 4);

-- Bill line items (unit_price is a historical snapshot) ----------------------------
INSERT INTO `bill_items` (`bill_id`, `description`, `quantity`, `unit_price`, `line_total`, `medicine_id`) VALUES
  (1,  'Consultation - General Medicine',        1,  500.00,  500.00, NULL),
  (1,  'Paracetamol 500mg',                     15,    5.00,   75.00, 1),
  (1,  'ORS Sachet',                             3,   15.00,   45.00, 10),
  (1,  'Blood Test - CBC',                       1,  130.00,  130.00, NULL),
  (2,  'Consultation - Gynecology',              1,  600.00,  600.00, NULL),
  (2,  'Vitamin D3 60000 IU',                    1,   45.00,   45.00, 11),
  (3,  'Consultation - Cardiology',              1, 1200.00, 1200.00, NULL),
  (3,  'Amlodipine 5mg',                         1,   20.00,   20.00, 7),
  (3,  'ECG Test',                               1,   50.00,   50.00, NULL),
  (4,  'Consultation - Dermatology',             1,  700.00,  700.00, NULL),
  (4,  'Cetirizine 10mg',                        1,    6.00,    6.00, 4),
  (4,  'Topical Cream',                          1,   54.00,   54.00, NULL),
  (5,  'Consultation - General Medicine',        1,  500.00,  500.00, NULL),
  (5,  'Metformin 500mg',                        1,   18.00,   18.00, 6),
  (5,  'Blood Test - HbA1c',                     1,  537.00,  537.00, NULL),
  (6,  'Consultation - Ophthalmology',           1,  700.00,  700.00, NULL),
  (6,  'Omeprazole 20mg',                        1,   15.00,   15.00, 5),
  (6,  'Vision Test',                            1,   15.00,   15.00, NULL),
  (7,  'Consultation - Neurology',               1, 1100.00, 1100.00, NULL),
  (7,  'Ibuprofen 400mg',                        1,    8.50,    8.50, 2),
  (7,  'MRI Brain',                              1,   36.50,   36.50, NULL),
  (8,  'Consultation - Cardiology',              1, 1200.00, 1200.00, NULL),
  (8,  'Amlodipine 5mg',                         1,   20.00,   20.00, 7),
  (9,  'Consultation - Gynecology',              1,  800.00,  800.00, NULL),
  (9,  'Ibuprofen 400mg',                        1,    8.50,    8.50, 2),
  (9,  'Ultrasound Pelvis',                      1,   56.50,   56.50, NULL),
  (10, 'Consultation - Pediatrics',              1,  600.00,  600.00, NULL),
  (10, 'ORS Sachet',                             1,   15.00,   15.00, 10),
  (10, 'Vaccine Dose',                           1,   30.00,   30.00, NULL),
  (11, 'Consultation - Pediatrics',              1,  600.00,  600.00, NULL),
  (11, 'Amoxicillin 250mg',                      1,   22.00,   22.00, 3),
  (11, 'ORS Sachet',                             1,   15.00,   15.00, 10),
  (11, 'Chest X-Ray',                            1,   68.00,   68.00, NULL),
  (12, 'Consultation - Dermatology',             1,  700.00,  700.00, NULL),
  (12, 'Cetirizine 10mg',                        1,    6.00,    6.00, 4),
  (12, 'Dermatology Kit',                        1,   84.00,   84.00, NULL),
  (13, 'Consultation - Orthopedics',             1, 1000.00, 1000.00, NULL),
  (13, 'Ibuprofen 400mg',                        1,    8.50,    8.50, 2),
  (13, 'X-Ray Knee',                             1,   81.50,   81.50, NULL),
  (14, 'Consultation - Neurology',               1, 1100.00, 1100.00, NULL),
  (14, 'Paracetamol 500mg',                      1,    5.00,    5.00, 1),
  (14, 'EEG Test',                               1,   15.00,   15.00, NULL),
  (15, 'Consultation - Cardiology',              1, 1200.00, 1200.00, NULL),
  (15, 'Atorvastatin 10mg',                      1,   35.00,   35.00, 8),
  (15, 'Troponin Test',                          1,    5.00,    5.00, NULL),
  (16, 'Consultation - ENT',                     1,  650.00,  650.00, NULL),
  (16, 'Amoxicillin 250mg',                      1,   22.00,   22.00, 3),
  (16, 'Nasal Spray',                            1,   63.00,   63.00, NULL),
  (17, 'Procedure - Angiography',                1, 1200.00, 1200.00, NULL),
  (18, 'Room Charge - Ward A',                   2,  300.00,  600.00, NULL);

-- Payments ------------------------------------------------------------------------
INSERT INTO `payments` (`payment_id`, `payment_number`, `bill_id`, `amount`, `payment_method`, `reference`, `paid_by`, `paid_at`) VALUES
  (1,  'PAY-0001', 1,   750.00, 'Cash',          'CASH-0001', 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 DAY) + INTERVAL 11 HOUR),
  (2,  'PAY-0002', 2,   645.00, 'UPI',           'UPI-0002',   4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 44 DAY) + INTERVAL 13 HOUR),
  (3,  'PAY-0003', 3,  1270.00, 'Card',          'CARD-0003',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 42 DAY) + INTERVAL 12 HOUR),
  (4,  'PAY-0004', 4,   760.00, 'Cash',          'CASH-0004',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 38 DAY) + INTERVAL 17 HOUR),
  (5,  'PAY-0005', 5,  1055.00, 'Bank Transfer', 'BT-0005',    4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 35 DAY) + INTERVAL 11 HOUR),
  (6,  'PAY-0006', 6,   730.00, 'UPI',           'UPI-0006',   4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY) + INTERVAL 18 HOUR),
  (7,  'PAY-0007', 7,   500.00, 'Cash',          'CASH-0007',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY) + INTERVAL 12 HOUR),
  (8,  'PAY-0008', 8,  1220.00, 'Card',          'CARD-0008',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY) + INTERVAL 13 HOUR),
  (9,  'PAY-0009', 9,   865.00, 'UPI',           'UPI-0009',   4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY) + INTERVAL 16 HOUR),
  (10, 'PAY-0010', 10,  645.00, 'Cash',          'CASH-0010',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY) + INTERVAL 11 HOUR),
  (11, 'PAY-0011', 11,  705.00, 'Insurance',     'INS-0011',   4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY) + INTERVAL 12 HOUR),
  (12, 'PAY-0013', 13,  400.00, 'Cash',          'CASH-0013',  4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY) + INTERVAL 17 HOUR),
  (13, 'PAY-0014', 14, 1120.00, 'UPI',           'UPI-0014',   4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY) + INTERVAL 11 HOUR),
  (14, 'PAY-0018', 18,  200.00, 'Cash',          'CASH-0018',  4, CURRENT_TIMESTAMP - INTERVAL 2 HOUR);

-- Stock movement ledger reflecting initial purchase plus dispensed quantities -------
INSERT INTO `stock_movements` (`medicine_id`, `movement_type`, `quantity_delta`, `balance_after`, `reference_type`, `reference_id`, `note`, `moved_by`) VALUES
  (1,  'Purchase',  1000, 1000, NULL, NULL, 'Initial stock', 4),
  (2,  'Purchase',   700,  700, NULL, NULL, 'Initial stock', 4),
  (3,  'Purchase',   500,  500, NULL, NULL, 'Initial stock', 4),
  (4,  'Purchase',   600,  600, NULL, NULL, 'Initial stock', 4),
  (5,  'Purchase',   500,  500, NULL, NULL, 'Initial stock', 4),
  (6,  'Purchase',   400,  400, NULL, NULL, 'Initial stock', 4),
  (7,  'Purchase',   400,  400, NULL, NULL, 'Initial stock', 4),
  (8,  'Purchase',   300,  300, NULL, NULL, 'Initial stock', 4),
  (9,  'Purchase',   150,  150, NULL, NULL, 'Initial stock', 4),
  (10, 'Purchase',   800,  800, NULL, NULL, 'Initial stock', 4),
  (11, 'Purchase',   200,  200, NULL, NULL, 'Initial stock', 4),
  (12, 'Purchase',   150,  150, NULL, NULL, 'Initial stock', 4);

-- The medicines seed above already reflects post-dispensing balances. This ledger
-- records the corresponding dispensing deductions for auditability.
INSERT INTO `stock_movements` (`medicine_id`, `movement_type`, `quantity_delta`, `balance_after`, `reference_type`, `reference_id`, `note`, `moved_by`) VALUES
  (1,  'Dispense',  -15,  985, 'Prescription', 1,  'Rx 1', 4),
  (10, 'Dispense',   -3,  797, 'Prescription', 1,  'Rx 1', 4),
  (11, 'Dispense',   -4,  196, 'Prescription', 2,  'Rx 2', 4),
  (7,  'Dispense',  -30,  370, 'Prescription', 3,  'Rx 3', 4),
  (4,  'Dispense',   -7,  593, 'Prescription', 4,  'Rx 4', 4),
  (6,  'Dispense',  -60,  340, 'Prescription', 5,  'Rx 5', 4),
  (5,  'Dispense',  -14,  486, 'Prescription', 6,  'Rx 6', 4),
  (2,  'Dispense',  -10,  690, 'Prescription', 7,  'Rx 7', 4),
  (7,  'Dispense',  -30,  340, 'Prescription', 8,  'Rx 8', 4),
  (2,  'Dispense',   -6,  684, 'Prescription', 9,  'Rx 9', 4),
  (10, 'Dispense',   -2,  795, 'Prescription', 10, 'Rx 10', 4),
  (3,  'Dispense',  -21,  479, 'Prescription', 11, 'Rx 11', 4),
  (10, 'Dispense',   -3,  792, 'Prescription', 11, 'Rx 11', 4),
  (4,  'Dispense',  -10,  583, 'Prescription', 12, 'Rx 12', 4),
  (2,  'Dispense',  -21,  663, 'Prescription', 13, 'Rx 13', 4),
  (1,  'Dispense',  -14,  971, 'Prescription', 14, 'Rx 14', 4),
  (8,  'Dispense',  -30,  270, 'Prescription', 15, 'Rx 15', 4),
  (7,  'Dispense',  -30,  310, 'Prescription', 15, 'Rx 15', 4),
  (3,  'Dispense',  -21,  458, 'Prescription', 16, 'Rx 16', 4);
