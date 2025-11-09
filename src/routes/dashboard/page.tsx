import { DashboardComponent } from '@/features/dashboard/dashboard.component';
import { AuthGuard } from '@/shared/ui/auth-guard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardComponent />
    </AuthGuard>
  );
}
