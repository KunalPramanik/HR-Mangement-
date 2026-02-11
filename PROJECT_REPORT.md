# Mindstar HR Portal - Project Report

## 1. Executive Summary
**Project Name:** Mindstar HR Portal v2.0  
**Type:** Enterprise Human Resource Management System (HRMS)  
**Objective:**  
To develop a comprehensive, secure, and scalable web application that streamlines HR operations, automates payroll processing, manages employee lifecycles, and provides real-time insights for decision-making. The system is designed to handle complex workflows like leave approvals, attendance tracking with geolocation, and tax compliance (New Regime) while ensuring data integrity and a premium user experience.

---

## 2. Technology Stack

### Frontend & Backend (Full Stack Framework)
*   **Framework:** **Next.js 15+ (App Router)** - chosen for its server-side rendering (SSR) capabilities, robust routing, and API route support.
*   **Language:** **TypeScript** - Ensures type safety, reduces runtime errors, and improves code maintainability across the large codebase.
*   **Authentication:** **NextAuth.js (v4)** - Handles secure session management, role-based access control (RBAC), and supports multiple providers.
*   **Styling:** **Tailwind CSS** - Utility-first CSS framework used to create a custom, responsive, and modern "Glassmorphism" aesthetic.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) and Server Actions.

### Database & Storage
*   **Database:** **MongoDB** - NoSQL database chosen for its flexibility in handling variable data schemas (e.g., dynamic payroll structures, diverse asset types).
*   **ORM:** **Mongoose** - Provides schema validation, data modeling, and business logic hooks.
*   **Transaction Management:** Utilizes MongoDB Sessions for atomic transactions (ACID properties) specifically for critical financial operations like Payroll.

### Key Libraries & Tools
*   **Date Manipulation:** `date-fns` - For robust date formatting and calculation (e.g., leave duration, attendance hours).
*   **UI Notifications:** `sonner` - For accessible, customizable toast notifications.
*   **Charts & Visualization:** `recharts` (implied/planned) for dashboard analytics.
*   **Security:** `bcryptjs` for password hashing, `simplewebauthn` for biometric/passkey support.
*   **Validation:** `zod` - For strict schema validation of API inputs.

---

## 3. System Architecture

The application is built on a **Monolithic Architecture** within the Next.js ecosystem, ensuring tight integration between the frontend UI and backend logic.

*   **Secure API Layer:** All backend logic resides in `/src/app/api/`. These endpoints are protected by `middleware.ts` which enforces authentication and role-based authorization (e.g., only HR/Admin can access `/api/payroll`).
*   **Role-Based Access Control (RBAC):**
    *   **Admin/Director:** Full system access, sensitive reports, configuration.
    *   **HR:** Employee management, payroll processing, leave adjustments.
    *   **Manager:** Team approvals, view team attendance/calendar.
    *   **Employee:** Self-service (leave requests, profile, payslips).
*   **Middleware:** A central `middleware.ts` file intercepts all requests to ensure users are authenticated and authorized for the specific route or API endpoint they are accessing.

---

## 4. Key Modules & Features

### A. Employee Management (Core)
*   **Directory:** Searchable list of all employees with filters for status, department, and role.
*   **Profiles:** Detailed employee profiles including personal info, emergency contacts, skills, and certifications.
*   **Onboarding/Offboarding:** Workflows to handle status changes (Probation, Active, Notice Period, Resigned, Terminated).

### B. Attendance & Time Tracking
*   **Geolocation Clock-In:** Employees can clock in/out only when they are within allowed coordinates (if configured), utilizing the browser's Geolocation API.
*   **Real-time Timer:** Dashboard shows live work duration.
*   **Break/Meeting Tracking:** granular tracking of breaks and meetings to calculate effective productive hours.
*   **Reports:** Detailed daily logs and monthly summaries for HR.

### C. Leave Management
*   **Workflow:** Request -> Manager Approval -> HR Review (if needed).
*   **Leave Types:** Annual, Sick, Personal, Unpaid (LOP).
*   **Balance Management:** Automated tracking of available vs. used leave.
*   **Adjustments:** HR/Admins can manually adjust leave balances for corrections or bonuses.

### D. Payroll & Compensation (Star Feature)
*   **Automated Processing:**
    *   Single-click payroll generation for the entire organization.
    *   **Bulk Processing:** Uses MongoDB Aggregation pipelines to fetch and calculate data for hundreds of employees in milliseconds (solving N+1 query performance issues).
    *   **Transactional Integrity:** Wrapped in MongoDB transactions to ensure that if one calculation fails, the entire batch rolls back, preventing data corruption.
*   **Indian Tax Regime (New):** Built-in utility to calculate income tax, cess, and deductions automatically based on annual salary.
*   **Payslips:** Auto-generation of detailed payslips stored as records.
*   **Components:** Handles Basic, HRA, Special Allowances, PF, Tax, and LOP (Loss of Pay) deductions.

### E. Asset Management
*   **Inventory:** Track Laptops, Mobiles, Licenses, etc.
*   **Lifecycle:** Manage status (Available, Assigned, Maintenance, Retired).
*   **Assignment:** Easy flow to assign/unassign assets to employees with history tracking.

### F. Security & Settings
*   **Biometric Login:** Support for WebAuthn (Passkeys) for secure, password-less login.
*   **Audit Logging:** Critical actions are logged (Who, What, When) for compliance.
*   **Configurable Policies:** Admins can tweak password policies, payroll providers, and module visibility via the UI.

---

## 5. Database Schema Design (Key Collections)

1.  **Users:** Stores auth credentials, role, personal details, professional hierarchy (`managerId`), and status.
2.  **Attendance:** Stores daily logs (`clockIn`, `clockOut`), `breaks` array, location data, and status (`Present`, `Absent`, `Late`).
3.  **Leaves:** Stores request details, dates, type, reason, and an embedded `approvalDetails` array for tracking workflow steps.
4.  **Payslips:** Immutable records of generated salary slips, containing calculated tax, earnings, and deductions snapshot.
5.  **Assets:** Inventory items linked to `User` via `assignedTo` field.
6.  **AuditLogs:** Security and compliance trail.

---

## 6. Recent Technical Achievements

*   **Performance Optimization:** Refactored the Payroll API to reduce database round-trips by **90%** using bulk `insertMany` and lookup aggregations.
*   **Robust Error Handling:** Implemented atomic transactions; the system never leaves payroll data in a "half-finished" state.
*   **Maintainability:** Decoupled complex tax logic into a pure utility function (`taxCalculator.ts`), making it easy to update for future fiscal years without touching API logic.
*   **Standardization:** Aligned API endpoints (`/api/leaves`, `/api/users`) with RESTful best practices.
*   **User Experience:** Migrated from browser alerts to `sonner` Toast notifications for a professional, app-like feel.

---

## 7. Future Roadmap

1.  **Mobile Application:** Development of a React Native app for employees to clock in and request leave on the go.
2.  **AI Integration:**
    *   AI-driven resume parsing for Recruitment module.
    *   Chatbot for HR policy queries.
3.  **Advanced Analytics:** Predictive models for employee attrition and budget forecasting.
4.  **Third-Party Integrations:** Direct API links to Slack for notifications and external Banking APIs for salary disbursement.

---

**Report Generated:** February 12, 2026  
**Status:** In Active Development (v2.0 Refinement Phase)
