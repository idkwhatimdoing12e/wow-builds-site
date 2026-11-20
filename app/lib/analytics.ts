// Anonymous usage counts for Google Analytics (GA4, loaded in app/layout.tsx):
// how many players bring their character to the site, and how many share it.
// Only coarse values go with an event (where a character came from, its class,
// faction and level); never a name, a realm or the character code.

type Gtag = (command: "event", name: string, params?: Record<string, string | number>) => void;

export function track(name: string, params?: Record<string, string | number>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return; // blocked or not loaded yet: nothing is counted
  try {
    gtag("event", name, params);
  } catch {
    // analytics must never break the page
  }
}
