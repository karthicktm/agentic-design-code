import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard
  redirect('/dashboard');
  
  // This won't be rendered due to the redirect, but included for completeness
  return (
    <div>
      <Link href="/dashboard">Go to Dashboard</Link>
    </div>
  );
}
