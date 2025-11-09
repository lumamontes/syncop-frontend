import { QueryProvider } from '@/app/providers';
import { Outlet } from '@modern-js/runtime/router';
import 'tailwindcss/base.css';
import 'tailwindcss/components.css';
import 'tailwindcss/utilities.css';

export default function Layout() {
  return (
    <QueryProvider>
      <div>
        <Outlet />
      </div>
    </QueryProvider>
  );
}
