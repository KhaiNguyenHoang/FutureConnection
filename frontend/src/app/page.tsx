"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";

export default function Home() {
  const router = useRouter();

  const handleFinished = () => {
    router.push("/intro");
  };

  return <Loading onFinished={handleFinished} />;
}
