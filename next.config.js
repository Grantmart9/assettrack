// Remove experimental.appDir if present, as appDir is stable in Next.js 14+
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'via.placeholder.com'],
        unoptimized: true,  // Add this for static export
    },
    output: 'export',  // Add this line for static export
    trailingSlash: true,  // Generate /page/index.html instead of /page.html for nginx
}

module.exports = nextConfig
