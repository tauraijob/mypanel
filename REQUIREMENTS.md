# MyPanel - Client & Service Management Platform
## Requirements Document

---

## 📋 Project Overview

**MyPanel** is a comprehensive client and service management platform designed for freelancers and small businesses who offer multiple services including:
- Website Development
- Software Development
- Web Hosting
- Domain Registration
- Any other recurring or one-time services/projects

### The Problem We're Solving
Currently, you're using Wave for invoicing but **missing critical service renewal dates** because Wave lacks:
- Automated renewal tracking
- Payment due date reminders
- Service lifecycle management (activation, suspension, etc.)

### The Solution
A WHMCS-like platform that combines:
- Client management
- Quotation generation
- Invoicing with recurring billing support
- **Automated email reminders** for renewals (to both admin AND clients)
- Service lifecycle management (activate, suspend, unsuspend, terminate)

---

## 🎯 Core Features

### 1. Client Management
| Feature | Description |
|---------|-------------|
| Client Profiles | Store client name, email, phone, company, address, notes |
| Client Dashboard | View all services, invoices, and payment history per client |
| Client Portal (Optional) | Allow clients to log in and view their services/invoices |
| Client Status | Active, Inactive, Suspended |

### 2. Service/Product Management
| Feature | Description |
|---------|-------------|
| Service Categories | Hosting, Websites, Software, Domains, Custom Projects, etc. |
| Billing Cycles | One-time, Monthly, Quarterly, Semi-Annually, Annually, Biennially |
| Service Status | Pending, Active, Suspended, Terminated, Cancelled |
| Service Dates | Start date, Next due date, Expiry date |
| Custom Pricing | Per-client pricing for each service |

### 3. Quotations
| Feature | Description |
|---------|-------------|
| Create Quotes | Line items with descriptions, quantities, prices |
| Quote Status | Draft, Sent, Accepted, Declined, Expired |
| Quote Validity | Set expiration dates for quotes |
| Convert to Invoice | One-click conversion of accepted quotes to invoices |
| PDF Generation | Download/Email quotes as PDF |

### 4. Invoicing (Wave-like Features)
| Feature | Description |
|---------|-------------|
| Create Invoices | Manual or auto-generated from services |
| Invoice Status | Draft, Sent, Paid, Partially Paid, Overdue, Cancelled |
| Line Items | Multiple items per invoice with tax support |
| Payment Recording | Record partial or full payments |
| Recurring Invoices | Auto-generate invoices based on billing cycles |
| Invoice Numbering | Auto-increment with customizable prefix |
| PDF Generation | Download/Email invoices as PDF |
| Payment History | Track all payments per invoice |

#### 📄 Professional Invoice Template Features
| Feature | Description |
|---------|-------------|
| **Company Logo** | Upload and display your company logo on all invoices |
| **Company Details** | Company name, address, phone, email, website, tax ID |
| **Billing Address** | Client's billing address displayed prominently |
| **Service Address** | Optional separate service/shipping address |
| **Bank Details** | Your payment/bank account information |
| **Terms & Conditions** | Custom payment terms, late fees, notes |
| **Custom Footer** | Thank you message, support contact info |
| **Branding Colors** | Invoice styled with your brand colors (Navy blue theme) |

### 5. Service Lifecycle Management
| Feature | Description |
|---------|-------------|
| **Activation** | Mark service as active when payment is received |
| **Suspension** | Suspend service when payment is overdue (manual or auto) |
| **Unsuspension** | Reactivate service when payment is received |
| **Termination** | Permanently end a service |
| **Renewal Processing** | Track renewal dates and generate renewal invoices |

### 6. 📧 Email Notifications (CRITICAL FEATURE)

#### Reminders TO YOU (Admin)
| Trigger | When |
|---------|------|
| Renewal Coming Up | 14 days, 7 days, 3 days, 1 day before due date |
| Payment Overdue | 1 day, 3 days, 7 days, 14 days after due date |
| Service Expiring | When a service is about to expire |
| Daily Summary | Morning digest of all pending renewals/overdue items |

