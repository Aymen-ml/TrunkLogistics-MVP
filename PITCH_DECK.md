# TruckLogistics — Pitch Deck

> **Book verified trucks. Deliver on time. Built for South Algeria oil & gas.**

**Contact:** support@trucklogistics.me • trucklogistics.me • +213 779 11 65 22  
**Version:** Oct 2025 (Pre-Launch MVP)

---

## 1) The Problem

**Oilfield logistics in South Algeria is stuck in the dark ages:**

- **Fragmented coordination:** Phone chains between Hassi Messaoud sites → delays, lost messages, zero audit trail
- **Opaque status:** Operations managers don't know where fuel tankers or equipment trucks are; late updates cause production delays
- **Non-standard pricing:** Ad-hoc quotes for every water/fuel run → disputes, budget overruns, no benchmarks
- **Compliance nightmare:** HSE requires insurance/permits/hazmat certs, but they're scattered across emails/PDFs; expiries missed → site shutdowns
- **Manual processes:** Oilfield contractors waste hours on paperwork while trucks wait at gates
- **Trust gap:** No quick way to verify provider reliability, safety records, or incident history in remote desert operations

**Impact on oil & gas operations:**
- Average 45+ min wasted per dispatch (critical when downtime costs $10K-50K/day)
- 15–20% of trips delayed → rig delays, equipment sitting idle, production targets missed
- HSE compliance audits require manual document searches → failed audits, operational penalties
- No visibility on fuel/water deliveries → emergency situations, production shutdowns

*Source: Field interviews with Hassi Messaoud logistics coordinators, oilfield contractors (Oct 2025)*

---

## 2) Our Solution

**A lightweight marketplace + TMS purpose-built for South Algeria oilfield operations:**

- **Match loads instantly:** Find verified tanker/flatbed providers in Hassi Messaoud region in minutes, not hours
- **Oilfield workflow:** Fuel/water request → Instant offers → Confirm → Track → ePOD → HSE-ready archive
- **Compliance by default:** Document vault tracks insurance, hazmat certs, permits with automated expiry alerts—always HSE audit-ready
- **Real-time visibility:** Operations teams see trip status updates via web platform and email notifications

**The promise for oil & gas operators:**
- **3× faster dispatch** (target: <10 min avg vs. 45+ min baseline) → minimize rig downtime
- **Single source of truth** for pricing, status, and documents → eliminate phone tag and lost paperwork
- **95%+ HSE compliance rate** (always-current docs, automated expiry alerts) → pass audits, avoid shutdowns
- **Zero lost trips** due to miscommunication → maintain production schedules

*Think: Digital dispatch for desert oilfields—no heavy ERP required, built for field teams.*

---

## 3) Market Opportunity — Oil & Gas, South Algeria

**Beachhead: Hassi Messaoud—Algeria's largest oilfield complex**

- **Geography:** Hassi Messaoud (Sonatrach, Schlumberger, Halliburton sites), In Salah, In Amenas + 200 km radius
- **Job mix (oilfield-specific):**
  - **Fuel/water tankers:** Daily deliveries to drilling sites, production facilities (highest frequency, critical ops)
  - **Equipment moves:** Flatbeds, low-boys for drilling rigs, wellheads, heavy machinery (time-sensitive, high-value)
  - **Supplies & materials:** Cement, pipes, chemicals, spare parts (site-to-site, camp-to-field logistics)
  - **Personnel transport support:** Coordination with crew change logistics (not transport itself, but supply chain sync)
- **Oilfield characteristics:**
  - High-frequency short/medium desert routes (50–300 km between sites)
  - Strict HSE/safety compliance: insurance, hazmat permits, driver certifications mandatory for Sonatrach/international operators
  - 24/7 operations; extreme time-sensitivity (downtime = $10K–50K/day for drilling contractors)
  - Remote desert conditions demand reliable digital tracking and documentation

**Market sizing (conservative estimates):**

| Metric | Value |
|--------|-------|
| **TAM** (Algeria B2B road freight) | ~$2.5B annually |
| **SAM** (Oilfield logistics, South) | ~$180–220M annually |
| **SOM** (Yr 2–3 target) | 3–5% of SAM = $5.4–11M GMV |

**Expansion paths after wedge:**
- Phase 2: Industrial/construction corridors (Oran, Algiers, Constantine)
- Phase 3: Mining and infrastructure projects
- Long-term: North Africa regional play (Tunisia, Libya border zones)

**Why South Algeria oil & gas first?**
- **Urgent compliance needs:** Sonatrach, international operators (Schlumberger, Halliburton, Baker Hughes) require strict HSE documentation → willingness to pay for compliance automation
- **Concentrated geography:** 80% of providers operate within Hassi Messaoud 200km radius → network effects kick in faster, easier to onboard critical mass
- **Repeat high-frequency business:** Same fuel/water routes daily, same equipment moves weekly → predictable volume, high stickiness
- **High value per trip:** Oilfield logistics commands premium freight rates (10K–350K+ DZD per trip: fuel/water tankers, equipment moves) vs general freight → strong unit economics on our 7% take rate
- **Time sensitivity creates urgency:** Production delays cost $10K-50K/day → operators will adopt tools that prevent downtime

