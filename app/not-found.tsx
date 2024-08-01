"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null; // or a loading indicator
}
