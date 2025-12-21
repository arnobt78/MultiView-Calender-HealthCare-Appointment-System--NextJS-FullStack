# MultiView Calendar Health Care Appointment Management System – Next.js, Postgresql FullStack Project (Admin Control Panel Permission Dashboard)

A modern, full-featured calendar and appointment management web application built with Next.js, React, and Supabase. Perfect for healthcare, clinics, and organizations needing robust scheduling, filtering, and client management with multiple calendar views, instant search, advanced filtering, and a clean, responsive UI.

**Live Demo:** [https://doctor-patient-calendar-appointment.vercel.app/](https://doctor-patient-calendar-appointment.vercel.app/)

![Screenshot 2025-06-26 at 17 07 38](https://github.com/user-attachments/assets/eedf5a4c-5cf9-4cea-bbd0-878660a9ab15)
![Screenshot 2025-06-26 at 17 09 03](https://github.com/user-attachments/assets/fe0ad75e-c74a-4a7a-8c47-30ef1cf577f2)
![Screenshot 2025-06-26 at 17 09 25](https://github.com/user-attachments/assets/366dea4d-e0df-4b60-a383-919b8504eba3)
![Screenshot 2025-06-26 at 17 09 40](https://github.com/user-attachments/assets/7d2f3a91-a868-4e35-8542-e180581a612e)
![Screenshot 2025-06-26 at 17 10 49](https://github.com/user-attachments/assets/5e2c782c-3f9d-42a8-808a-c73972d2c30e)
![Screenshot 2025-08-11 at 02 35 40](https://github.com/user-attachments/assets/72c19730-29d6-4412-a459-2547a3a64180)
![Screenshot 2025-08-11 at 02 36 34](https://github.com/user-attachments/assets/12ec38cd-1e4d-4735-95e8-754571651c25)
![Screenshot 2025-08-11 at 02 36 52](https://github.com/user-attachments/assets/0c30a062-bbfe-4a1f-9610-2da9039d71a8)
![Screenshot 2025-08-11 at 02 37 00](https://github.com/user-attachments/assets/b64979fb-e6ee-4933-9fe7-15647fa821ab)
![Screenshot 2025-08-11 at 02 37 15](https://github.com/user-attachments/assets/7d6a4978-e189-4bcd-b115-d4d9257f1623)
![Screenshot 2025-08-11 at 02 37 40](https://github.com/user-attachments/assets/05814743-73b3-47d9-a10f-1c302519b7a8)
![Screenshot 2025-08-11 at 02 39 00](https://github.com/user-attachments/assets/0b0af4f5-e5c5-4637-9d02-1eaba7ab9978)
![Screenshot 2025-08-11 at 02 40 47](https://github.com/user-attachments/assets/ac8c4241-2ffe-48da-9136-97cbb41b7401)

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#️-running-the-project)
- [Project Walkthrough](#-project-walkthrough)
- [API Endpoints](#-api-endpoints)
- [Components & Reusability](#-components--reusability)
- [Routes & Navigation](#️-routes--navigation)
- [Key Functionalities](#-key-functionalities)
- [Code Examples](#-code-examples)
- [Database Schema](#️-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Keywords](#️-keywords)
- [Conclusion](#-conclusion)

---

## 🎯 Project Overview

This is a comprehensive appointment management system designed for healthcare providers, clinics, and service businesses. It provides a complete solution for scheduling, managing appointments, handling invitations, and controlling access permissions. The application features three different calendar views (List, Week, Month), real-time filtering, search functionality, and a robust permission system.

### Key Highlights

- **Multi-View Calendar**: Switch between List, Week, and Month views
- **Real-time Search**: Instant search across all appointment fields
- **Advanced Filtering**: Filter by category, patient, date, and status
- **Invitation System**: Send and manage appointment/dashboard invitations
- **Permission Management**: Role-based access control (owner, full, write, read)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Type-Safe**: Built with TypeScript for better developer experience
- **Modern UI**: Clean interface using Tailwind CSS and shadcn/ui components

---

## ✨ Features

### Calendar Views

- **List View**: Appointments grouped by date in a scrollable list format
- **Week View**: Weekly calendar grid showing appointments in time slots
- **Month View**: Monthly calendar grid with appointment indicators

### Appointment Management

- Create, read, update, and delete appointments
- Add attachments, notes, activities, and assignees
- Set categories, locations, and status (done, pending, alert)
- Link appointments to patients and relatives

### Search & Filtering

- Real-time search across title, notes, location, and patient information
- Filter by category, patient, date range, and status
- Combine multiple filters for precise results

### Invitation System

- Send invitations for appointment access
- Send invitations for dashboard access
- Email notifications with secure token-based links
- Track invitation status (pending, accepted, declined)

### Permission System

- **Owner**: Full control (creator of appointment)
- **Full**: Read, write, and delete access
- **Write**: Read and modify access
- **Read**: View-only access

### User Management

- Secure authentication with Supabase Auth
- Email verification required
- User profile management
- Session-based authentication

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.4.10**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Radix UI**: Accessible component primitives
- **date-fns**: Date manipulation and formatting
- **Lucide React**: Icon library

### Backend & Database

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage for attachments

### Additional Libraries

- **Nodemailer**: Email sending functionality
- **UUID**: Secure token generation
- **Redoc**: API documentation

### Development Tools

- **ESLint**: Code linting
- **Turbopack**: Fast bundler (Next.js)
- **TypeScript**: Static type checking

---

## 📁 Project Structure

```bash
multiview-calender-appointment/
├── public/                          # Static assets
│   ├── favicon.ico                  # Site icon
│   └── redoc.html                   # API documentation
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API routes
│   │   │   ├── appointments/        # Appointment endpoints
│   │   │   │   ├── [id]/           # Dynamic route for specific appointment
│   │   │   │   │   ├── route.ts    # GET, PUT, PATCH, DELETE
│   │   │   │   │   └── permissions/ # Permission endpoints
│   │   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   │   └── search/         # Search endpoint
│   │   │   ├── invitations/        # Invitation endpoints
│   │   │   │   ├── accept/         # Accept invitation
│   │   │   │   └── route.ts        # GET, POST invitations
│   │   │   ├── users/              # User search
│   │   │   ├── dashboard/           # Dashboard permissions
│   │   │   └── openapi/            # OpenAPI specification
│   │   ├── accept-invitation/      # Invitation acceptance page
│   │   ├── api-docs/               # API documentation page
│   │   ├── api-status/              # API health check page
│   │   ├── control-panel/           # Permission management
│   │   ├── login/                  # Login page
│   │   ├── logout/                 # Logout page
│   │   ├── register/               # Registration page
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── page.tsx                # Home page (calendar)
│   │   └── AuthLayout.tsx          # Authentication-based layout
│   ├── components/                  # React components
│   │   ├── calendar/               # Calendar-related components
│   │   │   ├── AppointmentDialog.tsx      # Create/edit appointment
│   │   │   ├── AppointmentList.tsx        # List view
│   │   │   ├── CalendarHeader.tsx         # View switcher & navigation
│   │   │   ├── MonthView.tsx              # Month calendar view
│   │   │   ├── WeekView.tsx               # Week calendar view
│   │   │   ├── Filters.tsx                # Filter controls
│   │   │   ├── SearchBar.tsx              # Search input
│   │   │   └── AppointmentHoverCard.tsx   # Appointment preview
│   │   ├── control-panel/          # Permission management
│   │   │   ├── AppointmentAccessPermission.tsx
│   │   │   ├── UserAccessPermission.tsx
│   │   │   └── InvitationList.tsx
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── AuthGuard.tsx           # Route protection
│   │   ├── login/                  # Login component
│   │   ├── register/               # Registration component
│   │   └── navbar/                 # Navigation bar
│   ├── context/                    # React Context providers
│   │   ├── DateContext.tsx         # Global date state
│   │   └── AppointmentColorContext.tsx  # Color management
│   ├── lib/                        # Utility libraries
│   │   ├── supabaseClient.ts       # Client-side Supabase client
│   │   ├── supabaseAdmin.ts        # Server-side admin client
│   │   ├── email.ts                # Email sending
│   │   ├── permissions.ts          # Permission checking
│   │   └── utils.ts                # General utilities
│   ├── types/                      # TypeScript type definitions
│   │   ├── types.ts                # Main types
│   │   └── invitation.ts           # Invitation types
│   └── styles/
│       └── globals.css             # Global styles
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm** package manager
- **Git** for version control
- A **Supabase** account (free tier works)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Environment Variables

```bash
# Supabase Configuration
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Base URL
# For local development: http://localhost:3000
# For production: https://your-domain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
# For Gmail, you'll need to:
# 1. Enable 2-Factor Authentication
# 2. Generate an "App Password" in Google Account settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### How to Get Supabase Credentials

1. **Create a Supabase Account**: Go to [supabase.com](https://supabase.com) and sign up
2. **Create a New Project**: Click "New Project" and fill in the details
3. **Get Your Credentials**:
   - Go to Project Settings → API
   - Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### How to Get Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to "App passwords" section
4. Generate a new app password for "Mail"
5. Use this password (not your regular Gmail password) for `EMAIL_PASS`

### Environment Variable Security

⚠️ **Important Security Notes**:

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses all security policies - keep it secret!
- Use different credentials for development and production
- Rotate credentials if they're ever exposed

---

## 📦 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd multiview-calender-appointment
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Set Up Environment Variables

Create `.env.local` file and add all required environment variables (see [Environment Variables](#-environment-variables) section above).

### Step 4: Set Up Supabase Database

You'll need to create the following tables in your Supabase database:

#### Required Tables

1. **users** - User profiles
2. **appointments** - Appointment records
3. **appointment_assignee** - Appointment invitations and permissions
4. **patients** - Patient information
5. **relatives** - Relative information
6. **categories** - Appointment categories
7. **activities** - Appointment activity log
8. **dashboard_access** - Dashboard access permissions

#### Example SQL for `appointments` table

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  patient UUID REFERENCES patients(id),
  attachements TEXT[],
  category UUID REFERENCES categories(id),
  notes TEXT,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('done', 'pending', 'alert')),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);
```

> **Note**: You'll need to set up Row Level Security (RLS) policies in Supabase to control data access. Refer to Supabase documentation for RLS setup.

### Step 5: Configure Supabase Storage

Create a storage bucket named `attachments` for storing appointment attachments:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `attachments`
3. Set appropriate policies for upload/download

---

## ▶️ Running the Project

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🎓 Project Walkthrough

### Initial Setup Flow

1. **Registration**: New users register with email and password
2. **Email Verification**: Users must verify their email address
3. **Login**: After verification, users can log in
4. **User Sync**: User data is automatically synced to the `users` table

### Main Application Flow

1. **Home Page**: Users land on the calendar view (default: List view)
2. **View Switching**: Users can switch between List, Week, and Month views
3. **Navigation**: Use arrow buttons to navigate between dates (Week/Month views)
4. **Creating Appointments**: Click "New Appointment" button to open creation dialog
5. **Viewing Appointments**: Click on appointments to view details
6. **Editing**: Click edit icon (if you have write permissions)
7. **Filtering**: Use filter controls to narrow down appointments
8. **Search**: Use search bar for instant search across all fields

### Invitation Flow

1. **Send Invitation**: Go to Control Panel → Select appointment/dashboard
2. **Enter Email**: Provide invitee's email and select permission level
3. **Email Sent**: System sends email with secure invitation link
4. **Accept Invitation**: Invitee clicks link and accepts invitation
5. **Access Granted**: Invitee now has specified permission level

### Permission Flow

1. **Owner**: Created the appointment - full control
2. **Invited Users**: Receive invitation with permission level
3. **Permission Check**: System checks permissions before allowing actions
4. **UI Adaptation**: Interface adapts based on user's permission level

---

## 🔌 API Endpoints

### Appointments

#### GET `/api/appointments`

List all appointments (with optional filtering).

**Query Parameters:**

- `user_id` (optional): Filter by user ID

**Response:**

```json
{
  "appointments": [
    {
      "id": "uuid",
      "title": "Appointment Title",
      "start": "2025-01-15T10:00:00Z",
      "end": "2025-01-15T11:00:00Z",
      "location": "Room 101",
      "status": "pending",
      "user_id": "user-uuid"
    }
  ]
}
```

#### POST `/api/appointments`

Create a new appointment.

**Request Body:**

```json
{
  "title": "Appointment Title",
  "start": "2025-01-15T10:00:00Z",
  "end": "2025-01-15T11:00:00Z",
  "location": "Room 101",
  "user_id": "user-uuid",
  "category": "category-uuid",
  "patient": "patient-uuid",
  "notes": "Additional notes"
}
```

#### GET `/api/appointments/[id]`

Get a specific appointment by ID.

#### PUT `/api/appointments/[id]`

Full update of an appointment (replace all fields).

#### PATCH `/api/appointments/[id]`

Partial update of an appointment (update only provided fields).

#### DELETE `/api/appointments/[id]`

Delete an appointment.

#### GET `/api/appointments/search`

Search appointments by query string.

**Query Parameters:**

- `query`: Search term

### Invitations

#### POST `/api/invitations`

Create and send an invitation.

**Request Body:**

```json
{
  "type": "appointment" | "dashboard",
  "email": "invitee@example.com",
  "resourceId": "appointment-id-or-user-id",
  "permission": "read" | "write" | "full",
  "invitedUserId": "user-id" // optional
}
```

#### GET `/api/invitations`

Get all invitations for the current user.

#### POST `/api/invitations/accept`

Accept an invitation by token.

**Request Body:**

```json
{
  "token": "invitation-token",
  "userId": "user-id"
}
```

### Users

#### GET `/api/users/search`

Search users by email or display name.

**Query Parameters:**

- `query`: Search term

### Permissions

#### GET `/api/appointments/[id]/permissions`

Get permission level for current user on an appointment.

#### DELETE `/api/appointments/[id]/permissions`

Discard/delete an appointment invitation.

### OpenAPI Documentation

#### GET `/api/openapi`

Get OpenAPI specification in JSON format.

#### `/api-docs`

Interactive API documentation page.

#### `/redoc.html`

Full interactive API documentation using Redoc.

---

## 🧩 Components & Reusability

### Calendar Components

#### `AppointmentList`

Displays appointments in a list format grouped by date.

**Usage:**

```tsx
import AppointmentList from '@/components/calendar/AppointmentList';

export default function MyPage() {
  return <AppointmentList />;
}
```

**Features:**

- Automatic data fetching
- Search and filter integration
- Permission-based UI
- Edit/delete functionality

#### `MonthView`

Displays appointments in a monthly calendar grid.

**Usage:**

```tsx
import MonthView from '@/components/calendar/MonthView';

export default function CalendarPage() {
  return <MonthView />;
}
```

#### `WeekView`

Displays appointments in a weekly calendar grid.

**Usage:**

```tsx
import WeekView from '@/components/calendar/WeekView';

export default function WeekCalendar() {
  return <WeekView />;
}
```

#### `AppointmentDialog`

Dialog component for creating/editing appointments.

**Usage:**

```tsx
import AppointmentDialog from '@/components/calendar/AppointmentDialog';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>New Appointment</Button>
      <AppointmentDialog
        isOpen={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          // Handle success
          setOpen(false);
        }}
      />
    </>
  );
}
```

#### `CalendarHeader`

Header component with view switcher and date navigation.

**Usage:**

```tsx
import CalendarHeader from '@/components/calendar/CalendarHeader';

const [view, setView] = useState<"Liste" | "Woche" | "Monat">("Liste");

<CalendarHeader view={view} setView={setView} />
```

### Context Providers

#### `DateProvider`

Provides global date state for calendar navigation.

**Usage:**

```tsx
import { DateProvider } from '@/context/DateContext';

function App() {
  return (
    <DateProvider>
      <YourCalendarComponents />
    </DateProvider>
  );
}
```

**Access in components:**

```tsx
import { useDateContext } from '@/context/DateContext';

function MyComponent() {
  const { currentDate, setCurrentDate } = useDateContext();
  // Use currentDate and setCurrentDate
}
```

#### `AppointmentColorProvider`

Provides deterministic color assignment for appointments.

**Usage:**

```tsx
import { AppointmentColorProvider } from '@/context/AppointmentColorContext';

function App() {
  return (
    <AppointmentColorProvider>
      <YourComponents />
    </AppointmentColorProvider>
  );
}
```

**Access in components:**

```tsx
import { useAppointmentColor } from '@/context/AppointmentColorContext';

function MyComponent() {
  const { randomBgColor } = useAppointmentColor();
  const color = randomBgColor(appointment.category || appointment.id);
}
```

### UI Components (shadcn/ui)

All UI components in `src/components/ui/` are reusable and can be used throughout your application.

**Example:**

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function MyForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <Input placeholder="Enter text" />
      </DialogContent>
    </Dialog>
  );
}
```

### Reusing Components in Other Projects

1. **Copy Component Files**: Copy the component file to your project
2. **Install Dependencies**: Ensure required dependencies are installed
3. **Update Imports**: Adjust import paths to match your project structure
4. **Copy Dependencies**: Copy any related types, utilities, or contexts
5. **Test Integration**: Test the component in your project context

**Example - Reusing AppointmentDialog:**

```bash
# Copy the component
cp src/components/calendar/AppointmentDialog.tsx your-project/src/components/

# Copy required types
cp src/types/types.ts your-project/src/types/

# Copy required utilities
cp src/lib/permissions.ts your-project/src/lib/
```

---

## 🗺️ Routes & Navigation

### Public Routes

- `/login` - User login page
- `/register` - User registration page
- `/accept-invitation` - Accept invitation by token

### Protected Routes (Require Authentication)

- `/` - Home page with calendar views
- `/control-panel` - Permission and invitation management
- `/api-docs` - API documentation
- `/api-status` - API health check

### API Routes

All API routes are prefixed with `/api/`:

- `/api/appointments` - Appointment CRUD operations
- `/api/appointments/[id]` - Individual appointment operations
- `/api/invitations` - Invitation management
- `/api/users/search` - User search
- `/api/openapi` - OpenAPI specification

### Navigation Flow

```text
Login → Email Verification → Home (Calendar)
  ↓
Control Panel → Send Invitations
  ↓
Accept Invitation → Access Granted
```

---

## 🔑 Key Functionalities

### 1. Multi-View Calendar System

The application supports three different calendar views:

- **List View**: Chronological list of appointments grouped by date
- **Week View**: Weekly grid showing appointments in time slots
- **Month View**: Monthly grid with appointment indicators

**Implementation:**

- Uses React Context (`DateContext`) for shared date state
- Conditional rendering based on selected view
- Optimized performance with lazy loading

### 2. Real-time Search

Search functionality that queries across multiple fields:

- Appointment title
- Notes
- Location
- Patient information

**Implementation:**

- Debounced search input
- Server-side search endpoint
- Client-side filtering for instant results

### 3. Advanced Filtering

Multi-criteria filtering system:

- **By Category**: Filter appointments by category
- **By Patient**: Show appointments for specific patients
- **By Date**: Filter by date range
- **By Status**: Filter by appointment status (done, pending, alert)

**Implementation:**

- State management for filter values
- Combined filter application
- URL query parameter support (optional)

### 4. Permission System

Role-based access control with four permission levels:

- **Owner**: Full control (created the appointment)
- **Full**: Read, write, and delete access
- **Write**: Read and modify access
- **Read**: View-only access

**Implementation:**

- Permission checking utility (`getUserAppointmentPermission`)
- UI adaptation based on permissions
- Server-side permission validation

### 5. Invitation System

Secure invitation system with email notifications:

- Generate unique tokens (UUID)
- Send email invitations
- Track invitation status
- Accept/decline invitations

**Implementation:**

- Token-based invitation links
- Email sending with Nodemailer
- Database tracking of invitation status

### 6. Authentication & Authorization

Secure authentication flow:

- Email/password authentication
- Email verification required
- Session management
- Route protection with `AuthGuard`

**Implementation:**

- Supabase Auth integration
- Client and server-side authentication
- Automatic user sync to database

---

## 💻 Code Examples

### Creating an Appointment

```tsx
import { useState } from 'react';
import AppointmentDialog from '@/components/calendar/AppointmentDialog';

function CreateAppointmentButton() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>
        New Appointment
      </button>
      <AppointmentDialog
        isOpen={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          console.log('Appointment created!');
          setOpen(false);
        }}
      />
    </>
  );
}
```

### Fetching Appointments

```tsx
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Appointment } from '@/types/types';

function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function fetchAppointments() {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start', { ascending: true });
      
      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data || []);
      }
    }
    
    fetchAppointments();
  }, [supabase]);
  
  return (
    <div>
      {appointments.map(appointment => (
        <div key={appointment.id}>
          <h3>{appointment.title}</h3>
          <p>{appointment.start}</p>
        </div>
      ))}
    </div>
  );
}
```

### Using Date Context

```tsx
import { useDateContext } from '@/context/DateContext';
import { format } from 'date-fns';

function DateDisplay() {
  const { currentDate, setCurrentDate } = useDateContext();
  
  return (
    <div>
      <p>Current Date: {format(currentDate, 'MMMM dd, yyyy')}</p>
      <button onClick={() => setCurrentDate(new Date())}>
        Go to Today
      </button>
    </div>
  );
}
```

### Checking Permissions

```tsx
import { getUserAppointmentPermission } from '@/lib/permissions';
import type { Appointment, AppointmentAssignee } from '@/types/types';

function AppointmentActions({ 
  appointment, 
  assignees,
  userId 
}: {
  appointment: Appointment;
  assignees?: AppointmentAssignee[];
  userId: string;
}) {
  const permission = getUserAppointmentPermission({
    appointment,
    assignees,
    userId
  });
  
  const canEdit = permission === 'owner' || permission === 'write' || permission === 'full';
  const canDelete = permission === 'owner' || permission === 'full';
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
      {!canEdit && <p>Read-only access</p>}
    </div>
  );
}
```

### Sending an Invitation via API

```tsx
async function sendInvitation() {
  const response = await fetch('/api/invitations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'appointment',
      email: 'invitee@example.com',
      resourceId: 'appointment-id',
      permission: 'read',
    }),
  });
  
  const data = await response.json();
  if (response.ok) {
    console.log('Invitation sent:', data);
  } else {
    console.error('Error:', data.error);
  }
}
```

---

## 🗄️ Database Schema

### Core Tables

#### `users`

Stores user profile information synced from Supabase Auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `appointments`

Main table for appointment records.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  patient UUID REFERENCES patients(id),
  attachements TEXT[],
  category UUID REFERENCES categories(id),
  notes TEXT,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('done', 'pending', 'alert')),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);
```

#### `appointment_assignee`

Tracks appointment invitations and permissions.

```sql
CREATE TABLE appointment_assignee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment UUID REFERENCES appointments(id) NOT NULL,
  user UUID REFERENCES auth.users(id),
  invited_email TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  permission TEXT CHECK (permission IN ('read', 'write', 'full')),
  invitation_token UUID UNIQUE,
  invited_by UUID REFERENCES auth.users(id)
);
```

#### `patients`

Patient information.

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  birth_date DATE,
  care_level INTEGER,
  pronoun TEXT,
  email TEXT,
  active BOOLEAN DEFAULT true,
  active_since TIMESTAMP WITH TIME ZONE
);
```

#### `categories`

Appointment categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT
);
```

---

## 🔒 Authentication & Authorization

### Authentication Flow

1. **Registration**: User creates account with email/password
2. **Email Verification**: Supabase sends verification email
3. **Verification**: User clicks link to verify email
4. **Login**: User logs in with verified credentials
5. **Session**: Supabase manages session with cookies
6. **User Sync**: User data synced to `users` table

### Authorization Flow

1. **Permission Check**: System checks user's permission level
2. **UI Adaptation**: Interface shows/hides actions based on permissions
3. **API Validation**: Server-side validation of permissions
4. **Access Control**: Unauthorized actions are blocked

### Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Service Role Key**: Only used server-side, never exposed
- **Token-based Invitations**: Secure UUID tokens for invitations
- **Email Verification**: Required before accessing app
- **Session Management**: Secure session handling with Supabase

---

## 🏷️ Keywords

Next.js, React, TypeScript, Supabase, Tailwind CSS, shadcn/ui, Radix UI, Calendar, Appointment Management, Healthcare, Medical Scheduling, Multi-View Calendar, List View, Week View, Month View, Search, Filtering, Invitation System, Permission Management, Role-Based Access Control, RESTful API, OpenAPI, Authentication, Authorization, Email Notifications, Responsive Design, Full-Stack, CRUD Operations, PostgreSQL, Row Level Security, Context API, State Management, Date-fns, Nodemailer, UUID, Vercel, Production Ready, Educational Project, Open Source, Arnob Mahmud

---

## 📝 Conclusion

This Doctor Patient Calendar Appointment Management System is a comprehensive, production-ready application that demonstrates modern web development practices. It showcases:

- **Modern Tech Stack**: Latest versions of Next.js, React, and TypeScript
- **Best Practices**: Clean code, type safety, and proper architecture
- **Security**: Authentication, authorization, and data protection
- **User Experience**: Intuitive interface with multiple views and features
- **Scalability**: Designed to handle growth and additional features
- **Educational Value**: Well-documented code perfect for learning

The project is ideal for:

- Healthcare providers and clinics
- Service businesses needing scheduling
- Developers learning full-stack development
- Teams building appointment systems
- Educational purposes and portfolio projects

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