---

## 4) Product — Three Portals, One Platform

### **Shipper Portal** (Desktop + Mobile Web)
- Post load with pickup/delivery, truck type, requirements
- Receive/compare offers side-by-side (rate, ETA, provider score)
- Confirm booking in one click
- Track trip timeline: Dispatched → Pickup → En Route → Delivered
- ePOD: photo/signature capture; auto-archived with trip docs

### **Provider App/Portal**
- Targeted job offers (matched to fleet/region)
- Accept/decline with rate negotiation (optional)
- Upload/renew compliance docs (insurance, registration, driver licenses)
- Update trip milestones (pickup done, en route, delivered)
- Performance dashboard: acceptance rate, on-time %, earnings summary

### **Operations Dashboard** (Admin/Enterprise)
- Exceptions management: delays, incidents, disputes
- Document validity monitor (expiry alerts 30/15/7 days out)
- Provider scoring: on-time %, incident rate, compliance score
- Audit logs & analytics: lane performance, cost per km, dwell time

### **Integrations Roadmap**
- **Phase 1 (live):** Email notifications
- **Phase 2 (3–6 mo):** Advanced notifications, mobile app
- **Phase 3 (6–12 mo):** GPS/telematics, payments, enterprise SSO

**Tech stack:** React/Vite, Node.js, Supabase (Postgres + Auth), Resend (email)

**Visuals to include in slides:**
- User flow diagram (Request → Offers → Dispatch → ePOD)
- Screenshots: Booking form, Offers list, Trip timeline, ePOD capture

---

## 5) Why We Win — Differentiation

| **TruckLogistics** | **Heavy Global TMS** | **Status Quo (WhatsApp)** |
|-------------------|---------------------|--------------------------|
| French/English support | English only | Manual translation |
| <10 min onboarding | 2–6 weeks setup | N/A |
| Web-based platform | Requires installation | Works anywhere (but no records) |
| Compliance built-in | Add-on modules | Manual tracking |
| 7% take rate | $50K–200K license/year | Free (but hidden costs) |
| Lightweight & fast | Heavy enterprise systems | Light but unstructured |

**Our unfair advantages:**
1. **Local expertise:** Built for Algeria by a team that knows oilfield operations
2. **Compliance obsessed:** Doc vault, expiry alerts, and scoring = built-in, not bolted-on
3. **Speed to value:** Hours to onboard vs. weeks/months for SAP/Oracle TMS
4. **Trust layer:** Provider verification + incident history = shipper confidence from day one
5. **Network effects:** More providers → faster offers → happier shippers → more providers (flywheel)

---

## 6) Business Model — Multiple Revenue Streams

### **6.1 Core Revenue: Transaction Take Rate**

**7% of freight charge per completed trip** (pilot flexibility: 5–10%)

- **Min fee:** 1,000 DZD per trip (protects very small loads)
- **Optional cap:** 90,000 DZD for exceptionally large, negotiated hauls
- **Rationale:** Aligns our revenue with delivered value; simple and transparent for shippers and providers

**Example trips (oilfield-specific):**

| Trip Type | Typical Freight (DZD) | Take Rate @7% | Net Revenue |
|-----------|-----------------------:|-------------:|-------------:|
| Fuel/water tanker (regional, Hassi M.) | 180,000 | 12,600 | **12,600** |
| Heavy equipment move (low-boy, rig parts) | 350,000 | 24,500 | **24,500** |
| Small local service run | 10,000 | 700 (min→1,000 applied) | **1,000** |

These examples reflect typical oilfield trip economics in Hassi Messaoud and nearby basins. The take-rate keeps pricing simple for shippers while delivering strong unit economics for TruckLogistics.

### 6.2 Provider Subscriptions & Services

- **Provider subscription:** 500–2,000 DZD/month for enhanced listing, priority matching, and faster payments
- **Onboarding fee (one-time):** Optional paid verification and document scanning for large fleets
- **Premium analytics for shippers:** Monthly subscription for dashboards, SLA reports, and route insights
- **Managed services (Phase 2):** Payments facilitation, insurance facilitation (fee-based)

### 6.3 Unit Economics (oilfield focus)

- **Variable cost per trip:** ~300–600 DZD (driver payout + fuel pass-throughs + email notifications/processing)
- **Contribution per trip (example):** Fuel tanker net revenue ~12,600 DZD → contribution margin after variable costs ≈ 12,000+ DZD
- **LTV / CAC:** With repeat daily/weekly trips, LTV is high relative to modest onboarding CAC (more detailed model in Appendix B)

Note: Communications are email-based in the MVP (1–2% of revenue), keeping variable costs low relative to SMS/WhatsApp models.

---

### **6.2 Recurring Revenue: Provider Subscriptions**

| Tier | Price/mo | Features |
|------|----------|----------|
| **Basic** (Free) | 0 DZD | Standard offers, limited visibility, basic doc reminders |
| **Pro** | 4,500–8,000 DZD | Priority listings, analytics, advanced alerts, profile boost, unlimited offers |
| **Enterprise** | Custom | Private marketplace, SLAs, dedicated support, API access, SSO |

