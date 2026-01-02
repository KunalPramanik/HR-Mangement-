# HR Portal v2.0 - Enterprise Edition

## Overview
HR Portal is a comprehensive, production-ready Human Resource Management System (HRMS) built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. It is designed to manage the entire employee lifecycle, from recruitment to offboarding.

## Core Modules
*   **👥 Employee Management**: Full directory, profile management, and role-based access control (RBAC).
*   **🏢 Recruitment (ATS)**: Job posting lifecycle (Create/Edit/Close), referral tracking, and candidate management.
*   **💻 Asset Management**: IT asset tracking with assignment, maintenance, and lifecycle history.
*   **🚀 Project Management**: Project creation, task assignment, status tracking, and progress visualization.
*   **📅 Attendance & Leaves**: Geo-fenced clock-in/out, leave request workflows, and attendance regularization.
*   **💰 Payroll**: Automated salary slip generation, tax calculations, and payroll history.

## Tech Stack
*   **Framework**: Next.js 15 (App Router)
*   **Database**: MongoDB (Mongoose ODM)
*   **Styling**: Tailwind CSS
*   **Auth**: NextAuth.js
*   **Security**: Role-Based Access Control (Admin, HR, Manager, Employee)

## Getting Started

### Prerequisites
*   Node.js 18+
*   MongoDB Instance

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/hr-portal.git
    cd hr-portal
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=mongodb://localhost:27017/hr-portal
    NEXTAUTH_SECRET=your-secret-key
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  Seed the Database (Optional):
    ```bash
    npm run seed
    ```

5.  Run the Development Server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Credentials (Seed Data)
*   **Admin**: `admin@company.com` / `password123`
*   **HR**: `hr@company.com` / `password123`
*   **Manager**: `manager@company.com` / `password123`
*   **Employee**: `employee@company.com` / `password123`

## License
Private Property. All Rights Reserved.
