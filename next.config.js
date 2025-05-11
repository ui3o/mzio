// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    assetPrefix: isProd ? '/mzio/' : '',
    basePath: isProd ? '/mzio' : '',
    output: 'export',
    trailingSlash: true,

};

module.exports = nextConfig;
