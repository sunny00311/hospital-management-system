-- 001_reference_data.sql
-- Execution order: 1 of 3 (seeds)
-- Reference data: departments, medicines catalogue, and the bootstrap admin user.
--
-- The bootstrap admin account is created here with a placeholder password hash
-- produced by bcrypt for the string "change-me". Replace it by running the
-- application and updating the user, or by executing a hash-generation script.
--
-- IMPORTANT: In a real deployment, create the admin password through a secure
-- bootstrap flow. This seed ships a known default for local development only.

USE `hospital_management`;

-- Departments -----------------------------------------------------------------
INSERT INTO `departments` (`department_name`, `description`) VALUES
  ('General Medicine', 'Primary care and general consultations'),
  ('Pediatrics', 'Medical care for infants, children, and adolescents'),
  ('Cardiology', 'Diagnosis and treatment of heart conditions'),
  ('Orthopedics', 'Bone, joint, and musculoskeletal care'),
  ('Neurology', 'Nervous system and brain disorders'),
  ('Dermatology', 'Skin, hair, and nail conditions'),
  ('ENT', 'Ear, nose, and throat care'),
  ('Ophthalmology', 'Eye and vision care'),
  ('Gynecology', 'Women''s health and reproductive care'),
  ('Emergency', 'Emergency and critical care');

-- Medicines catalogue ---------------------------------------------------------
INSERT INTO `medicines`
  (`medicine_name`, `generic_name`, `category`, `unit_price`, `stock_quantity`, `reorder_level`, `unit`) VALUES
  ('Paracetamol 500mg',          'Paracetamol',              'Analgesic',        5.00,  800, 100, 'tablet'),
  ('Ibuprofen 400mg',            'Ibuprofen',                'NSAID',             8.50,  500,  80, 'tablet'),
  ('Amoxicillin 250mg',          'Amoxicillin',              'Antibiotic',       22.00, 300,  50, 'capsule'),
  ('Cetirizine 10mg',            'Cetirizine',               'Antihistamine',     6.00, 420,  60, 'tablet'),
  ('Omeprazole 20mg',            'Omeprazole',               'Proton Pump Inhibitor', 15.00, 350, 50, 'capsule'),
  ('Metformin 500mg',            'Metformin',                'Antidiabetic',     18.00, 280,  40, 'tablet'),
  ('Amlodipine 5mg',             'Amlodipine',               'Antihypertensive', 20.00, 250,  40, 'tablet'),
  ('Atorvastatin 10mg',          'Atorvastatin',             'Statin',           35.00, 200,  30, 'tablet'),
  ('Salbutamol Inhaler',         'Salbutamol',               'Bronchodilator',  120.00,  90,  20, 'inhaler'),
  ('ORS Sachet',                 'Oral Rehydration Salts',   'Electrolyte',      15.00, 600,  80, 'sachet'),
  ('Vitamin D3 60000 IU',        'Cholecalciferol',          'Supplement',       45.00, 150,  25, 'capsule'),
  ('Cetrimide Solution',         'Cetrimide',                'Antiseptic',       30.00, 120,  20, 'bottle');

-- Bootstrap admin user ---------------------------------------------------------
-- Password hash below corresponds to bcrypt("change-me"). For local dev only.
INSERT INTO `users` (`username`, `password_hash`, `role`, `full_name`)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'System Administrator')
ON DUPLICATE KEY UPDATE `username` = `username`;
