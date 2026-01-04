/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// Check if deploying to Vercel (Vercel sets VERCEL=1)
const isVercel = process.env.VERCEL === '1';
// Check if deploying to GitHub Pages (GitHub Actions sets GITHUB_ACTIONS=true)
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Only use basePath for GitHub Pages, never for Vercel
  // Vercel deploys to root domain, so basePath breaks CSS and asset paths
  basePath: (isProd && isGitHubPages && !isVercel) ? "/EfiePlans" : "",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
