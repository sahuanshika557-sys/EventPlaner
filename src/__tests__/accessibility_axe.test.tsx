import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Navbar } from '../components/layout/Navbar';
import { Navigation } from '../components/layout/Navigation';
import { KpiBanner } from '../components/common/KpiBanner';
import { BudgetAlertBanner } from '../components/budget/BudgetAlertBanner';
import { BudgetDistributionBar } from '../components/budget/BudgetDistributionBar';
import { Modal } from '../components/common/Modal';
import { BrandLogo } from '../components/layout/BrandLogo';
import { INITIAL_WEDDING_EVENT } from '../data/defaultEvents';
import type { CategorySummary } from '../types/budget';

interface AxeLikeResult {
  violations: Array<{ id: string; description: string; helpUrl?: string }>;
}

function expectNoAxeViolations(results: AxeLikeResult) {
  if (results.violations.length > 0) {
    const errorMsg = results.violations
      .map((v) => `${v.id}: ${v.description} (${v.helpUrl})`)
      .join('\n');
    throw new Error(`Axe accessibility violations found:\n${errorMsg}`);
  }
}

describe('WCAG 2.1 AA Accessibility Testing (axe-core)', () => {
  it('verifies BrandLogo has zero axe a11y violations', async () => {
    const { container } = render(<BrandLogo size="md" showSubtitle={true} />);
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies Navigation tabs comply with WCAG 2.1 AA (tablist semantics)', async () => {
    const { container } = render(
      <div>
        <Navigation
          activeTab="dashboard"
          onTabChange={() => {}}
          domainName="Weddings"
          hasBudgetAlert={false}
          timelineConflictCount={0}
        />
        <div id="tabpanel-dashboard" role="tabpanel" aria-labelledby="nav-tab-dashboard">
          Dashboard Content
        </div>
        <div id="tabpanel-domain-hub" role="tabpanel" aria-labelledby="nav-tab-domain-hub" hidden>
          Domain Content
        </div>
        <div id="tabpanel-budget" role="tabpanel" aria-labelledby="nav-tab-budget" hidden>
          Budget Content
        </div>
        <div id="tabpanel-timeline" role="tabpanel" aria-labelledby="nav-tab-timeline" hidden>
          Timeline Content
        </div>
        <div id="tabpanel-vendors" role="tabpanel" aria-labelledby="nav-tab-vendors" hidden>
          Vendors Content
        </div>
        <div id="tabpanel-ai-engine" role="tabpanel" aria-labelledby="nav-tab-ai-engine" hidden>
          AI Content
        </div>
      </div>
    );
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies KpiBanner analytics cards have zero a11y violations', async () => {
    const { container } = render(<KpiBanner currentEvent={INITIAL_WEDDING_EVENT} />);
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies BudgetAlertBanner renders accessible alert live regions', async () => {
    const { container } = render(
      <BudgetAlertBanner
        isOverBudget={true}
        percentSpent={115}
        totalSpent={57500}
        totalBudget={50000}
        remainingBudget={-7500}
        currency="USD"
      />
    );
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies BudgetDistributionBar progress bar has proper accessible value attributes', async () => {
    const mockCategories: CategorySummary[] = [
      {
        category: 'venue',
        name: 'Venue & Reception',
        targetPercent: 35,
        targetAmount: 17500,
        allocatedAmount: 18000,
        actualSpent: 18000,
        variance: -500,
        isOverBudget: true,
        overBudgetPercentage: 2.8,
      },
      {
        category: 'catering',
        name: 'Artisanal Catering',
        targetPercent: 30,
        targetAmount: 15000,
        allocatedAmount: 15000,
        actualSpent: 15000,
        variance: 0,
        isOverBudget: false,
        overBudgetPercentage: 0,
      },
    ];

    const { container } = render(
      <BudgetDistributionBar
        categories={mockCategories}
        totalSpent={33000}
        totalBudget={50000}
        percentSpent={66}
        currency="USD"
      />
    );
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies accessible Modal dialog contains role="dialog" and aria-modal="true"', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Accessible Modal"
        description="Verifying accessible modal container properties"
      >
        <div>
          <label htmlFor="test-input">Test Field</label>
          <input id="test-input" type="text" defaultValue="Accessible content" />
        </div>
      </Modal>
    );
    const results = await axe(container);
    expectNoAxeViolations(results);
  });

  it('verifies Navbar with domain switcher has zero axe violations', async () => {
    const { container } = render(
      <Navbar
        currentEvent={INITIAL_WEDDING_EVENT}
        activeDomain="wedding"
        onSwitchDomain={() => {}}
        onResetDefaults={() => {}}
        hasBudgetAlert={false}
        timelineConflictCount={0}
      />
    );
    const results = await axe(container);
    expectNoAxeViolations(results);
  });
});
