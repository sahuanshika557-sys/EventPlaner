import React, { useState, useMemo, Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Navbar } from './components/layout/Navbar';
import { Navigation, type NavTabId } from './components/layout/Navigation';
import { KpiBanner } from './components/common/KpiBanner';
import { DashboardOverview } from './components/dashboard/DashboardOverview';

const BudgetMatrix = lazy(() =>
  import('./components/budget/BudgetMatrix').then((m) => ({ default: m.BudgetMatrix }))
);
const DualLayerTimeline = lazy(() =>
  import('./components/timeline/DualLayerTimeline').then((m) => ({ default: m.DualLayerTimeline }))
);
const VendorBoard = lazy(() =>
  import('./components/vendors/VendorBoard').then((m) => ({ default: m.VendorBoard }))
);
const AIIdeaEngine = lazy(() =>
  import('./components/ai/AIIdeaEngine').then((m) => ({ default: m.AIIdeaEngine }))
);
const WeddingFlow = lazy(() =>
  import('./components/domains/WeddingFlow').then((m) => ({ default: m.WeddingFlow }))
);
const BirthdayFlow = lazy(() =>
  import('./components/domains/BirthdayFlow').then((m) => ({ default: m.BirthdayFlow }))
);
const CommunityFlow = lazy(() =>
  import('./components/domains/CommunityFlow').then((m) => ({ default: m.CommunityFlow }))
);
const PlanningAssistantChat = lazy(() =>
  import('./components/ai/PlanningAssistantChat').then((m) => ({ default: m.PlanningAssistantChat }))
);
const EventOnboardingModal = lazy(() =>
  import('./components/onboarding/EventOnboardingModal').then((m) => ({ default: m.EventOnboardingModal }))
);
const ShareablePlanModal = lazy(() =>
  import('./components/export/ShareablePlanModal').then((m) => ({ default: m.ShareablePlanModal }))
);
import { useEventPlanner } from './hooks/useEventPlanner';
import { detectTimelineConflicts } from './utils/time';
import { Calendar, MapPin, Users, Sparkles, Bot } from 'lucide-react';
import { getHeroBannerImage } from './utils/aiImages';
import type { WeddingCulture } from './types/wedding';
import type { BudgetLineItem } from './types/budget';
import type { TimelineEntry } from './types/timeline';
import './styles/index.css';

