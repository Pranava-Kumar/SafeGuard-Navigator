SafeRoute: AI-Driven Public Safety Navigation System
Infosys PALS TechZooka Hackathon 2025

Building intelligent navigation for pedestrians and two-wheeler riders in Indian cities, prioritizing safety over speed.

Smart Lighting

Safety-First Routing

Crowdsourced Intelligence

Real-time Protection

Building AI Runways for Safer Urban Mobility

Team Introduction & Problem Statement
Meet SafeRoute Innovators
SafeGuard Navigators is a team dedicated to building an intelligent navigation system that prioritizes pedestrian and two-wheeler safety in Indian urban contexts.

Focused on safety-first routing

India-specific design approach

AI-driven navigation solution

Road Safety Crisis in India
Current navigation solutions optimize for speed and efficiency, overshadowing the critical element of personal safety for vulnerable road users. SafeRoute aims to address this gap by designing an intelligent navigation platform that prioritizes user safety through real-time lighting assessment, crowdsourced hazard reporting, and integration with civic infrastructure.

Category

Statistic

Details

Road Accidents (2022)

4,61,312

resulting in 1,68,491 deaths

Road Fatalities Distribution

65%

affected pedestrians (20%) and two-wheelers (45%)

Night-time Fatalities in Delhi

43%

pedestrian deaths and 38% two-wheeler deaths occur at night

Infrastructure Gaps in Delhi

4,289

"dark spots" identified, affecting route safety perception

Context & Market Opportunity
India's Road Safety Crisis
India faces a severe and escalating road safety crisis, with statistics painting a grim picture of the daily risks faced by citizens. The problem is particularly acute for pedestrians and two-wheeler riders, who are disproportionately affected.

Vulnerable Road Users: 65% of fatalities are vulnerable road users, with 45% being two-wheeler riders and 20% pedestrians.

Night-time Risks: In Delhi, 43% of pedestrian fatalities and 38% of two-wheeler fatalities occur at night.

Infrastructure Gaps: 4,289 "dark spots" officially identified in Delhi, creating a perception and reality of unsafe routes.

Market Opportunity
Safety-First Navigation: A clear, unaddressed need for navigation tools that prioritize personal safety over speed for vulnerable users.

Data-Driven Innovation: Opportunity to integrate diverse datasets including VIIRS satellite data, municipal dark-spot inventories, and real-time crowdsourcing.

Regulatory Alignment: Solution aligns with national priorities including the DPDP Act 2023 and supports India's Smart Cities Mission.

Business Relevance & Solution
Market Gaps Analysis
ETA Optimization Focus: Existing navigation prioritizes speed over safety, optimizing for vehicle-centric metrics while vulnerable users need safety information.

Lack of Safety Scoring: Indian apps like Mappls lack documented safety-score routing engines, failing to systematically evaluate road safety.

Environmental Data Gap: Current solutions don't integrate ambient lighting or environmental factors despite evidence linking lighting to safety.

Specialized Tools Limitation: Tools like Safetipin focus on auditing rather than providing real-time, turn-by-turn safety navigation.

SafeRoute Business Solution
Safety-Score Routing: A multi-factor algorithm combining lighting quality, footfall activity, hazard reports, and proximity to safety infrastructure.

Crowdsourced Safety: Trust-weighted community reporting with reputation management to create a living map of safety conditions.

Context-Aware Intelligence: Adaptable route recommendations based on time-of-day, weather conditions, and local activity levels.

Civic Integration: A feedback loop with municipal systems for infrastructure improvement and dark-spot resolution.

SafeRoute addresses a critical market gap by prioritizing personal safety over speed, integrating diverse datasets, and aligning with national priorities like the DPDP Act 2023. The solution creates a feedback loop between users, developers, and municipal authorities, continuously improving urban safety infrastructure.

Monetization Strategy
Freemium model with premium features for enhanced safety navigation.

B2B campus/corporate safety analytics.

Safety-as-a-Service for municipalities.

Solution Architecture: Data Layer
SafeRoute's data foundation integrates multiple sources to create a comprehensive safety baseline for all routes in Indian urban contexts.

