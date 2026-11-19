-- 032_create_department.sql
-- params: [ department_name, description ]

INSERT INTO `departments` (`department_name`, `description`)
VALUES (?, ?);