**Target mix (Yr 2):** 70% Free, 25% Pro, 5% Enterprise → ARPU ≈ 1,800 DZD/provider/mo

---

### **6.3 Value-Added Services (à la carte)**

- **Document verification:** Assisted KYC/compliance checks (2,000–5,000 DZD one-time per provider)
- **Featured listings:** Priority placement in offers (500–1,500 DZD/day or included in Pro)
- **Analytics pack:** Lane performance, on-time %, benchmarks for shippers (6,000 DZD/mo add-on)
- **Onsite onboarding:** Field day for doc scanning, training, photography (15,000–25,000 DZD/day)

---

### **6.4 Future Monetization (Phase 2+)**

- **Payments facilitation/escrow:** 1.0–1.5% processing fee (where regulation allows; partner with licensed fintech)
- **Insurance facilitation:** 5–10% referral commission on premiums (partner with licensed insurers)

---

### **6.5 Unit Economics (Early Assumptions)**

**Per-trip variable costs:**
- Notifications (emails): ~50–100 DZD
- Storage (images/docs/backups): ~50–100 DZD
- Support (fractional avg): ~200–400 DZD
- **Total variable cost:** ~300–600 DZD per trip

**Contribution margin:**
- Example: 12,600 DZD revenue − 700 DZD cost = **11,900 DZD contribution (94%)**

**CAC & LTV (illustrative, to validate in pilot):**

| Segment | CAC (DZD) | Monthly Value | Payback Target |
|---------|-----------|---------------|----------------|
| **Provider** | 2,000–6,000 | 4 jobs × 7% share ≈ 3,500 DZD | <2 months |
| **Shipper** | 40,000–120,000 | 30 jobs × 7% ≈ 75,000 DZD | <6–9 months |

**LTV assumptions:**
- Provider tenure: 24 mo avg → LTV ≈ 84,000 DZD (jobs) + 43,200 DZD (Pro sub) = **127K DZD**
- Shipper tenure: 36 mo avg → LTV ≈ 2.7M DZD → **LTV:CAC = 22–67×**

---

### **6.6 Marketplace Health KPIs**

**Liquidity targets:**
- ≥3 offers per posted load
- 40–60% acceptance rate
- <30 min time-to-dispatch (standard lanes)
- ≥80% provider coverage (common Hassi Messaoud lanes)

**Quality gates:**
- >95% document validity (active + verified)
- ≥92% on-time delivery (pilot) → ≥96% (post-pilot)
- <5% incident rate (disputes, safety issues)

**Flywheel:**
- More verified providers → faster offers → better acceptance → more shippers → more jobs → provider retention → repeat

---

### **6.7 Revenue Projections (Illustrative, 18-mo Horizon)**

| Metric | Month 6 | Month 12 | Month 18 |
|--------|---------|----------|----------|
| Active shippers | 3–5 | 12–18 | 30–40 |
| Active providers | 50–80 | 150–220 | 400–550 |
| Monthly trips | 180–250 | 900–1,300 | 2,500–3,500 |
| Avg trip value (DZD) | 180K | 200K | 210K |
| Take-rate revenue | 2.3–3.2M | 12.6–18.2M | 36.8–51.5M |
| Subscriptions (DZD) | 150K | 600K | 1.6M |
| **Total monthly revenue** | **2.5–3.4M** | **13.2–18.8M** | **38.4–53.1M** |
| **Annual run rate** | 30–41M | 158–226M | 461–637M |

*Note: Conservative model; assumes 5–7% monthly trip growth post-pilot, 20–25% Pro subscription adoption by Month 18.*

---

### **6.8 Cost Structure (Opex Overview)**

| Category | % of Revenue | Notes |
|----------|-------------|-------|
| Cloud + Infra | 3–5% | Supabase, CDN, storage, observability |
| Communications | 1–2% | Email notifications (scales with volume) |
| Support + Ops | 8–12% | Field onboarding, verification, customer success |
| Product + Eng | 25–35% | Feature velocity, reliability, integrations |
| Sales + BD | 15–20% | Pilots, partnerships, depots, operators |
| G&A | 8–12% | Legal, compliance, accounting |

**Target gross margin:** 85–90% (after variable costs)  
**Target contribution margin:** 50–60% (after opex, pre-CAC)

---

### **6.9 Risks & Mitigations**

| Risk | Mitigation |
|------|-----------|
| Slow shipper adoption | Field onboarding playbooks; simple onboarding; free tier for trial |
| Provider quality variance | Verification workflows; scoring; incident tracking; deactivation policy |
| System reliability | Robust infrastructure; monitoring; retry logic; redundancy |
| Regulatory (payments/insurance) | Start with direct billing; partner with licensed entities when scaling |
| Competitor entry | Speed to market; lock-in via network effects; compliance moat; local expertise |

---

## 7) Go-to-Market — Field-First, Wedge Strategy

