import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import withAdminAuth from '../components/withAdminAuth';

function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === 'loading') {
    return <h1>Loading... Please wait.</h1>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name}</h1>
      <p>This page is accessible only to users with admin permissions.</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}

export default withAdminAuth(AdminPage);
