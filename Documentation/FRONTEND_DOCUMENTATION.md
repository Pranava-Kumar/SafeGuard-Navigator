# SafeRoute Frontend Architecture Documentation

## Overview

The SafeRoute frontend is built with Next.js 15+ using the App Router architecture. It follows a component-based design with clear separation of concerns between UI components, data fetching, and business logic.

## Project Structure

```
app/
├── about/                  # About page
├── analytics/              # Safety analytics dashboard
├── api/                    # Next.js API routes (proxy to backend)
├── dashboard/              # User dashboard
├── emergency/              # Emergency services and alerts
├── map/                    # Interactive safety map
├── routes/                 # Route planning interface
├── safety/                 # Safety reporting and monitoring
├── unauthorized/           # Unauthorized access page
├── layout.tsx             # Root layout
├── page.tsx               # Homepage
├── not-found.tsx          # 404 page
└── globals.css            # Global styles

components/
├── auth/                  # Authentication components
├── dashboard/             # Dashboard-specific components
├── emergency/             # Emergency-related components
├── map/                   # Map components
├── ui/                    # Reusable UI components (shadcn/ui)
├── EmergencyServices.tsx  # Emergency services interface
├── IncidentDetails.tsx    # Incident reporting details
├── NavigationBar.tsx      # Main navigation
├── SafetyAnalytics.tsx    # Analytics dashboard
├── SafetyForum.tsx        # Community safety forum
├── SafetyMap.tsx          # Interactive safety map
├── SafetyNotifications.tsx # Safety alerts and notifications
├── SafetyReporting.tsx    # Safety incident reporting
├── SafetyScoreCard.tsx    # Safety score display
└── UserProfile.tsx        # User profile management

context/
└── AuthContext.tsx        # Authentication state management

hooks/
├── useAuth.ts             # Authentication hook
├── useMap.ts              # Map interaction hook
├── useSafetyData.ts       # Safety data fetching hook
└── useRoutePlanning.ts    # Route planning hook

lib/
├── auth/                  # Authentication utilities
├── emergency/             # Emergency service utilities
├── mapping/               # Map utilities
├── realtime/              # Real-time data utilities
├── reporting/             # Reporting utilities
├── reputation/            # Reputation system utilities
├── routing/               # Route planning utilities
├── safety/                # Safety calculation utilities
├── satellite/             # Satellite data utilities
├── auth.ts                # Authentication service
├── data-integration.ts    # Data integration service
├── db.ts                  # Database client
├── middleware.ts          # Request middleware
├── ratelimit.ts           # Rate limiting utilities
├── safety-score.ts        # Safety scoring engine
├── socket.ts              # WebSocket connections
└── utils.ts               # General utilities
```

## Component Architecture

### 1. Authentication System

#### AuthContext.tsx
The authentication context provides global state management for user authentication:
- **State**: `user`, `isAuthenticated`, `isLoading`
- **Actions**: `login`, `register`, `logout`, `refreshUser`
- **Implementation**: Uses mock user for demonstration but designed to integrate with backend API
- **Data Flow**: 
  1. User actions trigger API calls to `/api/auth/*` routes
  2. API routes proxy requests to FastAPI backend
  3. Backend validates credentials and returns JWT
  4. Frontend stores token in HTTP-only cookie
  5. User data is stored in context state

#### Authentication Components
- `LoginModal.tsx`: User login interface
- `SignUpModal.tsx`: User registration interface
- `UserProfile.tsx`: User profile management

### 2. Safety Map System

#### SafetyMap.tsx
The core interactive map component built with Leaflet:
- **Features**:
  - Real-time safety score visualization
  - Incident markers with reliability scoring
  - Safety zones with color-coded risk levels
  - Route display with safety information
  - Emergency reporting interface
- **Data Sources**:
  - Safety scores from `/api/safety/data`
  - Incidents from `/api/reporting/incidents`
  - Safety zones from `/api/safety/zones`
- **Interactions**:
  - Click to set destination
  - Location control for centering on user
  - Safety preference slider for route optimization

#### Map Subcomponents
- `LocationControl`: Center map on user's location
- `SafetyRoute`: Display calculated routes with safety information
- `SafetyHeatmap`: Visualize safety scores as heatmap overlay
- `IncidentMarkers`: Show reported incidents with icons
- `SafetyZones`: Display circular safety zones

### 3. Route Planning System

#### Route Planning Components
- `SafetyAwareRouting.ts`: Custom A* implementation for safety-first routing
- API integration through `/api/routes/calculate`
- Route alternatives (safest, fastest, balanced)
- Real-time safety score integration along route segments

#### Data Flow
1. User selects start and end points on map
2. Request sent to `/api/routes/calculate` with safety preferences
3. Backend calculates routes with safety-weighted cost function
4. Multiple route options returned with safety metrics
5. Routes displayed on map with color coding

### 4. Safety Reporting System

#### SafetyReporting.tsx
Comprehensive incident reporting interface:
- **Features**:
  - Location selection via map or GPS
  - Incident type categorization
  - Severity rating system
  - Photo upload capability
  - Anonymous reporting option
  - Nearby reports display
- **Data Integration**:
  - Submits to `/api/reporting/submit`
  - Fetches nearby reports from `/api/reporting/nearby`
  - Uploads images to `/api/reporting/upload-images`

#### Trust System Integration
- Wilson Score reputation system for report verification
- Community voting (verify/dispute) for report accuracy
- Reporter trust scores affect report weighting

### 5. Emergency Services System

#### EmergencyServices.tsx
Integrated emergency response interface:
- **Features**:
  - Nearby emergency services lookup
  - Quick-dial emergency contacts
  - Emergency contact management
  - One-touch emergency alert triggering
  - Service details and directions
