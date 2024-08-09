"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return null;
  }

  return (
    status === 'authenticated' && session.user && (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
          {/* Check if session.user.image exists before rendering the Image component */}
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profile picture"
              width={100}
              height={100}
              className="rounded-full"
            />
          )}
          <h1 className="mt-4 text-2xl font-bold">
            Welcome, <span className="text-blue-600">{session.user.name}!</span>
          </h1>
          <p className="mt-2">Email: {session.user.email}</p>
          <p className="mt-2">Role: {session.user.role}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
}