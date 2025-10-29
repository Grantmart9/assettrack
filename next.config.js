/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['images.unsplash.com', 'via.placeholder.com'],
        unoptimized: true,  // Add this for static export
    },
    output: 'export',  // Add this line for static export
}

module.exports = nextConfig
