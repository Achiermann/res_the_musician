// next.config.js  (delete any next.config.mjs)
 /** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,  // <- force root to this project folder
  },
};
module.exports = nextConfig;
