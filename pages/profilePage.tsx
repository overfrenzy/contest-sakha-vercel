import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default function MainPage() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState<{ email: string; permissions: string } | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const url = 'https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u'; // auth function
      const response = await fetch(url);
      const data = await response.json();

      // Find the specific user based on email
      const user = data.users.find((u) => u.email === sessionData?.user?.email);

      setUserData(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [sessionData?.user?.email]);

  useEffect(() => {
    if (sessionData?.user?.email) {
      fetchUserData();
    }
  }, [sessionData?.user?.email, fetchUserData]);

  if (sessionStatus === 'loading') return <h1>Loading... Please wait.</h1>;
  if (sessionStatus === 'authenticated') {
    const user = sessionData?.user;

    return (
      <div>
        <h1>Hi, {user?.name}</h1>
        {user?.image && (
          <Image
            src={user.image}
            alt={user?.name + ' photo'}
            width={300}
            height={300}
          />
        )}
        {userData && (
          <div>
            <h2>User Data:</h2>
            <p>Email: {userData.email}</p>
            <p>Permissions: {userData.permissions}</p>
          </div>
        )}
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  );
}
