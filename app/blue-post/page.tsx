import type { Metadata } from "next";
import { BluePostBody, bluePostMetadata } from "@/app/components/blue/BluePostPage";

export const metadata: Metadata = bluePostMetadata("en");

export default function Page() {
  return <BluePostBody lang="en" />;
}