Data Sources:

Base Mapping: OpenStreetMap + Mappls SDK for Indian address precision.

Night Lighting: VIIRS "Black Marble" satellite data at 500m resolution.

Civic Data: Municipal dark-spot inventories and safety infrastructure.

Crowdsourcing: Real-time hazard reports with trust scoring.

Context APIs: Weather, POI status, and traffic conditions.

Data Pipeline: Data from sources like OpenStreetMap, Mappls SDK, VIIRS Night Lighting, Municipal Data, and Crowdsourced Reports are fed into Data Ingestion and Data Processing. This processed data then goes into the SafetyScore Engine, which outputs Safe Routes.

Data Integration Benefits:

Comprehensive safety baseline from multiple sources.

Real-time updates with temporal decay for freshness.

Trust-weighted data ensures reliability.

Solution Architecture: AI/ML Pipeline
All AI components are integrated into a microservices architecture for real-time processing with Kafka/RabbitMQ for event streaming.

Safety Score Engine
A multi-weighted formula combining lighting, footfall, hazards, and proximity to help. SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)

L(e): Lighting

F(e): Footfall

H(e): Hazards

P(e): Proximity to Help

Route Optimization
A custom A*/Dijkstra algorithm with a safety-aware cost function that balances travel time with safety. Cost = α * Time + β * (1 - SafetyScore)

Reputation System
A Wilson score-based trust calculation for crowdsourced reports. This filters noisy/malicious reports and builds a trustworthy community network.

Predictive Modeling
Advanced forecasting with gradient boosting.

Current ML: Incident forecasting, Anomaly detection.

Future ML: Pothole detection (92% accuracy), Grievance classification.

System Components & Privacy Framework
Microservices Architecture
ingest-svc: Handles data from multiple sources including OpenStreetMap, VIIRS satellite imagery, and real-time crowdsourcing.

score-svc: Computes the multi-factor SafetyScore using gradient boosting models (XGBoost/LightGBM).

route-svc: Generates safe routes using custom cost functions balancing time and safety.

reputation-svc: Manages trust level of crowdsourced data using Wilson score confidence intervals.

prediction-svc: Runs predictive models.

API Gateway: Handles authentication, rate limiting, and orchestrates service requests between microservices.

Geospatial Database: PostgreSQL + PostGIS for efficient spatial queries on road segments and safety data.

Real-time Processing: Kafka/RabbitMQ for event streaming and dynamic updates, ensuring dynamic SafetyScore calculations.

DPDP Act 2023 Privacy Framework
Regulatory Compliance: Fully compliant with India's Digital Personal Data Protection (DPDP) Act, with explicit consent flows and user rights mechanisms.

On-Device Processing: Sensitive analyses like computer vision for pothole detection are processed locally on the user's device to minimize data transmission.

Data Minimization: Strict data minimization principles: coarse geo-hashing instead of precise location tracking, pseudonymous IDs, and purpose-limited retention.

India Data Residency: All user data and cloud infrastructure are hosted within India in compliance with national data sovereignty requirements.

Technology Stack
Frontend Development: NextJS 15+, TailwindCSS v4+, Shadcn UI, Magic UI, Framer Motion.

Backend Services: FastAPI (Python), NestJS (TypeScript). Python ecosystem is superior for ML/AI and geospatial data processing.

Maps & Visualization: Mappls SDK, MapLibre GL + OSM tiles. Mappls chosen for superior Indian address coverage.

Database & Geospatial: PostgreSQL + PostGIS, Neo4j + GraphDS. PostGIS is proven for navigation use cases with OSM integration.

Routing Engine: OSRM (C++), GraphHopper (Java). OSRM's C++ performance is critical for real-time route calculation.

Machine Learning: XGBoost/LightGBM, PyTorch. Gradient boosting is optimal for structured geospatial feature engineering.

Competitor Analysis
SafeRoute addresses critical gaps in existing navigation solutions by focusing on pedestrian and two-wheeler safety.

Feature

Google Maps/Waze

Mappls

Safetipin

SafeRoute

Primary Focus

