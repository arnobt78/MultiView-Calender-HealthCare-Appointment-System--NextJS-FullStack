// Root Layout Component - This is the main layout wrapper for the entire Next.js application
// It sets up global styles, metadata for SEO, and wraps all pages with authentication and context providers

import "../styles/globals.css";
import { DateProvider } from "@/context/DateContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

// Load Inter font from Google Fonts - this optimizes font loading and improves performance
// The font is applied globally to ensure consistent typography across the app
const inter = Inter({ subsets: ["latin"] });

// SEO Metadata Configuration
// This metadata object is used by Next.js to generate proper HTML meta tags for search engines
// It includes OpenGraph tags for social media sharing, Twitter cards, and structured data
export const metadata: Metadata = {
  // Base URL for all relative URLs in metadata - ensures absolute URLs for SEO
  metadataBase: new URL("https://doctor-patient-calendar-appointment.vercel.app"),
  // Canonical URL helps prevent duplicate content issues in SEO
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Doctor Patient Calendar Appointment Management System | MultiView Calendar",
    template: "%s | Doctor Patient Calendar",
  },
  description:
    "Modern, full-featured calendar and appointment management web application built with Next.js, React, and PostgreSQL. Perfect for healthcare, clinics, and organizations needing robust scheduling, filtering, and client management with multiple calendar views (List, Week, Month), instant search, advanced filtering, and a clean, responsive UI.",
  keywords: [
    "calendar",
    "appointment management",
    "doctor patient calendar",
    "healthcare scheduling",
    "appointment booking",
    "multi-view calendar",
    "month view calendar",
    "week view calendar",
    "list view calendar",
    "patient management",
    "clinic management",
    "healthcare app",
    "medical scheduling",
    "appointment system",
    "Next.js",
    "React",
    "PostgreSQL",
    "Vercel Blob",
    "Tailwind CSS",
    "shadcn/ui",
    "Radix UI",
    "TypeScript",
    "fullstack",
    "CRUD",
    "responsive design",
    "filtering",
    "search",
    "modern UI",
    "Vercel",
    "invitation system",
    "permission management",
    "RESTful API",
    "OpenAPI",
    "accessibility",
    "Arnob Mahmud",
  ],
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://www.arnobmahmud.com/",
    },
  ],
  creator: "Arnob Mahmud",
  publisher: "Arnob Mahmud",
  applicationName: "Doctor Patient Calendar",
  referrer: "origin-when-cross-origin",
  // OpenGraph metadata - Used by Facebook, LinkedIn, and other social platforms when sharing links
  // These tags control how the link preview appears when shared on social media
  openGraph: {
    title: "Doctor Patient Calendar Appointment Management System | MultiView Calendar",
    description:
      "Modern, full-featured calendar and appointment management web application. Perfect for healthcare, clinics, and organizations needing robust scheduling, filtering, and client management with multiple calendar views, instant search, and advanced filtering.",
    url: "https://doctor-patient-calendar-appointment.vercel.app/",
    siteName: "Doctor Patient Calendar",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 64,
        height: 64,
        alt: "Doctor Patient Calendar Icon",
      },
    ],
  },
  // Twitter Card metadata - Controls how links appear when shared on Twitter/X
  // summary_large_image shows a large preview image with the link
  twitter: {
    card: "summary_large_image",
    title: "Doctor Patient Calendar Appointment Management System",
    description:
      "Modern calendar and appointment management for healthcare, clinics, and organizations. Multiple views, instant search, and advanced filtering.",
    creator: "@arnobmahmud",
    images: ["/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "Healthcare Technology",
  classification: "Healthcare, Calendar, Appointment Management",
};

import AuthShell from "./AuthShell";

/**
 * RootLayout Component
 * 
 * This is the root layout component that wraps all pages in the Next.js App Router.
 * It provides:
 * - Global HTML structure (<html>, <head>, <body>)
 * - SEO meta tags in the <head>
 * - Authentication and context providers via AuthShell
 * 
 * @param children - All page components are passed as children and rendered here
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * style={{ backgroundColor }} is inlined in the SSR HTML so the browser
     * paints the dark canvas on the very first frame — before any CSS file
     * is parsed.  This eliminates the gray/white flash that was visible
     * between Chrome starting to render and the stylesheet arriving.
     */
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      style={{ backgroundColor: "#0f172a" }}
    >
      <head>
        <link rel="canonical" href="https://doctor-patient-calendar-appointment.vercel.app" />
        <meta name="url" content="https://doctor-patient-calendar-appointment.vercel.app" />
        <meta name="identifier-URL" content="https://doctor-patient-calendar-appointment.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Match the app's dark background so the browser chrome / tab strip is consistent */}
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body suppressHydrationWarning>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