export const App: React.FC = () => {
  const {
    activeDomain,
    switchDomain,
    currentEvent,
    updateBudgetItems,
    updateTotalBudget,
    updateCurrency,
    updateMacroMilestones,
    updateRunOfShow,
    updateVendors,
    saveAIIdea,
    updateWeddingCulture,
    updateWeddingScheduleDays,
    updateGuests,
    updateTables,
    updateBridalParty,
    updateBirthdayGames,
    updatePartyFavors,
    updateBirthdayDetails,
    updateCommunityPermits,
    updateSafetyChecklist,
    updateVolunteerShifts,
    updateCrowdSafety,
    createCustomEvent,
    resetToFactoryDefaults,
  } = useEventPlanner();

  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShareablePlanOpen, setIsShareablePlanOpen] = useState(false);

  // Compute live budget warning state
  const hasBudgetAlert = useMemo(() => {
    const totalSpent = currentEvent.budgetItems.reduce((acc, it) => acc + (it.actualCost || 0), 0);
    return totalSpent > currentEvent.totalBudget || (totalSpent / (currentEvent.totalBudget || 1)) >= 0.9;
  }, [currentEvent.budgetItems, currentEvent.totalBudget]);

  // Compute live timeline conflicts count
  const timelineConflicts = useMemo(() => {
    return detectTimelineConflicts(currentEvent.runOfShow);
  }, [currentEvent.runOfShow]);

  const domainDisplayName = useMemo(() => {
    if (activeDomain === 'wedding') return 'Weddings';
    if (activeDomain === 'birthday') return 'Birthdays';
    return 'Community Events';
  }, [activeDomain]);

  return (
    <ErrorBoundary>
      <div
        data-domain={activeDomain}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Skip to Main Content Link for Screen Readers & Keyboard Navigation (WCAG 2.1 AA 2.4.1) */}
        <a href="#main-content" className="skip-to-content">
          Skip to Main Content
        </a>

        {/* Modern SaaS Global Top Navigation */}
        <Navbar
          currentEvent={currentEvent}
          activeDomain={activeDomain}
          onSwitchDomain={(domain) => {
            switchDomain(domain);
            setActiveTab('dashboard');
          }}
          onResetDefaults={resetToFactoryDefaults}
          hasBudgetAlert={hasBudgetAlert}
          timelineConflictCount={timelineConflicts.length}
          onQuickAddItem={(type) => {
            if (type === 'budget') setActiveTab('budget');
            else if (type === 'timeline') setActiveTab('timeline');
            else if (type === 'vendor') setActiveTab('vendors');
          }}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenShareablePlan={() => setIsShareablePlanOpen(true)}
        />

        {/* Global Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          domainName={domainDisplayName}
          hasBudgetAlert={hasBudgetAlert}
          timelineConflictCount={timelineConflicts.length}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          aria-label="UtsavOS Main Dashboard"
          style={{
            flex: 1,
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            padding: '2rem 1.5rem 4rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Panoramic Hero Ambient Banner */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '1.75rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
              minHeight: '175px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Ambient Background Image with Floating Animation */}
            <div
              className="hero-floating-bg"
              style={{
                position: 'absolute',
                inset: '-10px',
                backgroundImage: `url(${getHeroBannerImage(activeDomain)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                zIndex: 0,
                opacity: 0.38,
                filter: 'saturate(1.2) contrast(1.1)',
              }}
              aria-hidden="true"
            />

            {/* Dark Gradient Overlay for Maximum WCAG 2.1 AA Contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(11, 15, 25, 0.96) 0%, rgba(11, 15, 25, 0.82) 55%, rgba(11, 15, 25, 0.65) 100%)',
                zIndex: 1,
              }}
              aria-hidden="true"
            />

            {/* Foreground Content */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '1.75rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div style={{ maxWidth: '680px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--event-accent-solid, #38bdf8)',
                      border: '1px solid var(--event-accent-solid, #38bdf8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Sparkles size={12} />
                    {activeDomain} Suite
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    Live Operations Command
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {currentEvent.title}
                </h1>
                <p
                  style={{
                    margin: '0.4rem 0 0',
                    fontSize: '0.92rem',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {currentEvent.tagline}
                </p>
              </div>

              {/* Glass Metadata Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.85rem',
                    color: '#f8fafc',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                  }}
                >
                  <Calendar size={16} color="#fbbf24" />
                  <span style={{ fontWeight: 600 }}>{currentEvent.date}</span>
                </div>

                <div
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.85rem',
                    color: '#f8fafc',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                  }}
                >
                  <MapPin size={16} color="#38bdf8" />
                  <span style={{ fontWeight: 600 }}>{currentEvent.location}</span>
                </div>

                <div
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.85rem',
                    color: '#f8fafc',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                  }}
                >
                  <Users size={16} color="#34d399" />
                  <span style={{ fontWeight: 600 }}>{currentEvent.guestCount} Guests Expected</span>
                </div>

                {/* Cultural Tradition & Ritual Archetype Selector */}
                {activeDomain === 'wedding' && (
                  <div
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem',
                      color: '#f8fafc',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      borderRadius: '10px',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <Sparkles size={15} color="#f59e0b" />
                    <label
                      htmlFor="tradition-archetype-select"
                      style={{ fontWeight: 700, color: '#fde68a', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      Tradition:
                    </label>
                    <select
                      id="tradition-archetype-select"
                      aria-label="Tradition & Ritual Archetype"
                      value={currentEvent.weddingData?.culture || 'north_indian'}
                      onChange={(e) => updateWeddingCulture(e.target.value as WeddingCulture)}
                      style={{
                        background: '#0f172a',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '6px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="north_indian">Hindu (Vedic / North Indian)</option>
                      <option value="punjabi_sikh">Sikh (Anand Karaj / Punjabi)</option>
                      <option value="muslim_nikah">Muslim (Nikah & Walima)</option>
                      <option value="south_indian">South Indian (Tamil / Telugu / Malayali Muhurtham)</option>
                      <option value="fusion_cross_cultural">Modern Inter-faith / Fusion</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero KPI Analytics Bar (Real-Time across all tabs) */}
          <KpiBanner currentEvent={currentEvent} />

          {/* Tab 0: Dashboard Overview */}
          <div
            id="tabpanel-dashboard"
            role="tabpanel"
            aria-labelledby="nav-tab-dashboard"
            hidden={activeTab !== 'dashboard'}
          >
            {activeTab === 'dashboard' && (
              <DashboardOverview
                currentEvent={currentEvent}
                activeDomain={activeDomain}
                onNavigate={(tab) => setActiveTab(tab as NavTabId)}
              />
            )}
          </div>

          <Suspense fallback={<LoadingSpinner label="Loading celebration workspace..." />}>
            {/* Tab 1: Specialized Domain Operations Hub */}
          <div
            id="tabpanel-domain-hub"
            role="tabpanel"
            aria-labelledby="nav-tab-domain-hub"
            hidden={activeTab !== 'domain-hub'}
          >
            {activeTab === 'domain-hub' && (
              <>
                {activeDomain === 'wedding' && currentEvent.weddingData && (
                  <WeddingFlow
                    scheduleDays={currentEvent.weddingData.scheduleDays}
                    guests={currentEvent.weddingData.guests}
                    tables={currentEvent.weddingData.tables}
                    bridalParty={currentEvent.weddingData.bridalParty}
                    culture={currentEvent.weddingData.culture || 'north_indian'}
                    onUpdateScheduleDays={updateWeddingScheduleDays}
                    onUpdateGuests={updateGuests}
                    onUpdateTables={updateTables}
                    onUpdateBridalParty={updateBridalParty}
                    onUpdateCulture={updateWeddingCulture}
                    onAddBudgetItem={(item) => {
                      const newItem: BudgetLineItem = {
                        id: `ritual_b_${Date.now()}`,
                        name: item.name,
                        category: item.category,
                        estimatedCost: item.estimatedCost,
                        actualCost: item.actualCost,
                        isPaid: false,
                        notes: 'Cultural Ritual Protocol Requirement',
                      };
                      updateBudgetItems([...currentEvent.budgetItems, newItem]);
                    }}
                    onAddTimelineEntry={(entry) => {
                      const newEntry: TimelineEntry = {
                        id: `ritual_t_${Date.now()}`,
                        time: entry.time,
                        title: entry.title,
                        owner: entry.owner || 'Ritual Lead',
                        location: entry.location || 'Mandap / Altar',
                        milestone: entry.milestone || 'Ceremony Rites',
                        status: entry.status || 'scheduled',
                        durationMinutes: entry.durationMinutes || 45,
                      };
                      updateRunOfShow([...currentEvent.runOfShow, newEntry]);
                    }}
                  />
                )}

                {activeDomain === 'birthday' && currentEvent.birthdayData && (
                  <BirthdayFlow
                    data={currentEvent.birthdayData}
                    onUpdateGames={updateBirthdayGames}
                    onUpdateFavors={updatePartyFavors}
                    onUpdateDetails={updateBirthdayDetails}
                  />
                )}

                {activeDomain === 'community' && currentEvent.communityData && (
                  <CommunityFlow
                    permits={currentEvent.communityData.permits}
                    safetyChecklist={currentEvent.communityData.safetyChecklist}
                    volunteerShifts={currentEvent.communityData.volunteerShifts}
                    crowdSafety={currentEvent.communityData.crowdSafety}
                    onUpdatePermits={updateCommunityPermits}
                    onUpdateSafetyChecklist={updateSafetyChecklist}
                    onUpdateVolunteerShifts={updateVolunteerShifts}
                    onUpdateCrowdSafety={updateCrowdSafety}
                  />
                )}
              </>
            )}
          </div>

          {/* Tab 2: Interactive Budget Matrix */}
          <div
            id="tabpanel-budget"
            role="tabpanel"
            aria-labelledby="nav-tab-budget"
            hidden={activeTab !== 'budget'}
          >
            {activeTab === 'budget' && (
              <BudgetMatrix
                totalBudget={currentEvent.totalBudget}
                items={currentEvent.budgetItems}
                currency={currentEvent.currency}
                onUpdateItems={updateBudgetItems}
                onUpdateBudget={updateTotalBudget}
                onUpdateCurrency={updateCurrency}
              />
            )}
          </div>

          {/* Tab 3: Dual-Layer Timeline */}
          <div
            id="tabpanel-timeline"
            role="tabpanel"
            aria-labelledby="nav-tab-timeline"
            hidden={activeTab !== 'timeline'}
          >
            {activeTab === 'timeline' && (
              <DualLayerTimeline
                macroMilestones={currentEvent.macroMilestones}
                runOfShow={currentEvent.runOfShow}
                eventDate={currentEvent.date}
                domain={activeDomain}
                onUpdateMilestones={updateMacroMilestones}
                onUpdateRunOfShow={updateRunOfShow}
              />
            )}
          </div>

          {/* Tab 4: Vendor Board */}
          <div
            id="tabpanel-vendors"
            role="tabpanel"
            aria-labelledby="nav-tab-vendors"
            hidden={activeTab !== 'vendors'}
          >
            {activeTab === 'vendors' && (
              <VendorBoard
                vendors={currentEvent.vendors}
                currency={currentEvent.currency}
                domain={activeDomain}
                onUpdateVendors={updateVendors}
              />
            )}
          </div>

          {/* Tab 5: GenAI Concept Engine */}
          <div
            id="tabpanel-ai-engine"
            role="tabpanel"
            aria-labelledby="nav-tab-ai-engine"
            hidden={activeTab !== 'ai-engine'}
          >
            {activeTab === 'ai-engine' && (
              <AIIdeaEngine
                eventDomain={activeDomain}
                defaultTheme={currentEvent.tagline}
                guestCount={currentEvent.guestCount}
                totalBudget={currentEvent.totalBudget}
                culture={currentEvent.weddingData?.culture || 'north_indian'}
                onSaveConcept={saveAIIdea}
                onAddBudgetItem={(item) => {
                  const newItem = {
                    id: `ai_b_${Date.now()}`,
                    name: item.name,
                    category: item.category,
                    estimatedCost: item.estimatedCost,
                    actualCost: item.actualCost,
                    isPaid: false,
                    notes: 'Synthesized via GenAI Concept Engine',
                  };
                  updateBudgetItems([...currentEvent.budgetItems, newItem]);
                }}
              />
            )}
          </div>
          </Suspense>
        </main>

        {/* Accessible Footer */}
        <footer
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0a0d18',
            padding: '1.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span>
              UtsavOS | Planora AI Enterprise Event Operating System • Built with Strict TypeScript, SOLID Architecture & WCAG 2.1 AA Compliance.
            </span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span>Security: OWASP Input Sanitized</span>
              <span>Zero Inline Secrets</span>
              <span>Floating-Point Safe Engine</span>
            </div>
          </div>
        </footer>

        {/* Floating AI Assistant Trigger Button (Bottom Right) */}
        {!isAssistantOpen && (
          <button
            type="button"
            id="btn-floating-assistant"
            onClick={() => setIsAssistantOpen(true)}
            aria-label="Open conversational AI Planning Assistant"
            className="btn-primary-glow"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              padding: '0.75rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(245, 158, 11, 0.45)',
              zIndex: 900,
            }}
          >
            <Bot size={18} />
            <span>Ask Planning AI</span>
          </button>
        )}

        {/* Modals & Drawers */}
        <Suspense fallback={null}>
          <PlanningAssistantChat
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            currentEvent={currentEvent}
          />

          <EventOnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            onCreateEvent={createCustomEvent}
          />

          <ShareablePlanModal
            isOpen={isShareablePlanOpen}
            onClose={() => setIsShareablePlanOpen(false)}
            currentEvent={currentEvent}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;
