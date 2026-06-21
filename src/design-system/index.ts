/**
 * INCROUTE DESIGN SYSTEM
 * ─────────────────────────────────────────────
 * Enterprise-grade component library & token system.
 * 
 * Usage:
 *   import { Button, Card, Badge, Modal, useToast } from "@/design-system";
 *   import tokens from "@/design-system/tokens";
 *
 * CSS (import once in your app entry):
 *   import "@/design-system/tokens.css";
 *   import "@/design-system/typography.css";
 */

// Tokens
export { default as tokens, colors, spacing, radius, motion, breakpoints, layout } from "./tokens";

// Utilities
export { cn } from "./utils";

// Components
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";

export { Card, CardHeader, CardTitle, CardDescription, MetricCard } from "./components/Card";
export type { CardProps, MetricCardProps } from "./components/Card";

export { Badge, StatusBadge } from "./components/Badge";
export type { BadgeProps, BadgeTone } from "./components/Badge";

export { Input, Textarea, Select, Field } from "./components/Input";
export type { InputProps, SelectProps, FieldWrapperProps } from "./components/Input";

export { Checkbox, Radio, Toggle } from "./components/FormControls";
export type { CheckboxProps, RadioProps, ToggleProps } from "./components/FormControls";

export { Modal, ConfirmModal } from "./components/Modal";
export type { ModalProps } from "./components/Modal";

export { ToastProvider, useToast } from "./components/Toast";

export { Sidebar, SidebarProvider, SidebarHeader, NavItem, SidebarFooter, useSidebar } from "./components/Sidebar";
export type { SidebarProps, NavItemProps } from "./components/Sidebar";

export { Table, Thead, Th, Tbody, Tr, Td, ProgressBar, CircularProgress, Timeline } from "./components/Table";
export type { ProgressBarProps, CircularProgressProps, TimelineItem } from "./components/Table";

export { DashboardShell, DashboardMain, DashboardHeader, DashboardContent, PageHeader, Section, Grid, EmptyState } from "./components/Layout";
export type { PageHeaderProps } from "./components/Layout";
