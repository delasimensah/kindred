/**
 * Asset Management for Web App
 *
 * All images and icons are defined here.
 * Assets are stored in public/ directory and referenced with absolute paths.
 *
 * Usage with next/image:
 * import Image from "next/image";
 * import { ASSETS } from "@/constants";
 *
 * <Image
 *   src={ASSETS.icons.appIcon}
 *   alt="App Icon"
 *   width={100}
 *   height={100}
 *   priority // Optional: for above-the-fold images
 * />
 *
 * NOTES:
 * - All paths are relative to the public/ directory
 * - Next.js automatically optimizes images with next/image
 * - Use priority prop for critical images (LCP)
 * - Provide width/height for better performance
 */

export const ASSETS = {
  // Icons (stored in public/icons/)
  icons: {
    /** Shipped Kindred mark (gold on charcoal). Same art as the mobile app icon. */
    logo: "/icons/logo.png",
    appIcon: "/icons/app-icon.png",
  },
  // Images (stored in public/images/)
  images: {
    // Add your image assets here
    // background: "/images/background.png",
    // hero: "/images/hero.jpg",
  },
} as const;
