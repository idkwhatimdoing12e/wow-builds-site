import type { Metadata } from "next";
import { PvpBody, pvpMetadata } from "@/app/components/pages/pages";

export const metadata: Metadata = pvpMetadata("en");

export default function Page() {
  return <PvpBody lang="en" />;
}
