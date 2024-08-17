import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertCreatedAt(createdAt: number) {

  // Convert to milliseconds
  const date = new Date(createdAt);

  // Format date to DD/MM/YY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(date.getFullYear()).slice(-2);

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

export function constructMetadata({
  title = "Mock Builder | Generate realistic mock JSON data using AI-powered prompts in seconds.",
  description = "Generate realistic mock JSON data using AI-powered prompts in seconds.",
  image = "/favicon.ico",
  icons = "/file-json.svg",
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@zaidbhati"
    },
    icons,
    metadataBase: new URL('https://mock-builder.vercel.app/'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}


