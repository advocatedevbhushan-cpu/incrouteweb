-- Migration: Add Member (Director/Partner) table for per-person document management
-- Run in phpMyAdmin on u453824837_Platform

-- Members table — directors, partners, shareholders for each entity
CREATE TABLE IF NOT EXISTS `Member` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `entityId` VARCHAR(30) NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `role` ENUM('DIRECTOR','PARTNER','SHAREHOLDER','NOMINEE','AUTHORIZED_SIGNATORY','PROMOTER') NOT NULL DEFAULT 'DIRECTOR',
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(50) NULL,
  `pan` VARCHAR(20) NULL,
  `aadhaar` VARCHAR(20) NULL,
  `din` VARCHAR(20) NULL,
  `dpin` VARCHAR(20) NULL,
  `dscExpiry` DATE NULL,
  `address` TEXT NULL,
  `isResident` TINYINT(1) NOT NULL DEFAULT 1,
  `shareholding` DECIMAL(5,2) NULL,
  `status` ENUM('ACTIVE','RESIGNED','REMOVED','DECEASED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Member_clientId_idx` (`clientId`),
  INDEX `Member_entityId_idx` (`entityId`),
  INDEX `Member_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add memberId column to Document table (links document to specific director/partner)
ALTER TABLE `Document`
  ADD COLUMN `memberId` VARCHAR(30) NULL AFTER `entityId`,
  ADD INDEX `Document_memberId_idx` (`memberId`);