- **Data Sources**:
  - Emergency services from `/api/emergency/services`
  - User contacts from `/api/emergency/contact`
  - Emergency alerts to `/api/emergency`

#### Components
- Service listing with distance and details
- Contact management (add, edit, delete)
- Emergency alert confirmation flow
- Service type filtering (police, hospital, fire, etc.)

### 6. Analytics Dashboard

#### SafetyAnalytics.tsx
Data visualization for safety trends:
- **Features**:
  - Safety score trends over time
  - Incident type distribution
  - User reporting patterns
  - Route safety comparisons
  - Community engagement metrics
- **Data Sources**:
  - Analytics data from various API endpoints
  - Aggregated safety scores and incidents
  - User activity and report data

## Data Fetching Patterns

### 1. API Routes (Proxy Pattern)
Next.js API routes in `app/api/` serve as proxies to the FastAPI backend:
- `/api/auth/*` → FastAPI auth endpoints
- `/api/safety/*` → FastAPI safety endpoints
- `/api/routes/*` → FastAPI routing endpoints
- `/api/emergency/*` → FastAPI emergency endpoints
- `/api/reporting/*` → FastAPI reporting endpoints

This pattern:
- Enables cookie-based authentication
- Handles CORS between frontend and backend
- Provides a single API endpoint for the frontend
- Allows for request/response transformation

### 2. Client-Side Data Fetching
Components use `fetch` API for data retrieval:
```typescript
// Example: Fetching safety data
const fetchSafetyData = async () => {
  try {
    const response = await fetch('/api/safety/data');
    if (!response.ok) throw new Error('Failed to fetch safety data');
    const data = await response.json();
    setSafetyData(data.safetyData || []);
  } catch (err) {
    console.error('Error fetching safety data:', err);
    setError('Failed to load safety data');
  }
};
```

### 3. Real-time Updates
WebSocket connections for live data:
- Emergency alerts
- New incident reports
- Safety score updates
- Route traffic conditions

## State Management

### 1. React Context
- `AuthContext`: Global authentication state
- Potential for additional contexts (map state, safety data, etc.)

### 2. Component State
- Local state with `useState` for UI interactions
- Complex state with `useReducer` for forms and workflows

### 3. Server State
- React Query (`@tanstack/react-query`) for server state management
- Automatic caching and background updates
- Request deduplication and optimistic updates

## UI Component Library

### Shadcn UI Components
Reusable UI components based on Radix UI and Tailwind CSS:
- `Button`: Action buttons with variants
- `Card`: Content containers
- `Dialog`: Modal dialogs
- `Form`: Form components with validation
- `Table`: Data tables
- `Tabs`: Tabbed interfaces
- `Toast`: Notification messages

### Custom Components
- Map-specific components in `components/map/`
- Dashboard widgets in `components/dashboard/`
- Emergency-specific components in `components/emergency/`

## Responsive Design

### Mobile-First Approach
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Adaptive map controls
- Optimized form layouts

### Breakpoints
- Mobile: 0-768px
- Tablet: 769-1024px
- Desktop: 1025px+

### Adaptive Features
- Collapsible navigation on mobile
- Touch-optimized map controls
- Responsive data tables
- Mobile-friendly form layouts

## Performance Optimization

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading for non-critical features

### Caching Strategies
- Browser caching for static assets
- API response caching with React Query
- Service worker caching for offline support
- Database query caching in backend

### Bundle Optimization
- Tree-shaking for unused code
- Image optimization with Next.js Image component
- Font optimization with next/font
- Minification and compression

## Accessibility

### WCAG Compliance
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility

### Focus Management
- Logical tab order
- Focus indicators for interactive elements
- Skip navigation links
- Modal dialog focus trapping

## Internationalization

### Current State
- English-only interface
- Modular architecture for future language support
- RTL layout considerations

### Future Expansion
- Language selection in user preferences
- RTL layout support for Indian languages
- Locale-specific formatting (dates, numbers, currency)

## Testing Strategy

### Unit Testing
- Jest for logic testing
- React Testing Library for component testing
- Mock API responses for data fetching tests

### Integration Testing
- API route testing
- Authentication flow testing
- Data fetching integration tests

### End-to-End Testing
- Cypress or Playwright for user flow testing
- Cross-browser compatibility testing
- Mobile device testing

## Deployment Considerations

### Environment Variables
- API endpoint configuration
- Map service keys
- Analytics service credentials
- Feature flags for gradual rollouts

### CI/CD Pipeline
- Automated testing on pull requests
- Build and deployment automation
- Performance monitoring
- Error tracking integration

## Error Handling

### Client-Side Error Boundaries
- Component-level error handling
- Global error boundaries for unhandled errors
- User-friendly error messages
- Error reporting to monitoring services

### API Error Handling
- Standardized error response format
- Retry mechanisms for transient failures
- Fallback data for offline scenarios
- User notifications for critical errors

## Security Considerations

### Frontend Security
- XSS prevention through React's built-in escaping
- CSRF protection with same-site cookies
- Input validation and sanitization
- Secure authentication flow

### Data Protection
- HTTPS enforcement
- Sensitive data handling (no client-side storage of PII)
- Privacy-preserving data collection
- Consent management for data processing

## Future Enhancements

### Performance Improvements
- Virtualized lists for large datasets
- Progressive loading for map data
- Web Workers for heavy computations
- Prefetching for anticipated user actions

### UX Enhancements
- Personalized dashboard widgets
- Voice commands for hands-free operation
- Augmented reality navigation
- Offline-first capabilities

### Feature Expansions
- Multi-modal route planning
- Social features for community engagement
- Gamification for safety reporting
- Integration with smart city infrastructure