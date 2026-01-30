# Application Flow Guide

## Visual Walkthrough

### 1. Home Page (/)
```
┌─────────────────────────────────────────────────────┐
│  🏦 GoCardless Banking                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│              🏦 (Large Bank Icon)                   │
│                                                     │
│     Welcome to GoCardless Banking                   │
│                                                     │
│  Connect your bank accounts securely and           │
│  manage them all in one place.                     │
│                                                     │
│  ┌──────────────┐  ┌──────────────────┐           │
│  │ Get Started  │  │ Go to Dashboard  │           │
│  └──────────────┘  └──────────────────┘           │
│                                                     │
│  🛡️ Secure    ⚡ Fast    📈 Smart                  │
└─────────────────────────────────────────────────────┘
```

### 2. Create User (/users/create)
```
┌─────────────────────────────────────────────────────┐
│  👤 Create Your Account                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Full Name:                                        │
│  ┌───────────────────────────────────────────┐    │
│  │ John Doe                                  │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  Email Address:                                    │
│  ┌───────────────────────────────────────────┐    │
│  │ john@example.com                          │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │        ✓ Create Account                    │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 3. Dashboard (/dashboard)
```
┌─────────────────────────────────────────────────────┐
│  📊 Welcome, John Doe!                              │
│  john@example.com                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Connected │  │  Total   │  │  Quick   │        │
│  │  Banks   │  │ Accounts │  │ Actions  │        │
│  │    2     │  │    5     │  │ [+Add]   │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  🏦 Your Bank Connections                          │
│  ┌─────────────────────────────────────────────┐  │
│  │ Barclays Bank          ✓ Active   [3 acct]  │  │
│  │ Connected on Jan 15, 2025                   │  │
│  ├─────────────────────────────────────────────┤  │
│  │ HSBC                   ✓ Active   [2 acct]  │  │
│  │ Connected on Jan 20, 2025                   │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 4. Select Bank (/banks/select)
```
┌─────────────────────────────────────────────────────┐
│  🏦 Select Your Bank                                │
├─────────────────────────────────────────────────────┤
│  Search: ┌──────────────────────────────────┐     │
│          │ 🔍 Search for your bank...       │     │
│          └──────────────────────────────────┘     │
│                                                     │
│  ┌────────────────────┐ ┌────────────────────┐   │
│  │ 🏦 Barclays        │ │ 🏦 HSBC            │   │
│  │ BIC: BARCGB22      │ │ BIC: HSBCGB2L      │   │
│  │ 🌐 GB, IE          │ │ 🌐 GB              │   │
│  │  [Connect →]       │ │  [Connect →]       │   │
│  └────────────────────┘ └────────────────────┘   │
│                                                     │
│  ┌────────────────────┐ ┌────────────────────┐   │
│  │ 🏦 Lloyds Bank     │ │ 🏦 NatWest         │   │
│  │ BIC: LOYDGB21      │ │ BIC: NWBKGB2L      │   │
│  │ 🌐 GB              │ │ 🌐 GB              │   │
│  │  [Connect →]       │ │  [Connect →]       │   │
│  └────────────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 5. OAuth Flow (External - GoCardless)
```
User clicks "Connect" → Redirects to GoCardless
         ↓
GoCardless Authorization Page
         ↓
User logs in and authorizes
         ↓
Redirects back to /banks/callback
         ↓
App syncs accounts automatically
         ↓
