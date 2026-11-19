-- 036_create_patient.sql
-- params: [ full_name, gender, date_of_birth, phone, email, address, blood_group ]

INSERT INTO `patients`
  (`full_name`, `gender`, `date_of_birth`, `phone`, `email`, `address`, `blood_group`)
VALUES (?, ?, ?, ?, ?, ?, ?);