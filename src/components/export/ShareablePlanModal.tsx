import React, { useState } from 'react';
import type { EventModel } from '../../types/event';
import { formatCurrency } from '../../utils/currency';
import {
  getVendorPipelineStats,
  getBudgetSummaryStats,
  getMilestoneSummaryStats,
  calculateReadinessScore,
} from '../../utils/eventSelectors';
import { Modal } from '../common/Modal';
import { Download, Printer, Copy, Check } from 'lucide-react';

interface ShareablePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventModel;
}

export const ShareablePlanModal: React.FC<ShareablePlanModalProps> = ({
  isOpen,
  onClose,
  currentEvent,
}) => {
  const [copied, setCopied] = useState(false);

  const budgetStats = getBudgetSummaryStats(currentEvent.totalBudget, currentEvent.budgetItems);
  const milestoneStats = getMilestoneSummaryStats(currentEvent.macroMilestones, currentEvent.date);
  const vendorStats = getVendorPipelineStats(currentEvent.vendors);
  const readiness = calculateReadinessScore(milestoneStats, vendorStats, budgetStats, currentEvent.runOfShow.length);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const summaryText = `🎉 UTSAVOS EXECUTIVE EVENT PLAN: ${currentEvent.title}
Domain: ${currentEvent.domain.toUpperCase()} | Date: ${currentEvent.date}
Location: ${currentEvent.location} | Expected Guests: ${currentEvent.guestCount}
Readiness Score: ${readiness}%

📊 BUDGET OVERVIEW (${currentEvent.currency}):
- Total Budget: ${formatCurrency(budgetStats.total, currentEvent.currency)}
- Total Spent: ${formatCurrency(budgetStats.spent, currentEvent.currency)} (${budgetStats.percent}%)
- Remaining Balance: ${formatCurrency(budgetStats.remaining, currentEvent.currency)}
- Paid Line Items: ${budgetStats.paidItems} / ${currentEvent.budgetItems.length}

⏱️ TIMELINE & MILESTONES:
- Checkpoints: ${milestoneStats.completed} completed, ${milestoneStats.pending} pending (${milestoneStats.daysRemaining} days remaining)
${currentEvent.macroMilestones.slice(0, 4).map((m) => `  • [${m.isCompleted ? 'X' : ' '}] ${m.title} (Due: ${m.dueDate})`).join('\n')}

🤝 VENDOR PARTNERS:
- Pipeline: ${vendorStats.inquiries} Inquiries, ${vendorStats.confirmed} Confirmed, ${vendorStats.paid} Fully Paid (${vendorStats.total} total)
${currentEvent.vendors.slice(0, 5).map((v) => `  • ${v.name} (${v.category}) — ${v.status}`).join('\n')}

Generated with UtsavOS AI Celebration & Event Planner`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // safe fallback
    }
  };

  const handleDownloadCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- UTSAVOS EVENT EXPORT ---\n';
    csvContent += `Title,${currentEvent.title}\n`;
    csvContent += `Type,${currentEvent.domain}\n`;
    csvContent += `Date,${currentEvent.date}\n`;
    csvContent += `Location,${currentEvent.location}\n`;
    csvContent += `Guests,${currentEvent.guestCount}\n`;
    csvContent += `Total Budget,${currentEvent.totalBudget} ${currentEvent.currency}\n\n`;

    csvContent += '--- BUDGET ITEMS ---\n';
    csvContent += 'Category,Name,Estimated Cost,Actual Cost,Paid\n';
    currentEvent.budgetItems.forEach((b) => {
      csvContent += `"${b.category}","${b.name.replace(/"/g, '""')}",${b.estimatedCost || 0},${b.actualCost || 0},"${b.isPaid ? 'Yes' : 'No'}"\n`;
    });

    csvContent += '\n--- TIMELINE MILESTONES ---\n';
    csvContent += 'Phase,Title,Due Date,Priority,Status\n';
    currentEvent.macroMilestones.forEach((m) => {
      csvContent += `"${m.phase}","${m.title.replace(/"/g, '""')}",${m.dueDate},"${m.priority}","${m.isCompleted ? 'Completed' : 'Pending'}"\n`;
    });

    csvContent += '\n--- VENDOR CHECKLIST ---\n';
    csvContent += 'Name,Category,Service,Status,Contract Amount,Deposit Paid,Balance Due\n';
    currentEvent.vendors.forEach((v) => {
      csvContent += `"${v.name.replace(/"/g, '""')}","${v.category}","${v.service.replace(/"/g, '""')}","${v.status}",${v.contractAmount || 0},${v.depositPaid || 0},${v.balanceDue || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}_Master_Plan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Share Master Plan"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Printable & Shareable Plan Card */}
        <div
          id="printable-plan-summary"
          style={{
            padding: '1.5rem',
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            color: '#f8fafc',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', textTransform: 'uppercase' }}>
                {currentEvent.domain} Plan
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.4rem 0 0.2rem 0' }}>
                {currentEvent.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                {currentEvent.date} • {currentEvent.location} • {currentEvent.guestCount} Guests
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Readiness</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399' }}>
                {readiness}%
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', padding: '1rem 0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Budget</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {formatCurrency(budgetStats.total, currentEvent.currency)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Actual Spent</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: budgetStats.isCritical ? '#f87171' : '#38bdf8' }}>
                {formatCurrency(budgetStats.spent, currentEvent.currency)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Milestones Done</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ec4899' }}>
                {milestoneStats.completed} / {milestoneStats.total}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Vendors Engaged</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>
                {vendorStats.total} ({vendorStats.confirmed + vendorStats.paid} booked)
              </div>
            </div>
          </div>

          {/* Timeline snapshot */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', fontSize: '0.82rem' }}>
            <strong style={{ color: '#ffffff' }}>Key Timeline Checkpoints:</strong>
            <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.25rem', color: '#cbd5e1' }}>
              {currentEvent.macroMilestones.slice(0, 3).map((m) => (
                <li key={m.id}>
                  {m.title} ({m.phase}) — <span style={{ color: m.isCompleted ? '#34d399' : '#fbbf24' }}>{m.isCompleted ? 'Completed' : 'Pending'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={16} />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

