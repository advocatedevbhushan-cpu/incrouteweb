-- Migration: Enhanced Document table for Cloudflare R2 storage
-- Run in phpMyAdmin on u453824837_Platform

-- Add new columns to existing Document table
ALTER TABLE `Document`
  ADD COLUMN `originalName` VARCHAR(500) NULL AFTER `fileName`,
  ADD COLUMN `mimeType` VARCHAR(100) NULL AFTER `originalName`,
  ADD COLUMN `storageProvider` VARCHAR(50) NOT NULL DEFAULT 'cloudflare_r2' AFTER `fileSize`,
  ADD COLUMN `storageKey` VARCHAR(500) NULL AFTER `storageProvider`,
  ADD COLUMN `publicUrl` VARCHAR(1000) NULL AFTER `storageKey`,
  ADD COLUMN `folder` VARCHAR(100) NOT NULL DEFAULT 'Other' AFTER `publicUrl`,
  ADD COLUMN `internalNote` TEXT NULL AFTER `folder`;

-- Add index for folder-based queries
ALTER TABLE `Document` ADD INDEX `Document_folder_idx` (`folder`);
ALTER TABLE `Document` ADD INDEX `Document_storageKey_idx` (`storageKey`(255));