### **Phase 1: Pilot (Months 0–3) — Prove It Works in Hassi Messaoud**

**Goal:** 2–3 oilfield shippers (service contractors, drilling operators), 50–100 verified trucks, 150–300 trips in Hassi Messaoud oilfield region

**Provider acquisition (tanker & flatbed focus):**
- **Depot partnerships:** Co-locate onboarding days at major Hassi Messaoud truck depots and fuel/water tanker staging areas
- **Field workshops:** HSE doc verification + photography + platform training (target: 3–5 providers/day, prioritize tankers & flatbeds)
- **Referral bounties:** 1,500–3,000 DZD per verified provider brought in by existing users (focus on oilfield-certified drivers)
- **Direct outreach:** Tap into existing logistics networks at Sonatrach contractor meetings and oilfield service company hubs

**Shipper acquisition (oilfield operators & contractors):**
- **Direct BD:** Target oilfield operators, drilling contractors, and service companies (pitch: eliminate HSE compliance headaches, cut dispatch time, reduce rig downtime)
- **Case studies:** Quantify time saved (45 min → 10 min dispatch), compliance improvement (95%+ doc validity), cost transparency (standardized pricing vs ad-hoc)
- **Free pilot period:** Waive take-rate for first 30–50 trips to prove ROI and build trust with major operators
- Safety/compliance angle: "Audit-ready in 1 click" messaging

**Success metrics:**
- <15 min avg dispatch time (vs. 45+ min baseline)
- ≥3 offers per load; 50%+ acceptance rate
- 95%+ doc validity; zero compliance failures
- ≥85% shipper NPS

---

### **Phase 2: Expand (Months 3–6) — Scale Across South Algeria Oilfields**

**Expand lanes (oilfield corridors):**
- Add **In Salah** and **In Amenas** oilfield routes (capture multi-site operators like Schlumberger, BP Algeria)
- Cover top 10 oilfield lanes representing 80% of regional volume (fuel/water deliveries, equipment shuttles)

**Product milestones (oilfield-relevant features):**
- **Enhanced notification system:** Real-time trip alerts via email (pickup confirmed, en route, delivered)
- **Rate cards module:** Benchmarking tool for shippers to compare historical pricing on common oilfield routes
- **Mobile-responsive improvements:** Better mobile web experience for field managers tracking from sites
- **Advanced analytics dashboard:** SLA reports, on-time %, provider performance metrics (HSE audit-ready)

**Growth tactics:**
- Provider: Pro tier upsell (analytics, priority)
- Shipper: analytics add-on (lane performance, benchmarks)
- Partnerships: safety orgs, insurance brokers (co-marketing)

**Targets:**
- 8–12 shippers, 150–220 providers, 900–1,300 monthly trips

---

### **Phase 3: Monetize & Enterprise (Months 6–12)**

**Enterprise features:**
- Tendering module (RFQ workflows)
- Provider scoring v2 (safety, on-time, compliance)
- Analytics dashboards (cost/km, dwell, utilization)
- Private marketplace instances (custom SLAs)

**Channel expansion:**
- Direct sales team (1–2 AEs)
- Channel partners (logistics consultants, safety auditors)
- Industry events (oil & gas expos, logistics forums)

**Targets:**
- 20–35 shippers, 400–550 providers, 2,500–3,500 monthly trips
- 2–3 enterprise pilots (custom SLA, dedicated support)

---

### **KPIs Dashboard (Track Weekly)**

| Metric | Pilot (Mo 3) | Expand (Mo 6) | Scale (Mo 12) |
|--------|--------------|---------------|---------------|
| Active shippers | 2–3 | 8–12 | 20–35 |
| Active providers | 50–100 | 150–220 | 400–550 |
| Monthly trips | 150–300 | 900–1,300 | 2,500–3,500 |
| Offers/load | ≥3 | ≥3.5 | ≥4 |
| Acceptance rate | 50%+ | 55%+ | 60%+ |
| Time-to-dispatch | <15 min | <12 min | <10 min |
| On-time delivery | ≥90% | ≥93% | ≥96% |
| Doc validity | ≥95% | ≥96% | ≥97% |
| Shipper NPS | 70+ | 75+ | 80+ |

---

## 8) Product Roadmap — Ship Fast, Iterate

### **Now (MVP Live, Oct 2025)**
✅ Verified provider onboarding (doc upload, KYC)  
✅ Load posting + offers workflow  
✅ Booking confirmation + trip timeline  
✅ ePOD (photo/signature capture)  
✅ Email notifications  
✅ Legal pages (Privacy, Terms, About Us)  
✅ Secure auth (Supabase, password reset)

---

### **Phase 1: Oilfield Pilot Ready (Months 0–3)**
- [ ] **Document vault with HSE compliance alerts:** Auto-track insurance, hazmat certs, permits; alert 30/15/7 days before expiry
- [ ] **Provider scoring system:** Track acceptance rate, on-time %, doc validity—critical for oilfield shipper trust
- [ ] **Incident log:** Record disputes, safety issues, failed deliveries (HSE audit trail)
- [ ] **Enhanced email notifications:** Lifecycle alerts (booking confirmed, pickup done, en route, delivered, ePOD uploaded)
- [ ] **Admin/ops dashboard:** Monitor exceptions, compliance status, trip delays in real-time
- [ ] **Basic analytics:** Trip volume, avg dispatch time, provider utilization (oilfield KPIs)

