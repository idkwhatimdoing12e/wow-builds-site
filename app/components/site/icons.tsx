// Small inline icons for the site header and footer.

export function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" aria-hidden="true">
      <path
        fill="currentColor"
        d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14C130.99,52.84,124.56,29.11,107.7,8.07ZM42.45,65.69c-6.18,0-11.22-5.62-11.22-12.52S36.17,40.64,42.45,40.64c6.29,0,11.33,5.65,11.22,12.53C53.67,60.07,48.63,65.69,42.45,65.69Zm42.24,0c-6.18,0-11.22-5.62-11.22-12.52s5-12.53,11.22-12.53c6.29,0,11.33,5.65,11.22,12.53C95.91,60.07,91,65.69,84.69,65.69Z"
      />
    </svg>
  );
}

export function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.3 31.3 0 0 0 .5-5.8 31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"
      />
    </svg>
  );
}

export function PatreonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M0 .48v23.04h4.22V.48H0Zm15.38 0c-4.76 0-8.64 3.88-8.64 8.65 0 4.75 3.88 8.62 8.64 8.62 4.75 0 8.62-3.87 8.62-8.62C24 4.36 20.13.48 15.38.48Z" />
    </svg>
  );
}

export function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11 3h2v9.6l3.3-3.3 1.4 1.4L12 16.4l-5.7-5.7 1.4-1.4 3.3 3.3V3ZM4 18h16v2H4v-2Z" />
    </svg>
  );
}

export function ChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6l5 5 5-5" />
    </svg>
  );
}
