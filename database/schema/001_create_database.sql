-- 001_create_database.sql
-- Execution order: 1 of 3 (schema)
-- Creates the hospital management database.
-- Requires a user with CREATE DATABASE privilege on this host.
-- The application account normally only has privileges on this database.

CREATE DATABASE IF NOT EXISTS `defaultdb`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `defaultdb`;
