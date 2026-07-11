import { type InsuranceAdvice } from '../lib/deviations';

interface InsurancePanelProps {
  advice: InsuranceAdvice | null;
  show: boolean;
}

export function InsurancePanel({ advice, show }: InsurancePanelProps) {
  if (!show || !advice) return null;

  return (
    <div className={`insurance-panel ${advice.take ? 'insurance-panel--take' : 'insurance-panel--decline'}`}>
      <div className="insurance-header">
        <span className="insurance-label">Insurance</span>
        <span className={`insurance-verdict ${advice.take ? 'take' : 'decline'}`}>
          {advice.take ? 'Take' : 'Decline'}
        </span>
      </div>
      <p className="insurance-reason">{advice.reason}</p>
    </div>
  );
}
