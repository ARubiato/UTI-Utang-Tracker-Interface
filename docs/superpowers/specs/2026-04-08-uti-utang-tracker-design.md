# UTI - Utang Tracker Interface — Design Spec

## Overview

A small debt tracker web app built with Next.js. Users add people who have utang (debt), then add lists of items each person owes with amount, monthly payment, and number of months. The app tracks payments and shows remaining balances.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **ORM:** Prisma
- **Database:** SQLite (file-based, zero config)
- **Language:** TypeScript

## Data Model

### Person

| Field       | Type     | Notes                  |
|-------------|----------|------------------------|
| id          | String   | cuid, primary key      |
| name        | String   | Person's name          |
| createdAt   | DateTime | Auto-set               |
| updatedAt   | DateTime | Auto-updated           |

Has many `DebtItem`.

### DebtItem

| Field          | Type     | Notes                           |
|----------------|----------|---------------------------------|
| id             | String   | cuid, primary key               |
| personId       | String   | FK to Person                    |
| itemName       | String   | What the debt is for            |
| totalAmount    | Float    | Total amount owed               |
| monthlyPayment | Float    | Payment per month               |
| months         | Int      | Number of months to pay         |
| startDate      | DateTime | When the debt started           |
| createdAt      | DateTime | Auto-set                        |
| updatedAt      | DateTime | Auto-updated                    |

Has many `Payment`.

### Payment

| Field      | Type     | Notes                     |
|------------|----------|---------------------------|
| id         | String   | cuid, primary key         |
| debtItemId | String   | FK to DebtItem            |
| amount     | Float    | Amount paid               |
| paidAt     | DateTime | When payment was made     |
| createdAt  | DateTime | Auto-set                  |

### Derived Values

- **Remaining balance** = `totalAmount - sum(payments.amount)`
- **Months remaining** = `ceil(remainingBalance / monthlyPayment)`
- **Progress** = `sum(payments.amount) / totalAmount * 100`

## Pages

### 1. Dashboard (`/`)

- **Summary bar** at the top: total people, total overall debt, total monthly obligations
- **Person cards** in a grid: each shows name, number of debt items, total utang, total monthly payment
- **Add Person** button opens a modal with a name field
- Click a person card navigates to their detail page

### 2. Person Detail (`/person/[id]`)

- **Person header**: name, edit/delete buttons
- **Debt items list**: each item displayed as a card/row showing:
  - Item name
  - Total amount
  - Monthly payment
  - Months (total and remaining)
  - Amount paid so far
  - Remaining balance
  - Progress bar (amount paid / total)
  - "Record Payment" button
- **Add Debt Item** button opens a modal with fields: item name, total amount, monthly payment, months, start date
- Back link to dashboard

## API Routes (Next.js Route Handlers)

| Method | Route                          | Action                        |
|--------|--------------------------------|-------------------------------|
| GET    | /api/persons                   | List all persons with summary |
| POST   | /api/persons                   | Create a person               |
| GET    | /api/persons/[id]              | Get person with debt items    |
| PUT    | /api/persons/[id]              | Update person                 |
| DELETE | /api/persons/[id]              | Delete person (cascades)      |
| GET    | /api/persons/[id]/debts        | List debt items for person    |
| POST   | /api/persons/[id]/debts        | Add debt item to person       |
| GET    | /api/debts/[id]                | Get debt item with payments   |
| PUT    | /api/debts/[id]                | Update debt item              |
| DELETE | /api/debts/[id]                | Delete debt item (cascades)   |
| POST   | /api/debts/[id]/payments       | Record a payment              |
| GET    | /api/debts/[id]/payments       | List payments for debt item   |

## UI Components

| Component        | Purpose                                          |
|------------------|--------------------------------------------------|
| SummaryBar       | Top-level stats on dashboard                     |
| PersonCard       | Person summary card on dashboard grid            |
| DebtItemRow      | Debt item display with progress bar              |
| AddPersonModal   | Form modal to add/edit a person                  |
| AddDebtModal     | Form modal to add/edit a debt item               |
| PaymentButton    | Quick action to record a payment on a debt item  |
| ProgressBar      | Visual bar showing paid vs total                 |
| ConfirmDialog    | Confirmation before delete actions               |

## Behavior Notes

- Deleting a person cascades to their debt items and payments.
- Deleting a debt item cascades to its payments.
- Recording a payment defaults the amount to the item's `monthlyPayment` value (editable).
- When remaining balance hits 0, the item shows as "Fully Paid".
- Months remaining recalculates based on actual remaining balance, not original months.
- Start date defaults to today when adding a new debt item.

## Non-Goals (for now)

- Authentication / multi-user
- Interest rate calculations
- Export/import
- Notifications or reminders
- Dark mode
