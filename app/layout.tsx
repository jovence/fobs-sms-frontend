// Root layout is a pass-through: <html>/<body> live in app/[locale]/layout.tsx
// so the document language can be set per locale (next-intl App Router pattern).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