Vehicle ETA

Indian Navigation

Safety Auditing

Pedestrian & 2-Wheeler Safety

Safety-Score Routing

❌ No

❌ No

❌ No

✅ Yes (Multi-factor)

Lighting Data

❌ No

❌ No

Yes (Manual)

✅ Yes (VIIRS+Civic)

Crowdsourcing

Yes

Yes

❌ No

✅ Yes (Trust-weighted)

DPDP Act Compliance

Limited

? Unspecified

N/A

✅ Yes

Google Maps/Waze: Excels at vehicle travel time, using hard-braking events to infer road risk. Fails to capture pedestrian safety concerns like poorly lit alleys or deserted streets.

Mappls (MapmyIndia): Superior Indian address precision and hyperlocal data. Lacks a safety-scoring engine and integration of environmental factors.

Safetipin: Conducted manual safety audits and advocated for infrastructure improvements. Limited to auditing and advocacy, not a real-time navigation tool.

SafeRoute's Key Advantages
Safety-first routing with a multi-factor SafetyScore.

Trust-weighted crowdsourcing for real-time hazard data.

Environmental intelligence with lighting data integration.

Civic integration with dark-spot reporting.

Core Innovation: Multi-Factor SafetyScore
SafeRoute's proprietary Safety Score algorithm evaluates road safety by combining four key factors.

SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)

L(e) - Lighting Quality: Normalized score from satellite data and crowdsourced reports. (Weight wL)

F(e) - Footfall & Activity: Busyness of a route based on nearby POIs. (Weight wF)

H(e) - Hazard Index: Time-sensitive score from reputation-weighted reports. (Weight wH)

P(e) - Proximity to Help: Nearness of safety-enhancing locations. (Weight wP)

Example Calculation:

Lighting (Weight 0.30)

Footfall (Weight 0.25)

Hazard (Weight 0.20)

Proximity to Help (Weight 0.25)

Total SafetyScore Weight: 1.00

Unique Value Propositions
SafeRoute establishes a distinct competitive advantage by addressing a critical market gap that existing navigation and safety applications overlook. Our solution is not merely an incremental improvement but a paradigm shift from speed-optimized routing to a holistic, safety-first navigation experience.

India-First Design:

DPDP Act 2023 compliance with explicit consent flows.

Regional language support for broad accessibility.

Offline capabilities addressing network connectivity gaps.

Safety-First Routing:

Prioritizes personal safety over travel time.

Multi-factor SafetyScore with transparent calculations.

Empowers informed decision-making with safety insights.

Environmental Intelligence:

VIIRS satellite lighting data integration.

Dark-spot inventory mapping for infrastructure gaps.

Dynamic, verifiable map of ambient lighting conditions.

Trust-Based Crowdsourcing:

Wilson score-based reputation system.

Effective filtering of noisy/malicious reports.

Trustworthy community-driven safety network.

Dynamic Context Awareness:

Adapts to changing conditions in real time.

Time-of-day, weather, and activity-based adaptation.

Truly intelligent and responsive safety navigation.

Technical Differentiators & Impact Potential
Technical Differentiators
Privacy-Preserving AI: On-device computer vision and coarse geo-hashing minimize data transmission and protect user privacy.

Real-time Adaptation: Dynamic SafetyScore updates based on time, weather, and crowd reports ensure constant optimization.

Scalable Architecture: Microservices design enables city-by-city rollout and continuous feature iteration.

Regulatory Compliance: DPDP Act 2023 compliance with explicit consent flows and user rights protection.

Accessibility Focus: Offline-first design for diverse device capabilities and network conditions, ensuring safety navigation for all users regardless of connectivity status.

Measurable Impact Potential
Route Safety: Target 25% reduction in low-lit/isolated segment exposure.

User Confidence: Aim for a +30% improvement in self-reported safety perception.

Emergency Response: Sub-3-second 112/SOS activation with location context.

Civic Feedback: Real-time input for municipal lighting and infrastructure improvements.

Evidence-Based Foundation
SafeRoute's methodologies are not based on assumptions but are validated by established research and successful real-world programs.

