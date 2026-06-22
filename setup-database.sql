-- INCroute Platform Database Schema
-- Run this SQL in phpMyAdmin on database: u453824837_Platform
-- Generated from prisma/schema.prisma

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ═══ USERS & AUTH ═══

CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(30) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `role` ENUM('SUPER_ADMIN','ADMIN','TEAM_MEMBER','CLIENT','CLIENT_SUB_USER') NOT NULL DEFAULT 'CLIENT',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `emailVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `lastLoginAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key` (`email`),
  INDEX `User_email_idx` (`email`),
  INDEX `User_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Permission` (
  `id` VARCHAR(30) NOT NULL,
  `resource` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Permission_resource_action_key` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserPermission` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `permissionId` VARCHAR(30) NOT NULL,
  `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `grantedBy` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserPermission_userId_permissionId_key` (`userId`, `permissionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Session` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `device` VARCHAR(191) NULL,
  `browser` VARCHAR(191) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastActive` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Session_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RefreshToken` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `family` VARCHAR(191) NOT NULL,
  `isRevoked` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `RefreshToken_token_key` (`token`),
  INDEX `RefreshToken_token_idx` (`token`),
  INDEX `RefreshToken_userId_idx` (`userId`),
  INDEX `RefreshToken_family_idx` (`family`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TeamAssignment` (
  `id` VARCHAR(30) NOT NULL,
  `memberId` VARCHAR(30) NOT NULL,
  `entityId` VARCHAR(30) NOT NULL,
  `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `assignedBy` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `TeamAssignment_memberId_entityId_key` (`memberId`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `EntityAccess` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `entityId` VARCHAR(30) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'owner',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `EntityAccess_userId_entityId_key` (`userId`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NULL,
  `action` VARCHAR(191) NOT NULL,
  `resource` VARCHAR(191) NULL,
  `details` TEXT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `success` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AuditLog_userId_idx` (`userId`),
  INDEX `AuditLog_action_idx` (`action`),
  INDEX `AuditLog_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PasswordReset` (
  `id` VARCHAR(30) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PasswordReset_token_key` (`token`),
  INDEX `PasswordReset_token_idx` (`token`),
  INDEX `PasswordReset_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══ OPERATIONS MODELS ═══

CREATE TABLE IF NOT EXISTS `Client` (
  `id` VARCHAR(30) NOT NULL,
  `companyName` VARCHAR(191) NOT NULL,
  `contactName` VARCHAR(191) NOT NULL,
  `contactEmail` VARCHAR(191) NOT NULL,
  `contactPhone` VARCHAR(191) NULL,
  `industry` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE','INACTIVE','ONBOARDING','CHURNED') NOT NULL DEFAULT 'ACTIVE',
  `relationshipMgrId` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Client_status_idx` (`status`),
  INDEX `Client_contactEmail_idx` (`contactEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Entity` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('PVT_LTD','LLP','OPC','PARTNERSHIP','SECTION_8','PUBLIC_LTD','FOREIGN') NOT NULL,
  `cin` VARCHAR(191) NULL,
  `pan` VARCHAR(191) NULL,
  `gstin` VARCHAR(191) NULL,
  `incorporatedAt` DATETIME(3) NULL,
  `status` ENUM('ACTIVE','DORMANT','STRIKE_OFF','UNDER_LIQUIDATION') NOT NULL DEFAULT 'ACTIVE',
  `complianceScore` INT NOT NULL DEFAULT 100,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Entity_clientId_idx` (`clientId`),
  INDEX `Entity_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ComplianceTask` (
  `id` VARCHAR(30) NOT NULL,
  `entityId` VARCHAR(30) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `category` ENUM('ROC','GST','DIN_KYC','INCOME_TAX','TRADEMARK','BOARD_MEETING','ANNUAL_FILING','TDS','EPF','OTHER') NOT NULL,
  `dueDate` DATETIME(3) NOT NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('PENDING','IN_PROGRESS','UNDER_REVIEW','COMPLETED','OVERDUE','BLOCKED') NOT NULL DEFAULT 'PENDING',
  `assigneeId` VARCHAR(191) NULL,
  `completedAt` DATETIME(3) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ComplianceTask_entityId_idx` (`entityId`),
  INDEX `ComplianceTask_status_idx` (`status`),
  INDEX `ComplianceTask_dueDate_idx` (`dueDate`),
  INDEX `ComplianceTask_assigneeId_idx` (`assigneeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Task` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `assigneeId` VARCHAR(191) NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('PENDING','IN_PROGRESS','UNDER_REVIEW','COMPLETED','BLOCKED') NOT NULL DEFAULT 'PENDING',
  `dueDate` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdBy` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Task_assigneeId_idx` (`assigneeId`),
  INDEX `Task_status_idx` (`status`),
  INDEX `Task_clientId_idx` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Document` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NULL,
  `entityId` VARCHAR(30) NULL,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `fileUrl` VARCHAR(191) NOT NULL,
  `fileSize` INT NULL,
  `version` INT NOT NULL DEFAULT 1,
  `status` ENUM('DRAFT','UNDER_REVIEW','APPROVED','REJECTED','PUBLISHED','ARCHIVED','EXPIRED') NOT NULL DEFAULT 'DRAFT',
  `uploadedBy` VARCHAR(191) NULL,
  `approvedBy` VARCHAR(191) NULL,
  `approvedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Document_clientId_idx` (`clientId`),
  INDEX `Document_status_idx` (`status`),
  INDEX `Document_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Invoice` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `invoiceNo` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `tax` DECIMAL(12,2) NULL,
  `total` DECIMAL(12,2) NOT NULL,
  `status` ENUM('DRAFT','PENDING','SENT','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `dueDate` DATETIME(3) NOT NULL,
  `paidAt` DATETIME(3) NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Invoice_invoiceNo_key` (`invoiceNo`),
  INDEX `Invoice_clientId_idx` (`clientId`),
  INDEX `Invoice_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Ticket` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN','IN_PROGRESS','WAITING_CLIENT','ESCALATED','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `assigneeId` VARCHAR(191) NULL,
  `resolvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Ticket_clientId_idx` (`clientId`),
  INDEX `Ticket_status_idx` (`status`),
  INDEX `Ticket_assigneeId_idx` (`assigneeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Consultation` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `topic` VARCHAR(191) NOT NULL,
  `advisorId` VARCHAR(191) NULL,
  `scheduledAt` DATETIME(3) NOT NULL,
  `duration` INT NOT NULL DEFAULT 30,
  `status` ENUM('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `meetingLink` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Consultation_clientId_idx` (`clientId`),
  INDEX `Consultation_scheduledAt_idx` (`scheduledAt`),
  INDEX `Consultation_advisorId_idx` (`advisorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `LegalMatter` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `lawyerId` VARCHAR(191) NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN','IN_PROGRESS','HEARING_SCHEDULED','UNDER_REVIEW','COMPLETED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `deadline` DATETIME(3) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `LegalMatter_clientId_idx` (`clientId`),
  INDEX `LegalMatter_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TrademarkApp` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `applicationNo` VARCHAR(191) NULL,
  `classNumber` VARCHAR(191) NOT NULL,
  `status` ENUM('FILED','UNDER_EXAMINATION','OBJECTION_RAISED','HEARING_SCHEDULED','PUBLISHED','REGISTERED','RENEWAL_DUE','ABANDONED') NOT NULL DEFAULT 'FILED',
  `currentStage` VARCHAR(191) NULL,
  `nextAction` VARCHAR(191) NULL,
  `filedAt` DATETIME(3) NULL,
  `renewalDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `TrademarkApp_clientId_idx` (`clientId`),
  INDEX `TrademarkApp_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Activity` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NULL,
  `userId` VARCHAR(191) NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `details` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Activity_clientId_idx` (`clientId`),
  INDEX `Activity_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══ SERVICE DELIVERY & ONBOARDING ═══

CREATE TABLE IF NOT EXISTS `ServiceRequest` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NULL,
  `userId` VARCHAR(191) NULL,
  `serviceType` ENUM('PVT_LTD_INCORPORATION','LLP_INCORPORATION','OPC_INCORPORATION','PARTNERSHIP_REGISTRATION','SECTION_8_INCORPORATION','GST_REGISTRATION','TRADEMARK_FILING','COMPLIANCE_ANNUAL','TAX_RETURN','LEGAL_DRAFTING','VIRTUAL_OFFICE','MSME_REGISTRATION','FSSAI_REGISTRATION') NOT NULL,
  `status` ENUM('DRAFT','PENDING_DOCUMENTS','UNDER_REVIEW','IN_PROGRESS','FILED','AWAITING_APPROVAL','COMPLETED','ON_HOLD','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `progress` INT NOT NULL DEFAULT 0,
  `currentStep` VARCHAR(191) NOT NULL DEFAULT 'account',
  `assignedMgrId` VARCHAR(191) NULL,
  `assignedExecId` VARCHAR(191) NULL,
  `companyName` VARCHAR(191) NULL,
  `companyInfo` JSON NULL,
  `promoterInfo` JSON NULL,
  `expectedDate` DATETIME(3) NULL,
  `notes` TEXT NULL,
  `submittedAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ServiceRequest_clientId_idx` (`clientId`),
  INDEX `ServiceRequest_status_idx` (`status`),
  INDEX `ServiceRequest_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ServiceStep` (
  `id` VARCHAR(30) NOT NULL,
  `serviceRequestId` VARCHAR(30) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `order` INT NOT NULL,
  `status` ENUM('PENDING','IN_PROGRESS','COMPLETED','BLOCKED','SKIPPED') NOT NULL DEFAULT 'PENDING',
  `assigneeId` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ServiceStep_serviceRequestId_idx` (`serviceRequestId`),
  INDEX `ServiceStep_order_idx` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ServiceDocument` (
  `id` VARCHAR(30) NOT NULL,
  `serviceRequestId` VARCHAR(30) NOT NULL,
  `documentType` ENUM('PAN_CARD','AADHAAR','PASSPORT','ADDRESS_PROOF','BANK_STATEMENT','PHOTOGRAPH','DSC','UTILITY_BILL','NOC','RENT_AGREEMENT','PARTNERSHIP_DEED','MOA_AOA','GST_CERTIFICATE','TRADEMARK_LOGO','OTHER') NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NULL,
  `fileUrl` VARCHAR(191) NULL,
  `fileSize` INT NULL,
  `status` ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','NEEDS_CLARIFICATION','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `reviewedBy` VARCHAR(191) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `rejectReason` VARCHAR(191) NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ServiceDocument_serviceRequestId_idx` (`serviceRequestId`),
  INDEX `ServiceDocument_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TimelineEntry` (
  `id` VARCHAR(30) NOT NULL,
  `serviceRequestId` VARCHAR(30) NULL,
  `clientId` VARCHAR(191) NULL,
  `userId` VARCHAR(191) NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `TimelineEntry_serviceRequestId_idx` (`serviceRequestId`),
  INDEX `TimelineEntry_clientId_idx` (`clientId`),
  INDEX `TimelineEntry_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `WhatsAppMessage` (
  `id` VARCHAR(30) NOT NULL,
  `recipientPhone` VARCHAR(191) NOT NULL,
  `templateId` VARCHAR(191) NOT NULL,
  `variables` JSON NULL,
  `status` ENUM('QUEUED','SENT','DELIVERED','READ','FAILED','RETRY') NOT NULL DEFAULT 'QUEUED',
  `provider` VARCHAR(191) NOT NULL DEFAULT 'whatsapp_business',
  `providerMsgId` VARCHAR(191) NULL,
  `sentAt` DATETIME(3) NULL,
  `deliveredAt` DATETIME(3) NULL,
  `failedAt` DATETIME(3) NULL,
  `failReason` VARCHAR(191) NULL,
  `retryCount` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `WhatsAppMessage_recipientPhone_idx` (`recipientPhone`),
  INDEX `WhatsAppMessage_status_idx` (`status`),
  INDEX `WhatsAppMessage_templateId_idx` (`templateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MessageTemplate` (
  `id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `channel` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NULL,
  `body` TEXT NOT NULL,
  `variables` JSON NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `MessageTemplate_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RelationshipAssignment` (
  `id` VARCHAR(30) NOT NULL,
  `clientId` VARCHAR(30) NOT NULL,
  `managerId` VARCHAR(191) NOT NULL,
  `executiveId` VARCHAR(191) NULL,
  `supportId` VARCHAR(191) NULL,
  `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `RelationshipAssignment_clientId_key` (`clientId`),
  INDEX `RelationshipAssignment_managerId_idx` (`managerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══ FOREIGN KEY CONSTRAINTS ═══

ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TeamAssignment` ADD CONSTRAINT `TeamAssignment_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `EntityAccess` ADD CONSTRAINT `EntityAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Entity` ADD CONSTRAINT `Entity_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ComplianceTask` ADD CONSTRAINT `ComplianceTask_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `Entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Task` ADD CONSTRAINT `Task_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Document` ADD CONSTRAINT `Document_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Document` ADD CONSTRAINT `Document_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `Entity`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Consultation` ADD CONSTRAINT `Consultation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LegalMatter` ADD CONSTRAINT `LegalMatter_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TrademarkApp` ADD CONSTRAINT `TrademarkApp_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ServiceRequest` ADD CONSTRAINT `ServiceRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ServiceStep` ADD CONSTRAINT `ServiceStep_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `ServiceRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ServiceDocument` ADD CONSTRAINT `ServiceDocument_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `ServiceRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TimelineEntry` ADD CONSTRAINT `TimelineEntry_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `ServiceRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══ DONE ═══
-- All 27 tables created successfully!
