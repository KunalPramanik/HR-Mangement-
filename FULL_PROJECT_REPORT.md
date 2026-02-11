# Mindstar HR Portal - Comprehensive Project Report

**Version:** 2.1
**Date:** February 12, 2026
**Status:** In Development (Advanced Phase)

---

## 1. Executive Summary
**Mindstar HR Portal** is an enterprise-grade Human Resource Management System (HRMS) designed to modernize workforce management. It moves beyond simple data entry to provide intelligent, automated, and secure HR operations. The platform integrates core HR functions—Attendance, Leave, Payroll, and Performance—into a unified "Soft-UI" glassmorphism interface, ensuring a premium user experience.

Recent updates have introduced advanced capabilities including an **AI HR Assistant**, **Geolocation-verified Attendance**, **Asset Lifecycle Management**, and comprehensive **Security Audit Logging**.

---

## 2. Technology Stack

### Frontend & Core
*   **Framework:** Next.js 15 (App Router) - Utilizing Server Components for performance.
*   **Language:** TypeScript - For strict type safety across the entire application.
*   **Styling:** Tailwind CSS - Custom "Prism Soft-UI" design system with glassmorphism effects.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) & Server Actions.

### Backend & Database
*   **API:** Next.js API Routes (Serverless functions).
*   **Database:** MongoDB - Scalable NoSQL storage for flexible schemas (e.g., dynamic asset attributes).
*   **ORM:** Mongoose - Schema validation and business logic hooks.
*   **Authentication:** NextAuth.js v4 - Secure session management with Role-Based Access Control (RBAC).

### Key Libraries
*   **UI/UX:** `sonner` (Toasts), `Material Symbols` (Iconography).
*   **Utilities:** `date-fns` (Date logic), `zod` (Validation).
*   **Security:** `bcryptjs` (Hashing).

---

## 3. System Modules & Data Schema

### A. User Management (Core)
The central repository of employee data.
*   **Primary Interface:** `/directory` (Grid View), `/profile` (Detailed View).
*   **Key Fields:**
    *   **Identity:** `employeeId` (Unique), `email`, `password` (Hashed), `role`.
    *   **Personal:** `firstName`, `lastName`, `dateOfBirth`, `phoneNumber`, `address`, `emergencyContact`.
    *   **Professional:** `department`, `position`, `managerId` (Reporting manager), `hireDate`, `workLocation`.
    *   **Financial:** `salaryInfo` (CTC, Basic, HRA), `bankInfo` (Account, IFSC), `statutoryInfo` (PAN, UAN).
    *   **Settings:** `geoRestrictionEnabled` (Boolean), `webauthnLoginToken` (Biometric).

### B. Onboarding Module
Streamlines the addition of new talent to the organization.
*   **Primary Interface:** `/onboarding/new` (Form Wizard).
*   **Form Fields:**
    *   **Basic:** First Name, Last Name, Work Email.
    *   **Role Details:** Department (Dropdown), Role/Title, Start Date.
    *   **Logistics:** Work Location (Remote/Office), Reporting Manager.
    *   **Contact:** Phone Number.

### C. Attendance & Geolocation
Smart tracking of employee work hours with location verification.
*   **Primary Interface:** `/dashboard` (Clock-in Widget).
*   **Features:**
    *   **Geolocation:** Verifies user coordinates against allowed office radius (`workLocation`).
    *   **Status Toggles:** On Duty / Break / Off Duty.
    *   **Visual Indicators:** "Location Verified" (Green) / "Location Error" (Red).

### D. Asset Management (New)
Full lifecycle tracking of company hardware and software licenses.
*   **Primary Interface:** `/assets` (List & Grid Views).
*   **Key Fields:**
    *   **Identification:** `assetId`, `name`, `serialNumber`, `type` (Laptop, Mobile, Furniture).
    *   **Status:** `Available`, `Assigned`, `Maintenance`, `Retired`.
    *   **Assignment:** `assignedTo` (User), `assignedDate`.
    *   **Condition:** New, Good, Fair, Poor.

### E. Leave Management
Automated workflow for leave requests and approvals.
*   **Primary Interface:** `/leave/request` (Employee), `/approvals/leaves` (Manager).
*   **Key Fields:**
    *   **Request:** `leaveType` (Annual, Sick, Unpaid), `startDate`, `endDate`, `reason`.
    *   **Logic:** `totalDays` calculation, `attachments` (Medical certs).
    *   **Workflow:** `status` (Pending/Approved/Rejected), `approverId`, `approverComments`.

### F. Tasks & Productivity
Lightweight task management for daily operations.
*   **Primary Interface:** `/tasks` (Kanban/List).
*   **Key Fields:** `title`, `description`, `dueDate`, `priority` (High/Med/Low), `status`.
*   **Features:** Interactive "Complete" toggle, Edit/Delete actions.

### G. Security & Audit Logs (New)
Compliance trail for system administrators.
*   **Primary Interface:** `/admin/audit-logs`.
*   **Key Fields:** `timestamp`, `user` (Actor), `action` (CREATE_USER, PAYROLL_RUN), `target` (Affected Entity), `ipAddress`.
*   **Search:** Full-text search across logs.

---

## 4. Key Unique Features

1.  **AI HR Assistant:**
    *   A floating chatbot on the dashboard (`AiAssistant.tsx`) that answers employee queries about policies and leave balances instantly.
    *   *Simulated Intelligence:* Provides context-aware responses based on keywords.

2.  **Geolocation Enforcement:**
    *   Prevents "Clock In" actions unless the browser successfully verifies coordinates, ensuring secure remote/on-site attendance.

3.  **"Prism" Design System:**
    *   A custom visual language using soft shadows, rounded corners (`rounded-3xl`), and translucent glass backgrounds, setting it apart from standard bootstrap-style HR apps.

---

## 5. Future Roadmap

| Phase | Feature | Description |
| :--- | :--- | :--- |
| **Q2 2026** | **Biometric Login** | Replaces passwords with WebAuthn/Passkeys (Fingerprint/FaceID). |
| **Q3 2026** | **Payroll Automation** | 1-Click processing with integration to Bank APIs for direct deposits. |
| **Q4 2026** | **Advanced Analytics** | PowerBI-style dashboards for attrition prediction and engagement metrics. |

---
*Generated by Mindstar Development Team*
