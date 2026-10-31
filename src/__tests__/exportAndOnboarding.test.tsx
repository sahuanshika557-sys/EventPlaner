import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareablePlanModal } from '../components/export/ShareablePlanModal';
import { EventOnboardingModal } from '../components/onboarding/EventOnboardingModal';
import { INITIAL_WEDDING_EVENT } from '../data/defaultEvents';

describe('Export & Onboarding Workflows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ShareablePlanModal (Export Plan as PDF, CSV, and Clipboard)', () => {
    it('renders event summary with title, domain, and budget breakdown', () => {
      render(
        <ShareablePlanModal
          isOpen={true}
          onClose={() => {}}
          currentEvent={INITIAL_WEDDING_EVENT}
        />
      );

      expect(screen.getByText('Export & Share Master Plan')).toBeDefined();
      expect(screen.getByText(INITIAL_WEDDING_EVENT.title)).toBeDefined();
      expect(screen.getAllByText(/WEDDING/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Print / Export PDF')).toBeDefined();
      expect(screen.getByText('Download CSV')).toBeDefined();
      expect(screen.getByText('Copy Summary')).toBeDefined();
    });

    it('triggers window.print when Print / Export PDF button is clicked', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(
        <ShareablePlanModal
          isOpen={true}
          onClose={() => {}}
          currentEvent={INITIAL_WEDDING_EVENT}
        />
      );

      const printBtn = screen.getByText('Print / Export PDF');
      fireEvent.click(printBtn);

      expect(printSpy).toHaveBeenCalled();
    });

    it('copies executive brief to clipboard when Copy Summary button is clicked', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(
        <ShareablePlanModal
          isOpen={true}
          onClose={() => {}}
          currentEvent={INITIAL_WEDDING_EVENT}
        />
      );

      const copyBtn = screen.getByText('Copy Summary');
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalled();
      expect(writeTextMock.mock.calls[0][0]).toContain('UTSAVOS EXECUTIVE EVENT PLAN');
    });

    it('generates and triggers CSV download when Download CSV is clicked', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      render(
        <ShareablePlanModal
          isOpen={true}
          onClose={() => {}}
          currentEvent={INITIAL_WEDDING_EVENT}
        />
      );

      const csvBtn = screen.getByText('Download CSV');
      fireEvent.click(csvBtn);

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('EventOnboardingModal (Under 1 Minute Event Setup)', () => {
    it('renders domain selection cards for Wedding, Birthday, and Community', () => {
      render(
        <EventOnboardingModal
          isOpen={true}
          onClose={() => {}}
          onCreateEvent={() => {}}
        />
      );

      expect(screen.getByText('Create New Event in Under 1 Minute')).toBeDefined();
      expect(screen.getByText('Luxury Wedding')).toBeDefined();
      expect(screen.getByText('Milestone Birthday')).toBeDefined();
      expect(screen.getByText('Community Festival')).toBeDefined();
    });

    it('selecting Wedding advances to step 2 with wedding defaults', () => {
      render(
        <EventOnboardingModal
          isOpen={true}
          onClose={() => {}}
          onCreateEvent={() => {}}
        />
      );

      fireEvent.click(screen.getByText('Luxury Wedding'));

      const titleInput = screen.getByLabelText(/Event Title/i) as HTMLInputElement;
      expect(titleInput.value).toContain('Siddharth & Rhea’s Royal Wedding');
      expect(screen.getByText('Next: Budget & Goals')).toBeDefined();
    });

    it('completing onboarding triggers onCreateEvent with auto-scheduled milestones and vendor templates', () => {
      const handleCreate = vi.fn();

      render(
        <EventOnboardingModal
          isOpen={true}
          onClose={() => {}}
          onCreateEvent={handleCreate}
        />
      );

      // Step 1: Select birthday
      fireEvent.click(screen.getByText('Milestone Birthday'));

      // Step 2: Proceed to budget
      const nextBtn = screen.getByText('Next: Budget & Goals');
      fireEvent.click(nextBtn);

      // Step 3: Deploy event
      const submitBtn = screen.getByText(/Launch.*Planner/i);
      fireEvent.click(submitBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      const createdEvent = handleCreate.mock.calls[0][0];
      expect(createdEvent.domain).toBe('birthday');
      expect(createdEvent.macroMilestones.length).toBeGreaterThanOrEqual(4);
      expect(createdEvent.vendors.length).toBeGreaterThan(0);
      expect(createdEvent.budgetItems.length).toBeGreaterThan(0);
    });
  });
});
