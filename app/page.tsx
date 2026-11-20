import type { Metadata } from "next";
import { HomeBody, homeMetadata } from "@/app/components/pages/pages";

export const metadata: Metadata = homeMetadata("en");

export default function HomePage() {
  return <HomeBody lang="en" />;
}