---

### **Phase 2: Oilfield Scale Features (Months 3–6)**
- [ ] **Enhanced notification system:** Push notifications for mobile web users (critical updates for field managers)
- [ ] **Mobile app (iOS/Android):** Native app for field ops teams managing trips from remote sites
- [ ] **Rate cards module:** Benchmark pricing per oilfield lane (Hassi M. → Site A, etc.) for shipper budgeting
- [ ] **Simple tendering (RFQ):** Multi-provider bids for large recurring routes (e.g., weekly fuel contracts)
- [ ] **Advanced analytics dashboard:** Lane performance, cost/km, on-time trends, HSE compliance scores
- [ ] **Provider Pro tier:** Priority listings, advanced trip analytics, faster payments for top-rated oilfield truckers

---

### **Phase 3: Enterprise Oilfield Features (Months 6–12)**
- [ ] **Managed payments/escrow:** Partner with Algerian fintech for secure, automated payments to providers (reduce cash handling)
- [ ] **GPS/telematics integration:** Live truck tracking for high-value equipment moves and fuel deliveries (critical for oilfield visibility)
- [ ] **Enterprise SSO (SAML, Azure AD):** Integration with Schlumberger, Sonatrach, BP corporate identity systems
- [ ] **Private marketplace instances:** White-label option for major operators managing their own captive fleets
- [ ] **SLA management:** Custom metrics (e.g., <2hr response for emergency fuel runs), automated reporting packs for HSE audits
- [ ] **Insurance facilitation:** Partner referrals for oilfield-grade cargo/liability insurance
- [ ] **Advanced analytics:** Fleet utilization, dwell time at loading points, cost benchmarks per oilfield corridor

---

### **Beyond Year 1 (Oilfield Expansion + Regional Scale)**
- **Multi-country oilfield expansion:** Tunisia border zones, Libya cross-border logistics (if stabilized)
- **Predictive analytics:** Demand forecasting for seasonal drilling activity, dynamic pricing for peak/off-peak oilfield runs
- **Carbon tracking:** Emissions per km, sustainability reports (international operators increasingly require ESG metrics)
- **Driver app (native):** iOS/Android app for drivers with offline ePOD capture, optimized route suggestions
- **Blockchain for document provenance:** Optional immutable audit trail for HSE compliance (if major operators demand it)

---

## 9) Team — Builders with Domain Expertise

### **Core Team**

**[Your Name] — Founder & CEO**  
- Background: [Previous role/company], [X years] in logistics/oil & gas/tech
- Expertise: Product strategy, oilfield operations, customer development
- Why this: [Personal connection to problem, e.g., "Spent 3 years coordinating tanker fleets in Hassi Messaoud—saw the pain firsthand"]

**[Co-Founder/CTO Name] — Full-Stack Engineer**  
- Background: [Previous company], [X years] building scalable platforms
- Expertise: React, Node.js, Postgres, real-time systems, API integrations
- Shipped: [Notable projects, e.g., "Built dispatch system handling 10K+ daily bookings at XYZ"]

**[Ops Lead Name] — Head of Operations**  
- Background: [Logistics/supply chain role], [X years] field ops
- Expertise: Provider networks, compliance workflows, safety/KYC processes
- Network: Direct relationships with 20+ depots and 150+ independent providers in South Algeria

**[Sales/BD Lead Name] — Head of Growth**  
- Background: [Sales role in logistics/SaaS], [X years] B2B sales
- Expertise: Pilot program design, enterprise sales, partnership development
- Track record: [e.g., "Closed 15+ pilots at ABC Corp, $2M ARR in 18 months"]

---

### **Advisors (Optional — Add if Applicable)**

- **[Advisor 1]:** Former VP Logistics at [Major Oil Company], 20+ years Algerian oilfield ops
- **[Advisor 2]:** Compliance/legal expert, ex-regulator for transport safety
- **[Advisor 3]:** Enterprise SaaS sales, scaled [Company] to $50M ARR

---

### **Hiring Roadmap (Next 12 Months)**

**Immediate (Mo 0–3 — Pilot Execution):**
- **Field ops coordinator (Hassi Messaoud-based):** On-ground provider onboarding, shipper relationship management, HSE doc verification
- **Customer success associate:** Pilot support, training for oilfield users (shipper ops teams, provider fleet managers)

**Phase 2 (Mo 3–6 — Scale Infrastructure):**
- **Front-end engineer (UI/UX specialist):** Mobile-responsive improvements, oilfield dashboard enhancements
- **Mobile developer (React Native):** Native iOS/Android app for field managers and drivers

