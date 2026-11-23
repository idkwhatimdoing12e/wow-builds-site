import type { Metadata } from "next";
import { TierSetsBody, tierSetsMetadata } from "@/app/components/pages/pages";

export const metadata: Metadata = tierSetsMetadata("en");

export default function Page() {
  return <TierSetsBody lang="en" />;
}
