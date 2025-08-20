
import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'PassKey Pro Extension',
};

export default function PopupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The parent popup.html sets the size, but we enforce it here for consistency during development.
    <div className="bg-background text-foreground w-[380px] h-[600px] flex flex-col">
      {children}
      <Toaster />
    </div>
  );
}