Redirects to /banks/accounts
```

### 6. Accounts Page (/banks/accounts)
```
┌─────────────────────────────────────────────────────┐
│  💳 My Bank Accounts            [+ Add Bank]        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────────────┐ ┌──────────────────┐  │
│  │ Current Account    [✓] │ │ Savings Account  │  │
│  │ Barclays              │ │ Barclays      [ ]│  │
│  │ ────────────────────  │ │ ───────────────  │  │
│  │ 💳 GB29NWBK...        │ │ 💳 GB29NWBK...   │  │
│  │ 👤 John Doe           │ │ 👤 John Doe      │  │
│  │ 💰 GBP                │ │ 💰 GBP           │  │
│  │                       │ │                  │  │
│  │ ✓ Enabled             │ │ ⏸ Disabled       │  │
│  │ Added Jan 15, 2025    │ │ Added Jan 15     │  │
│  └────────────────────────┘ └──────────────────┘  │
│                                                     │
│  ┌────────────────────────┐ ┌──────────────────┐  │
│  │ Business Account   [✓] │ │ Credit Card [✓]  │  │
│  │ HSBC                  │ │ HSBC             │  │
│  │ ────────────────────  │ │ ───────────────  │  │
│  │ 💳 GB29HBUK...        │ │ 💳 N/A           │  │
│  │ 👤 John Doe Ltd       │ │ 👤 John Doe      │  │
│  │ 💰 GBP                │ │ 💰 GBP           │  │
│  │                       │ │                  │  │
│  │ ✓ Enabled             │ │ ✓ Enabled        │  │
│  │ Added Jan 20, 2025    │ │ Added Jan 20     │  │
│  └────────────────────────┘ └──────────────────┘  │
│                                                     │
│  ℹ️ Tip: Use the toggle switch to enable or        │
│  disable accounts.                                 │
└─────────────────────────────────────────────────────┘
```

## Controller → View Mapping

### HomeController
- `GET /` → `index.leaf` - Landing page
- `GET /dashboard` → `dashboard.leaf` - User dashboard

### UserController
- `GET /users/create` → `create-user.leaf` - User registration form
- `POST /users/create` → Redirect to `/dashboard`
- `GET /users/:id` → `user-profile.leaf` - User profile

### BankController
- `GET /banks/select` → `bank-selection.leaf` - Bank selection page
- `POST /banks/connect` → Redirect to GoCardless OAuth
- `GET /banks/callback` → Process OAuth, redirect to `/banks/accounts`
- `GET /banks/accounts` → `accounts.leaf` - Account management
- `POST /banks/accounts/:id/toggle` → Toggle account, redirect back

## Data Flow

```
User Input → Controller → Service (GoCardless API) → Database → View

Example: Connect Bank Flow
1. User selects bank on bank-selection.leaf
2. BankController.initiateConnection receives POST
3. GoCardlessService.createRequisition called
4. BankConnection saved to database
5. User redirected to GoCardless OAuth
6. GoCardless redirects to /banks/callback
7. BankController.handleCallback processes
8. GoCardlessService.getRequisition fetches accounts
9. BankAccount records created in database
10. User redirected to accounts.leaf
```

## Session Management

```
User creates account → Session stores user_id
                      ↓
All subsequent requests check session for user_id
                      ↓
If no user_id → Redirect to create-user.leaf
If user_id exists → Load user data for views
```

## Database Relationships

```
User (1) ──→ (Many) BankConnection (1) ──→ (Many) BankAccount
  ↓                      ↓                           ↓
id: UUID            user_id: UUID            bank_connection_id: UUID
email              institution_id            account_id
name               requisition_id            iban
                   status                    is_enabled
```

## API Integration Points

```
GoCardless API Calls:
├── Token Management
│   └── POST /token/new/ (automatic, cached)
│
├── Institutions
│   └── GET /institutions/?country=GB
│
├── Requisitions (Connections)
│   ├── POST /requisitions/ (create)
│   └── GET /requisitions/{id}/ (get details)
│
└── Accounts
    └── GET /accounts/{id}/details/ (fetch account info)
```

## UI/UX Features

✨ **Interactive Elements:**
- Search filter on bank selection page
- Toggle switches for enabling/disabling accounts
- Hover effects on bank cards
- Status badges with colors (green=active, yellow=pending, red=disabled)
- Responsive design with Bootstrap 5
- Icons from Bootstrap Icons

🎨 **Design Features:**
- Gradient background (purple theme)
- Card-based layout
- Smooth transitions
- Mobile-responsive
- Clean, modern interface

## Testing the Application

### Quick Test Flow:
1. Start app: `swift run`
2. Visit: `http://localhost:8080`
3. Click "Get Started"
4. Fill in name/email
5. Click "Add Bank" on dashboard
6. Search for "Sandbox" (for testing)
7. Click "Connect" on Sandbox Finance
8. Complete OAuth flow
9. View accounts on accounts page
10. Toggle accounts on/off

### Expected Results:
- Smooth navigation between pages
- Bank connection creates requisition in GoCardless
- OAuth callback syncs accounts automatically
- Toggle switches update database in real-time
- All data persists across sessions