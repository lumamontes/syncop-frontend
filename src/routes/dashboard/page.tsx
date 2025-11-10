import { FinancialDashboard } from '@/features/dashboard/financial-dashboard.component';
import { AuthGuard } from '@/shared/ui/auth-guard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <FinancialDashboard />
    </AuthGuard>
  );
}
