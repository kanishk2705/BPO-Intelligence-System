# 🏢 BPO Management System (BPO Portal)

An enterprise-grade, full-stack web application designed to streamline Business Process Outsourcing (BPO) floor operations. This system handles the complete lifecycle of customer support ticketing, employee shift scheduling, and automated payroll generation.

**Academic Submission:** Developed as a comprehensive full-stack engineering project for the BE CSE program.

---

## 🚀 Key Features

### 1. Agent Operations (Floor Staff)
* **Live Workspace:** Agents can log customer calls and select issue categories in real-time.
* **Ticket Management:** View historical tickets with dynamic search and filtering capabilities.
* **Schedule Viewing:** Access assigned shifts with visual indicators for morning/evening/night slots.
* **Payslip Access:** View and download securely generated monthly payslips.

### 2. Team Lead Portal (Floor Supervisors)
* **Escalation Inbox:** A dedicated queue for tickets that require supervisor intervention (Inbox Zero methodology).
* **Shift Assignment:** A database-validated scheduling module that prevents double-booking agents.
* **Live Floor Analytics:** A dynamic dashboard tracking the active roster, open tickets, and resolution rates in real-time.

### 3. Admin Command Center (HR & System Admins)
* **Automated Payroll Engine:** A financial algorithm that calculates monthly gross pay, applies night-shift premiums, deducts flat-rate taxes (15%), and stores net take-home pay.
* **Employee Management:** Secure, background API creation of new system users (Agents, Leads, Admins) using God-mode Auth.
* **Executive Dashboard:** High-level metrics tracking total lifetime tickets, active users, and the current month's payroll expenditures.

---

## 🛠️ Technology Stack

* **Frontend Environment:** React.js (Vite), Tailwind CSS, Lucide React (Icons), React Hot Toast.
* **Backend Server:** Node.js, Express.js.
* **Database & Authentication:** Supabase (PostgreSQL), JWT securely stored in local session.
* **Security:** Strict Row Level Security (RLS) policies implemented at the database level to ensure data isolation between roles.

---

## 👥 Team Breakdown & Contributions

This project was built using an Agile methodology, with distinct domain ownership across the 5-person engineering team:

| Team Member | System Role | Primary Responsibilities |
| :--- | :--- | :--- |
| **Kanishk** | Database Architect & Security Lead | Designed the PostgreSQL schema (`profiles`, `tickets`, `shifts`, `payroll`). Implemented all Row Level Security (RLS) policies to protect data layers. |
| **Gopi** | Frontend Engineer (Agent UI) | Built the Agent workspace, ticketing history, and dynamic shift calendar components. Focused on state management and UI/UX. |
| **Meena** | Frontend Engineer (Management UI) | Developed the Lead Escalation inbox, Team Overview analytics dashboard, and the Admin Employee directory. Implemented client-side search/filter logic. |
| **Petchiammal** | Backend API Developer (Core) | Engineered the Express.js REST APIs for ticket creation, category extraction, and the shift scheduling endpoints (including DB `upsert` validations). |
| **Zainab Nadhira** | Backend API Developer (Finance) | Architected the automated Payroll calculation algorithm and the secure `God-Mode` user creation API using Supabase Service Keys. |

---

## ⚙️ Local Setup Instructions

To run this project locally for evaluation:

### 1. Database Configuration
Ensure a Supabase project is active with the following tables configured with strict RLS:
`profiles`, `tickets`, `shifts`, `payroll`

### 2. Environment Variables
You will need two `.env` files.

**Frontend (`client/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key