Lighting-Safety Correlation: A New York City RCT showed targeted street lighting improvements led to a 36% Reduction in nighttime outdoor crime. This proves lighting quality as a key SafetyScore pillar.

Crowdsourcing Effectiveness: Studies on the Waze platform demonstrate spatial accuracy within 6 ft and response times that are over 2 minutes faster. This supports SafeRoute's trust-weighted crowdsourcing model.

Satellite Data Reliability: The VIIRS "Black Marble" dataset provides consistent night light data at 500m resolution and has been collected since 2012. This forms the baseline for SafeRoute's lighting assessment.

Civic Data Impact: The success of the Delhi Dark-Spot Program, driven by Safetipin's audit methodology, proves that systematically identifying infrastructure gaps leads to tangible improvements. SafeRoute automates and scales this process.

Future Roadmap
Phase 1: Smart Infrastructure Integration (Q2 2026)
SafeRoute's next phase focuses on deepening the connection between users and the physical urban environment through proactive hazard detection and streamlined civic engagement.

Pothole Detection & Avoidance:

Sensor-Based Detection: Smartphone accelerometers and gyroscopes with 92% accuracy in detecting potholes.

Vision-Based Detection: YOLO-based computer vision models identify potholes from user dashcams or phone cameras.

SafetyScore Integration: Pothole data integrated as PotholeScore(e), dynamically adjusting route safety.

Civic Feedback Loop: Verified reports automatically forwarded to municipal maintenance systems.

Citizen Grievance Redressal Platform:

Integrated Reporting: In-app submission of complaints with photos and precise GPS tags.

CPGRAMS Integration: Direct API connection to Central Public Grievance Redress and Monitoring System.

Dynamic Routing Feedback: Grievance status influences route safety: unresolved issues incur higher safety penalties.

Impact Tracking: Public dashboard showing complaint resolution rates and infrastructure improvements.

Expected Outcomes:

Enhanced safety for two-wheeler riders.

Improved civic accountability.

Better infrastructure maintenance.

Phase 2: Advanced AI (2027)
Predictive Safety Intelligence:

24-hour incident forecasting using historical patterns.

Anomaly detection for unusual safety patterns.

Seasonal modeling for festivals and events.

Phase 3: Ecosystem Integration (2028+)
Multi-Modal Safety Extension:

E-scooter and cycling safety with battery-aware routing.

Public transport safety with metro/corridor integration.

Accessibility features for users with disabilities.

Smart City Partnerships:

Emergency services optimization.

Urban planning with mobility analytics.

Technology Roadmap:

Edge AI for offline processing.

5G integration for low-latency alerts.

Blockchain

AR Navigation

Next Steps & Call to Action
SafeRoute is ready to transition from concept to reality with a clear, actionable plan. Our immediate next steps focus on validation and community building to move the project forward.

Pilot Partnership: Launch an 8-week campus deployment to gather measurable safety metrics and user feedback. (Outcome: Improve safety awareness)

Municipal Collaboration: Engage with smart city initiatives to integrate civic data and align with urban improvement goals. (Outcome: Infrastructure improvement)

User Community: Initiate beta testing with diverse user groups across multiple cities to refine the platform. (Outcome: Diverse feedback)

Academic Validation: Establish a research partnership to conduct longitudinal studies on the solution's safety impact. (Outcome: Evidence-based improvement)

Thank You & Contact Information
Building AI Runways for Safer Urban Mobility

SafeRoute represents the convergence of AI innovation, civic responsibility, and user-centric design, uniquely positioned to address India's urban safety challenges while respecting privacy and promoting transparency.

Team Lead:

Pranava Kumar (pranavakumar.it@gmail.com)

Teammates:

Sam Daniel J

Muhilan M

Mentor:

Mrs. Chinchu Nair (Assistant Professor, Department of CSE)

Next Steps Summary
Pilot Partnership: 8-week campus deployment with measurable safety metrics.

User Community: Beta testing with diverse user groups across multiple cities.

Municipal Collaboration: Integration with ongoing smart city initiatives.

Academic Validation: Research partnership for longitudinal safety impact studies.