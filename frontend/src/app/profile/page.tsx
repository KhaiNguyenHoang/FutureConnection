"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Loading from "@/components/common/Loading";

export default function ProfileRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      router.replace(`/user/${user.id}`);
    } else {
      // If not logged in, take them home or show login
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex bg-zinc-50 min-h-screen items-center justify-center">
      <Loading />
    </div>
  );
}
