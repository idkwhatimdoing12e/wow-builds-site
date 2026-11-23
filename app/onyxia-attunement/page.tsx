import type { Metadata } from "next";
import { ChainPageBody, chainPageMetadata } from "@/app/components/pages/pages";

export const metadata: Metadata = chainPageMetadata("onyxia-attunement", "en");

export default function Page() {
  return <ChainPageBody slug="onyxia-attunement" lang="en" />;
}
