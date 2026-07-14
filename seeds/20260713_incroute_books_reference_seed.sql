-- Reference-only Books seed data. No demo organisations or transactions.

INSERT INTO `BooksPermission` (`id`,`code`,`module`,`action`,`description`) VALUES
('bp_dash_view','dashboard.view','dashboard','view','View accounting dashboard'),
('bp_org_manage','organisation.manage','organisation','manage','Manage organisation settings'),
('bp_contact_view','contacts.view','contacts','view','View customers and vendors'),
('bp_contact_manage','contacts.manage','contacts','manage','Create and edit customers and vendors'),
('bp_item_view','items.view','items','view','View goods and services'),
('bp_item_manage','items.manage','items','manage','Create and edit goods and services'),
('bp_sales_view','sales.view','sales','view','View sales transactions'),
('bp_sales_manage','sales.manage','sales','manage','Create and edit sales drafts'),
('bp_sales_post','sales.post','sales','post','Post sales transactions to the ledger'),
('bp_purchase_view','purchases.view','purchases','view','View purchase transactions'),
('bp_purchase_manage','purchases.manage','purchases','manage','Create and edit purchase drafts'),
('bp_purchase_post','purchases.post','purchases','post','Post purchase transactions to the ledger'),
('bp_bank_view','banking.view','banking','view','View bank and cash accounts'),
('bp_bank_reconcile','banking.reconcile','banking','reconcile','Reconcile bank statements'),
('bp_account_view','accountant.view','accountant','view','View ledgers and journals'),
('bp_account_post','accountant.post','accountant','post','Create and post journal entries'),
('bp_period_lock','accountant.lock_period','accountant','lock_period','Lock or reopen accounting periods'),
('bp_gst_view','gst.view','gst','view','View GST working reports'),
('bp_report_view','reports.view','reports','view','View financial reports'),
('bp_report_export','reports.export','reports','export','Export financial and GST reports'),
('bp_document_view','documents.view','documents','view','View organisation documents'),
('bp_document_manage','documents.manage','documents','manage','Upload and link organisation documents'),
('bp_approval_action','approvals.action','approvals','action','Approve or reject workflow requests'),
('bp_audit_view','audit.view','audit','view','View immutable audit history'),
('bp_member_manage','members.manage','members','manage','Manage members, roles and permissions')
ON DUPLICATE KEY UPDATE
  `module` = VALUES(`module`),
  `action` = VALUES(`action`),
  `description` = VALUES(`description`);