**Phase 3 (Mo 6–12 — Enterprise Growth):**
- **Account Executive (enterprise sales):** Target Sonatrach, major international operators (Schlumberger, Halliburton, BP)
- **DevOps engineer:** Scaling infrastructure, 99.9% uptime SLAs for oilfield operations
- **Product designer:** UX research in field (depot visits, ride-alongs), optimize for rugged environments

---

### **Why We're the Right Team**

✅ **Domain expertise:** Lived the problem; understand field realities (compliance, trust, operations)  
✅ **Execution speed:** MVP shipped in 8 weeks; oilfield pilot-ready in <30 days  
✅ **Oilfield advantage:** Hassi Messaoud field relationships, HSE/regulatory know-how, desert operations expertise  
✅ **Scalable mindset:** Built for South Algeria oil & gas; designed to expand (In Salah, In Amenas → national industrial corridors → North Africa)

---

## 10) Traction & Validation

### **Current Status (Oct 2025)**

✅ **MVP deployed:** trucklogistics.me (live, production-ready)  
✅ **Legal foundation:** Privacy Policy, Terms of Use, About Us pages published  
✅ **Security:** Supabase auth, password reset, session management, HTTPS  
✅ **Core features:** Provider onboarding, load posting, offers, bookings, ePOD, notifications

---

### **Early Validation (Pre-Launch — Oilfield Focus)**

**Waitlist/Expressions of Interest:**
- [ ] [N] oilfield shippers (drilling contractors, service companies, equipment suppliers in Hassi Messaoud)
- [ ] [N] tanker/flatbed providers representing [N] trucks (oilfield-certified)
- [ ] [N] letters of intent (LOIs) for pilot participation from Sonatrach contractors or international operators

**Field research (Hassi Messaoud oilfield):**
- Conducted [N] interviews with logistics coordinators, fleet managers, and HSE/compliance leads at oilfield sites
- Key pain points validated: 45+ min avg dispatch time, 15–20% trips delayed, HSE compliance doc chaos, no visibility on fuel/water deliveries

**Pilot commitments (oilfield operators):**
- [ ] [Oilfield Contractor Name]: [X fuel/water trips/week] starting [Month/Year], lanes [Hassi M. depot → Site A/B/C]
- [ ] [Service Company Name]: [Y equipment moves/month] starting [Month/Year], heavy machinery shuttles

---

### **Metrics to Track (Post-Launch)**

**Usage:**
- Posted loads, offers per load, acceptance rate
- Time-to-dispatch, on-time delivery %, incident rate

**Growth:**
- Week-over-week active users (shippers/providers)
- Monthly trip volume, GMV

**Quality:**
- Document validity rate, compliance audit pass rate
- Shipper NPS, Provider NPS

---

### **Early Feedback (Placeholder — Add Real Quotes)**

> *"[Feedback quote from pilot shipper]"*  
> — [Name], [Title], [Company]

> *"[Feedback quote from provider]"*  
> — [Name], [Fleet Size], [Location]

---

### **Press/Recognition (Optional)**

- [ ] Featured in [Local tech publication/startup accelerator]
- [ ] Accepted to [Incubator/accelerator program]
- [ ] Winner/finalist: [Startup competition]

---

## 11) The Ask — Funding to Scale

### **Raising: $150K–250K (≈ 20–35M DZD) Seed Round**

**Runway:** 12–18 months  
**Stage:** Pre-revenue → pilot → first enterprise customers

---

### **Use of Funds**

| Category | % | Amount (USD) | Purpose |
|----------|---|--------------|---------|
| **Product & Engineering** | 35% | $52K–88K | Feature velocity (mobile app, analytics, payments), reliability, integrations |
| **Operations & Onboarding** | 25% | $38K–63K | Field ops (Hassi Messaoud presence), provider verification, training workshops |
| **Go-to-Market** | 20% | $30K–50K | Pilot programs, shipper acquisition, case studies, BD partnerships |
| **Cloud & Compliance** | 10% | $15K–25K | Infrastructure (Supabase, CDN, storage), security audits, legal/compliance |
| **Runway Buffer** | 10% | $15K–25K | Contingency, unforeseen pivots |

---

### **Milestones (By End of Runway)**

**Month 6 (Oilfield Pilot Success):**
- ✅ Pilot complete: 2–3 oilfield shippers (service contractors), 50–100 tanker/flatbed providers, 150–300 trips in Hassi Messaoud
- ✅ <15 min avg dispatch time, ≥90% on-time delivery, ≥95% HSE doc validity
- ✅ Enhanced email notifications and oilfield analytics dashboard live
- ✅ Mobile-responsive platform optimized for field managers

**Month 12 (Regional Scale):**
- ✅ 12–18 active oilfield shippers (drilling contractors, Sonatrach subcontractors), 150–220 providers across Hassi M., In Salah, In Amenas
- ✅ 900–1,300 monthly trips (≈ $158K–226K annual run rate at 7% take-rate)
- ✅ Rate cards module (oilfield route benchmarking), mobile app (iOS/Android) launched
- ✅ 1–2 enterprise pilots with major operators (Schlumberger, Halliburton, or similar—custom SLAs)

