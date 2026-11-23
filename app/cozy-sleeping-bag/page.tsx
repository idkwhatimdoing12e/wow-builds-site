import type { Metadata } from "next";
import { ChainPageBody, chainPageMetadata } from "@/app/components/pages/pages";

export const metadata: Metadata = chainPageMetadata("cozy-sleeping-bag", "en");

export default function Page() {
  return <ChainPageBody slug="cozy-sleeping-bag" lang="en" />;
}
