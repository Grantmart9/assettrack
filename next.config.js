/**
 * Next.js configuration file for the AssetTrack application.
 * This file configures the Next.js build system, including any custom webpack settings,
 * environment variables, and other build-time configurations.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /**
     * Experimental features configuration.
     * Currently empty, but can be used to enable Next.js experimental features
     * such as app directory, concurrent features, etc.
     */
    experimental: {
        // Add experimental features here when needed
    },

    /**
     * Webpack configuration.
     * Custom webpack settings can be added here for specific build requirements.
     * Currently empty, but commonly used for:
     * - Adding custom loaders
     * - Configuring aliases
     * - Adding plugins
     */
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Custom webpack configuration can be added here
        return config;
    },

    /**
     * Environment variables.
     * Environment variables that should be available at build time.
     * These are typically used for feature flags or build-specific configurations.
     */
    env: {
        // Add build-time environment variables here
    },

    /**
     * Image configuration.
     * Configure Next.js Image component behavior, including:
     * - Allowed domains for external images
     * - Image optimization settings
     * - Loader configurations
     */
    images: {
        domains: [],
        // Add allowed image domains here
    },

    /**
     * TypeScript configuration.
     * Configure TypeScript compilation settings.
     */
    typescript: {
        // Configure TypeScript options here
    },

    /**
     * ESLint configuration.
     * Configure ESLint behavior during builds.
     */
    eslint: {
        // Configure ESLint options here
    },
};

module.exports = nextConfig;