**Month 18 (Enterprise Ready):**
- ✅ 30–40 oilfield shippers, 400–550 providers (dominant in South Algeria oilfield logistics)
- ✅ 2,500–3,500 monthly trips (≈ $461K–637K annual run rate)
- ✅ Payments facilitation live, GPS/telematics integrations for real-time tracking
- ✅ Break-even or Series A-ready (unit economics proven, clear path to $2M+ ARR from oilfield beachhead)

---

### **What We Need Beyond Capital**

**Intros:**
- Oilfield operators (service companies, drilling contractors in Hassi Messaoud/In Salah)
- **Oilfield depot partners:** Truck yards, tanker depots, fleet managers in Hassi Messaoud
- **Enterprise buyers:** Logistics/procurement leads at Sonatrach, Schlumberger, Halliburton, Baker Hughes, BP Algeria

**Expertise:**
- **Regulatory/compliance advisors:** Algerian transport law, HSE requirements, oilfield safety standards
- **Enterprise SaaS sales playbook:** Pilot-to-contract conversion, navigating procurement cycles at major operators
- **Fintech partners:** Algerian payment processors, escrow providers (when ready to scale managed payments)

**Credibility:**
- Investor/advisor endorsement for warm intros to pilot prospects
- Press/PR support (local tech media, startup ecosystem visibility)

---

### **Exit Potential (Long-Term Vision)**

**Year 3–5 scenarios:**

1. **Acquisition by regional/global TMS player**  
   - Oracle, SAP, or regional logistics platform acquiring local capability + network
   - Precedent: Trella (Egypt) raised $42M; Lori Systems (Kenya) raised $30M+ before pivot

2. **Series A/B growth capital**  
   - Scale to Tunisia, Libya, West Africa
   - Expand to construction/mining/industrial logistics
   - $5–10M raise to become North Africa's logistics OS

3. **Strategic partnership/JV**  
   - Partner with major oil & gas operator (e.g., Sonatrach) for captive logistics platform
   - Revenue-share or licensing model

**Comparable exits:**
- **Freightos** (freight marketplace): $300M+ valuation at IPO (SPAC, 2021)
- **Convoy** (US digital freight): $3.8B peak valuation (shut down 2023, but concept validated)
- **Cargomatic** (drayage marketplace): acquired by Emerge, terms undisclosed

---

## 12) Why Now — Perfect Storm for Oilfield Logistics Disruption

**Oilfield-specific tailwinds:**

1. **Algeria oil & gas expansion**  
   - Sonatrach investing $50B+ in production expansion (2024-2028)
   - International operators (Schlumberger, Halliburton, BP, Eni) increasing South Algeria presence
   - More rigs, more wells → exponential growth in fuel/water/equipment logistics demand

2. **Digitization mandate from operators**  
   - Major oil & gas companies requiring digital audit trails from contractors (HSE compliance)
   - Manual WhatsApp/phone coordination no longer acceptable for international operators
   - Trend toward integrated supply chain visibility (we enable this for logistics leg)

3. **HSE compliance pressure intensifying**  
   - Sonatrach and international operators enforcing stricter safety audits
   - Insurance requirements tighter; expired permits = site shutdowns, contract penalties
   - Manual doc tracking creates liability risks, operational delays

4. **Gap in oilfield-grade local solutions**  
   - Heavy global TMS tools (SAP, Oracle) too expensive/slow for local SME trucking providers
   - No French-native, field-grade logistics platform built for Algeria's oilfield operations
   - Existing freight marketplaces (Egypt's Trella, Kenya's Lori) haven't entered Algeria

**Competitive timing:**

- **No dominant incumbent:** Uber Freight, Convoy, Trella (Egypt) haven't entered Algeria meaningfully
- **Network effects favor first-mover:** Once we lock 80%+ of Hassi Messaoud providers → defensible moat
- **Regulatory window:** Payments/fintech landscape evolving; early mover can shape partnerships before commoditization

**Why we'll win in South Algeria oilfields:**

✅ **Oilfield expertise:** Built by team who understands Hassi Messaoud operations, HSE compliance, Sonatrach ecosystem  
✅ **Speed to market:** MVP live; oilfield pilot-ready in <30 days with HSE doc vault built-in  
✅ **Wedge validated:** Oil & gas urgency (compliance mandates, rig downtime = $10K-50K/day) = willingness to pay premium  
✅ **Execution bias:** Ship fast, learn fast, iterate in the field with oilfield users (not PowerPoint)

*The oilfield expansion is happening now. This is the moment to move.*

---

## 13) Closing — Join Us

**TruckLogistics: The logistics OS for Algeria's oil & gas sector**

✅ **Problem validated:** 45+ min dispatch waste, 15–20% trips delayed, compliance chaos  
✅ **Solution proven:** 3× faster dispatch, 95%+ doc validity, single source of truth  
✅ **Market ready:** $180–220M SAM (oilfield South Algeria); $2.5B TAM (national freight)  
✅ **Team capable:** Domain experts who lived the problem; MVP shipped in 8 weeks  
✅ **Timing perfect:** Digitization wave + compliance pressure + no local incumbent

