# Healthcare Portal - React Next.js Application

A comprehensive healthcare management system built with Next.js, TypeScript, and React Context API for state management.

## 🚀 Features

### 📄 Pages
- **Home Page** (`/`) - Dashboard with navigation cards
- **Patients List** (`/patients`) - Patient management with CRUD operations
- **Claims Dashboard** (`/claims`) - Claims management with filtering and status updates
- **Sync Page** (`/sync`) - Google Sheets integration and sync history

### 🏗️ State Management
Built with React Context API for scalable state management, ready for backend integration.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Components**: React functional components with hooks

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dev_exercise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   ```bash
   cp env.example .env.local
   # Update the .env.local file with your backend API URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 State Management Architecture

### Context Providers

#### PatientContext (`src/contexts/PatientContext.tsx`)
- **State**: Patients list, loading states, selected patient
- **Actions**: 
  - `fetchPatients()` - Load all patients
  - `createPatient(data)` - Add new patient
  - `updatePatient(data)` - Update existing patient
  - `deletePatient(id)` - Remove patient
  - `setSelectedPatient(patient)` - Set current patient

#### ClaimContext (`src/contexts/ClaimContext.tsx`)
- **State**: Claims list, filtered claims, status filter, patient filter
- **Actions**:
  - `fetchClaims(patientId?)` - Load claims (optionally filtered by patient)
  - `createClaim(data)` - Add new claim
  - `updateClaimStatus(id, status)` - Update claim status
  - `setStatusFilter(filter)` - Filter by claim status
  - `setPatientFilter(patientId)` - Filter by patient

#### SyncContext (`src/contexts/SyncContext.tsx`)
- **State**: Sync history, connection status, last sync timestamp
- **Actions**:
  - `syncToGoogleSheets(request)` - Sync data to Google Sheets
  - `fetchSyncHistory()` - Load sync history
  - `checkSyncStatus()` - Check connection status

### Usage Example

```typescript
import { usePatient, useClaim, useSync } from '@/contexts/AppProvider';

function MyComponent() {
  const { state: patientState, actions: patientActions } = usePatient();
  const { state: claimState, actions: claimActions } = useClaim();
  const { state: syncState, actions: syncActions } = useSync();

  // Load data
  useEffect(() => {
    patientActions.fetchPatients();
    claimActions.fetchClaims();
  }, []);

  // Access state
  const { patients, loading } = patientState;
  const { filteredClaims } = claimState;
  
  return (
    // Your component JSX
  );
}
```

## 🔌 Backend Integration

### API Service Layer

The application includes a comprehensive API service layer (`src/lib/api.ts`) ready for backend integration:

```typescript
// Patient operations
import { patientApi } from '@/lib/api';

const patients = await patientApi.getAll();
const patient = await patientApi.create(patientData);
```

### Environment Configuration

Set your backend API URL in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### API Endpoints Expected

The application expects these RESTful endpoints:

#### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

#### Claims
- `GET /api/claims` - Get all claims
- `GET /api/claims?patientId=:id` - Get claims by patient
- `POST /api/claims` - Create new claim
- `PUT /api/claims/:id` - Update claim
- `PATCH /api/claims/:id/status` - Update claim status
- `DELETE /api/claims/:id` - Delete claim

#### Sync
- `POST /api/sync/google-sheets` - Sync to Google Sheets
- `GET /api/sync/history` - Get sync history
- `GET /api/sync/status` - Get connection status

### Fallback System

The application gracefully falls back to mock data when the backend is unavailable:

- Development continues without backend dependency
- Console warnings indicate when mock data is being used
- Seamless transition when backend becomes available

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── claims/            # Claims page
│   ├── patients/          # Patients page
│   ├── sync/              # Sync page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Navigation.tsx     # Header navigation
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── PatientForm.tsx    # Patient form modal
│   └── ClaimForm.tsx      # Claim form modal
├── contexts/              # React Context providers
│   ├── AppProvider.tsx    # Root provider wrapper
│   ├── PatientContext.tsx # Patient state management
│   ├── ClaimContext.tsx   # Claim state management
│   └── SyncContext.tsx    # Sync state management
├── lib/                   # Utility functions
│   ├── api.ts             # API service layer
│   └── data.ts            # Mock data for development
└── types/                 # TypeScript type definitions
    ├── index.ts           # Main application types
    └── api.ts             # API request/response types
```

## 🎨 Features & Components

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation with mobile menu
- Adaptive tables and forms

### Form Validation
- Client-side validation for all forms
- Real-time error messages
- Required field validation
- Email and numeric validation

### Loading States
- Global loading states for data fetching
- Individual action loading indicators
- Spinner components with optional text

### User Feedback
- Success/error message system
- Auto-dismissing notifications
- Context-appropriate messaging

### Navigation
- Patient name links navigate to filtered claims view
- URL parameter support for deep linking
- Active navigation state indication

## 🔄 Data Flow

1. **Component Mount**: `useEffect` calls context actions
2. **Action Execution**: Context actions dispatch loading state
3. **API Call**: Service layer attempts backend request
4. **Fallback**: Mock data used if backend unavailable
5. **State Update**: Reducer updates state with data
6. **UI Update**: Components re-render with new state

## 🧪 Development

### Mock Data
Located in `src/lib/data.ts` with realistic sample data for:
- 3 sample patients with complete information
- 5 sample claims across different patients and statuses
- Sync history with success/failure examples

### Type Safety
Full TypeScript implementation with:
- Strict type checking
- Interface definitions for all data structures
- API request/response type safety
- Component prop validation

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Environment Variables**
   Set production API URL and any required authentication tokens

## 🔧 Backend Integration Checklist

- [ ] Set up backend API endpoints
- [ ] Configure environment variables
- [ ] Test API connectivity
- [ ] Implement authentication (if required)
- [ ] Set up Google Sheets integration
- [ ] Configure error handling
- [ ] Test production deployment

## 📝 Notes

- The application is fully functional with mock data
- Context API provides scalable state management
- Ready for immediate backend integration
- Responsive design works on all device sizes
- Form validation prevents invalid data submission
- Loading states provide good user experience

---

**Ready for your backend integration!** 🎉

The frontend is completely built and will seamlessly integrate with your backend once the API endpoints are available.