#### Notifications TO CLIENTS
| Trigger | When |
|---------|------|
| Invoice Created | When a new invoice is generated |
| Payment Reminder | 7 days, 3 days, 1 day before due date |
| Overdue Notice | 1 day, 7 days after due date |
| Service Suspended | When their service is suspended |
| Service Activated | When their service is activated |
| Service Unsuspended | When their service is reactivated |
| Quote Sent | When you send them a quote |

### 7. Dashboard & Reports
| Feature | Description |
|---------|-------------|
| Overview Dashboard | Total clients, active services, pending invoices, revenue |
| Upcoming Renewals | List of services due in the next 7/14/30 days |
| Overdue Invoices | List of unpaid invoices past due date |
| Revenue Reports | Monthly/Yearly income breakdown |
| Client Activity | Recent actions and payments |

---

## 🔧 Technical Specifications

### Technology Stack
| Component | Technology |
|-----------|------------|
| Framework | **Nuxt 3** (Vue.js 3 full-stack framework) |
| Frontend | **Vue.js 3** with Composition API & TypeScript |
| UI Framework | **Tailwind CSS** + **Nuxt UI** (beautiful components) |
| Database | **MySQL** (running on XAMPP) |
| Database Name | **my_panel** |
| ORM | **Prisma** (type-safe database access) |
| Email Service | **Nodemailer** (with SMTP - Gmail, Outlook, or custom) |
| PDF Generation | **jsPDF** + **html2canvas** for invoice PDFs |
| Scheduler | **node-cron** (for automated email reminders) |
| Authentication | **Nuxt Auth** with JWT sessions |
| Icons | **Heroicons** / **Lucide Icons** |

### Why This Stack?
- **Nuxt 3**: Full-stack Vue framework with SSR, API routes, and excellent DX.
- **MySQL on XAMPP**: Reliable, widely-used database. Easy to manage with phpMyAdmin.
- **Prisma**: Modern ORM with auto-generated types and easy migrations.
- **Vue 3**: Reactive, component-based UI with excellent performance.
- **Tailwind CSS**: Utility-first CSS for rapid, beautiful UI development.

### 🎨 Design Theme
| Element | Value |
|---------|-------|
| **Primary Color** | Navy Dark Blue (`#0f172a`, `#1e293b`, `#334155`) |
| **Accent Color** | Royal Blue (`#3b82f6`) |
| **Background** | Dark slate gradients |
| **Cards** | Glassmorphism with subtle borders |
| **Typography** | Clean, modern sans-serif (Inter, Plus Jakarta Sans) |
| **Style** | Premium, professional, sleek dark theme |

The UI will feature:
- ✨ Smooth animations and micro-interactions
- 🌊 Gradient backgrounds with navy blue tones
- 💎 Glass-effect cards with subtle shadows
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎯 Clean data tables with sorting/filtering
- 📊 Beautiful charts for analytics

---

## 📐 Database Structure (Simplified)

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Clients   │────<│    Services     │────<│   Invoices   │
└─────────────┘     └─────────────────┘     └──────────────┘
       │                    │                      │
       │                    │                      │
       └────────────────────┼──────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   Quotations  │
                    └───────────────┘
```

### Tables Overview
1. **clients** - Client information
2. **services** - Services/products assigned to clients
3. **service_categories** - Categories like Hosting, Website, etc.
4. **invoices** - All invoices
5. **invoice_items** - Line items for invoices
6. **quotations** - All quotes
7. **quotation_items** - Line items for quotes
8. **payments** - Payment records
9. **email_logs** - Track sent emails
10. **settings** - App configuration (email settings, company info)

---

## 🖥️ User Interface Mockup

### Main Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 MyPanel                          [Notifications] [Profile]  │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│ │Dashboard │ │ Clients  │ │ Services │ │ Invoices │ │ Quotes  ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Cards
```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  Total Clients │ │ Active Services│ │ Pending Amount │ │ This Month     │
│      45        │ │      78        │ │   $12,500      │ │   $8,200       │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘

┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  ⚠️ UPCOMING RENEWALS (7 days)  │  │  🔴 OVERDUE INVOICES            │
│  ───────────────────────────────│  │  ───────────────────────────────│
│  • John's Hosting - Dec 28      │  │  • INV-001 - $500 (3 days)      │
│  • ABC Corp Website - Dec 30    │  │  • INV-005 - $1200 (7 days)     │
│  • XYZ Software License - Dec 31│  │  • INV-012 - $300 (14 days)     │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

---

## ⚡ Workflow Examples

### Workflow 1: New Hosting Client
1. **Create Client** → Add client details
2. **Create Quote** → Send hosting quote (optional)
3. **Quote Accepted** → Convert to Invoice
4. **Payment Received** → Record payment
5. **Activate Service** → Mark hosting as active
6. **Auto-Reminders** → System tracks renewal date and sends reminders

### Workflow 2: Renewal Cycle
```
Day -14: System sends reminder to YOU: "John's hosting renews in 14 days"
Day -7:  System sends reminder to BOTH you and John
Day -3:  System sends another reminder to John
Day 0:   Invoice auto-generated for renewal
Day +1:  If unpaid, overdue notice sent
Day +7:  If still unpaid, option to suspend service
```

### Workflow 3: Service Suspension
1. Invoice becomes overdue
2. You click "Suspend Service" (or auto-suspend after X days)
3. Client receives "Service Suspended" email
4. Client pays invoice
5. You click "Unsuspend Service"
6. Client receives "Service Reactivated" email

---

## ✅ Confirmation Checklist

Please confirm I've understood your requirements correctly:

### Must-Have Features
- [ ] Client management with full profiles
- [ ] Multiple service types (Hosting, Website, Software, etc.)
- [ ] Quotation creation with PDF export
- [ ] Invoice creation with PDF export
- [ ] **Automated email reminders for renewals (to you AND clients)**
- [ ] Service activation/suspension/unsuspension
- [ ] Recurring billing cycle tracking
- [ ] Dashboard with upcoming renewals and overdue invoices
- [ ] Payment recording and tracking

### Nice-to-Have Features (Phase 2)
- [ ] Client login portal (so clients can view their own invoices)
- [ ] Online payment integration (PayPal, Stripe)
- [ ] Expense tracking
- [ ] Profit/Loss reports
- [ ] Multi-currency support
- [ ] Custom email templates
- [ ] Automated service suspension after X overdue days

---

## 🚀 Implementation Plan

### Phase 1: Core System (MVP)
1. Project setup and database design
2. Client management (CRUD)
3. Service/Product management
4. Invoice creation and management
5. Basic dashboard

### Phase 2: Notifications & Automation
6. Email configuration and sending
7. Automated renewal reminders
8. Scheduled jobs for email notifications
9. Overdue tracking and alerts

### Phase 3: Polish & Additional Features
10. Quotation management
11. PDF generation for invoices/quotes
12. Reports and analytics
13. Settings and customization

---

## ❓ Configuration (Set in Settings)

These will be configurable in the admin settings panel:

1. **Email Provider**: Configure SMTP settings (Gmail, Outlook, or custom domain)
2. **Company Branding**: Upload logo, set company name, address, contact info
3. **Currency**: Set default currency (configurable per invoice if needed)
4. **Invoice Prefix**: Customize invoice numbering (e.g., INV-001, MYPANEL-001)
5. **Reminder Schedule**: Configure when to send reminder emails

## 🖥️ Environment Requirements

| Requirement | Details |
|-------------|---------|
| **XAMPP** | MySQL server running on default port 3306 |
| **Node.js** | v18+ (for Nuxt 3) |
| **Database** | MySQL database named `my_panel` |

---

## 📝 Summary

**MyPanel** will be your all-in-one solution to:
- ✅ Never miss a renewal date again
- ✅ Keep clients informed with automated emails
- ✅ Track all your services across different categories
- ✅ Create professional quotes and invoices
- ✅ Manage service lifecycle (activate, suspend, unsuspend)
- ✅ See your business health at a glance

---

**Please review this document and let me know:**
1. If I've understood everything correctly
2. Answers to the questions above
3. Any features to add or remove
4. If you're ready to start building!


