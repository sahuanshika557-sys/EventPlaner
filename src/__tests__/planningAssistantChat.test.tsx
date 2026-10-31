import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanningAssistantChat } from '../components/ai/PlanningAssistantChat';
import { INITIAL_WEDDING_EVENT } from '../data/defaultEvents';
import * as aiService from '../services/aiService';

describe('PlanningAssistantChat Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <PlanningAssistantChat
        currentEvent={INITIAL_WEDDING_EVENT}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders welcome greeting with event title when isOpen is true', () => {
    render(
      <PlanningAssistantChat
        currentEvent={INITIAL_WEDDING_EVENT}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getAllByText(/Planning Assistant/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/LIVE CONTEXT/i)).toBeDefined();
    expect(screen.getAllByText(new RegExp(INITIAL_WEDDING_EVENT.title, 'i')).length).toBeGreaterThan(0);
  });

  it('sends user message and displays assistant response', async () => {
    vi.spyOn(aiService, 'askPlanningAssistant').mockResolvedValue({
      success: true,
      isLiveAI: false,
      reply: 'To cut 10% from your budget, renegotiate your venue catering package.',
    });

    render(
      <PlanningAssistantChat
        currentEvent={INITIAL_WEDDING_EVENT}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const input = screen.getByLabelText('Planning assistant question') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'How can I save money on flowers?' } });

    const sendBtn = screen.getByLabelText('Send question to assistant');
    fireEvent.click(sendBtn);

    expect(screen.getByText('How can I save money on flowers?')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/To cut 10% from your budget, renegotiate your venue catering package/i)).toBeDefined();
    });
  });

  it('clicking quick prompt chip triggers assistant call', async () => {
    const askSpy = vi.spyOn(aiService, 'askPlanningAssistant').mockResolvedValue({
      success: true,
      isLiveAI: false,
      reply: 'Here are the recommended budget cuts.',
    });

    render(
      <PlanningAssistantChat
        currentEvent={INITIAL_WEDDING_EVENT}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const chip = screen.getByText('Cut 10% from budget');
    fireEvent.click(chip);

    await waitFor(() => {
      expect(askSpy).toHaveBeenCalledWith(
        expect.stringContaining('How do I cut 10% from my budget?'),
        INITIAL_WEDDING_EVENT
      );
    });
  });

  it('invokes onClose when close button is clicked', () => {
    const handleClose = vi.fn();

    render(
      <PlanningAssistantChat
        currentEvent={INITIAL_WEDDING_EVENT}
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText('Close Planning Assistant');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