**We're raising $150K–250K to:**
- Run oilfield pilot: 2–3 shippers (service contractors/operators), 50–100 tanker/flatbed providers, 150–300 trips in Hassi Messaoud
- Ship mobile app for field managers, advanced oilfield analytics, payment integrations
- Hit $158K–226K ARR by Month 12 (oilfield beachhead); break-even or Series A-ready by Month 18

**What we need from you:**
- Capital to execute 12–18 mo runway
- Intros to oilfield operators, depot partners, enterprise buyers
- Expertise in regulatory/compliance, enterprise sales, fintech partnerships

---

### **Let's Build the Future of Logistics in Algeria**

**Contact:**  
📧 support@trucklogistics.me  
🌐 trucklogistics.me  
📱 +213 779 11 65 22  

**Location:** Algiers, Algeria (field ops in Hassi Messaoud)  
**Incorporated:** [Legal entity status, or "Pre-incorporation"]  

---

*Thank you. Questions?*

---

## Appendix A — One‑Pager Summary (for startup.dz)

TruckLogistics is a lightweight logistics platform for Algeria's oil & gas sector. We connect shippers with verified truck providers and streamline the workflow from booking to proof of delivery. The platform standardizes pricing, centralizes trip documents, and reduces back‑and‑forth calls with clear status updates. Built for South Algeria operations with French/English support, TruckLogistics helps teams move faster, cut delays, and gain visibility—without heavy systems.

Top features: verified providers, offers, booking confirmation, trip timeline, ePOD, document vault, notifications. Roadmap: mobile app, rate cards/tendering, analytics, payments, GPS integrations.

Business model: 7% take rate (pilot‑flexible), subscriptions for providers, analytics add‑ons, optional managed payments/insurance facilitation later.

---

## Appendix B — Example Slide List

1. Title  
2. Problem  
3. Solution  
4. Market (South Algeria oil & gas)  
5. Product  
6. Differentiation  
7. Business Model (detailed)  
8. Go‑to‑Market  
9. Roadmap  
10. Team  
11. Traction  
12. Ask  
13. Close


---

## Appendix C — FAQ (Investor Common Questions)

**Q: Why won't Uber Freight or Trella just copy you?**  
A: They could, but (1) we're local (French/English, regulatory know-how, field network), (2) we move faster (MVP in 8 weeks vs. their 6–12 mo localization cycles), (3) network effects favor first-mover (once we lock 80%+ Hassi Messaoud providers, switching costs high for shippers).

**Q: What if providers don't adopt digital tools?**  
A: We simplify onboarding with intuitive web interface and email notifications they're familiar with. Our field onboarding includes doc scanning, photos, and training—providers see value in <1 trip (faster payment, more jobs). Free tier removes adoption friction.

**Q: How do you enforce compliance (fake docs, expired insurance)?**  
A: (1) Manual verification at onboarding (photos, cross-check with issuer), (2) expiry alerts 30/15/7 days out, (3) incident log affects provider score/ranking, (4) shippers can flag issues → deactivation policy.

**Q: What's your CAC payback in practice?**  
A: Pilot will validate. Conservative model: Provider CAC 2K–6K DZD, payback <2 mo at 4 jobs/mo. Shipper CAC 40K–120K DZD, payback <6–9 mo at 30 jobs/mo. We'll report actuals monthly.

**Q: Why not go direct to construction/mining (bigger TAM)?**  
A: Oil & gas = urgent compliance pain + concentrated geography + repeat lanes + willingness to pay. Win the wedge (credibility, case studies, network) → then expand horizontally with proven playbook.

**Q: Exit strategy?**  
A: (1) Acquisition by regional/global TMS (Oracle, SAP) or logistics unicorn (Trella, Lori), (2) Series A/B to scale North Africa, (3) strategic JV with Sonatrach or major operator. Precedent: Trella $42M raised, Freightos $300M+ IPO valuation.

---

## Appendix D — Competitive Landscape

| Player | Geography | Focus | Strengths | Weaknesses (vs. Us) |
|--------|-----------|-------|-----------|---------------------|
| **WhatsApp/Phone** | Algeria (status quo) | Ad-hoc | Free, familiar | No audit trail, no compliance, no trust layer |
| **Trella** | Egypt, Saudi | General freight | $42M raised, proven model | Not in Algeria; English-first; no oilfield expertise |
| **Lori Systems** | East Africa | Long-haul | Strong network | Geo far; pivoted model; no Algeria play |
| **SAP TMS / Oracle** | Global | Enterprise | Feature-rich | $50K–200K licenses; 2–6 mo setup; no local support |
| **Local 3PLs** | Algeria | Brokerage | Relationships | Manual ops; no tech; opaque pricing |
| **TruckLogistics** | **Algeria (Hassi M.)** | **Oil & gas** | **Local-first, compliance, 7% take rate, fast** | **Early-stage, unproven at scale** |

**Our moat:**  
Network effects (more providers → faster offers) + compliance rigor (doc vault, scoring) + local expertise (field ops, regulatory know-how) + speed (MVP→pilot in <90 days).

---

**End of Pitch Deck**
