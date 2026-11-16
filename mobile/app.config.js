// Extends app.json. EXPO_BASE_URL is set by the GitHub Pages workflow so the
// web build is served from a sub-path (e.g. /Rapid-Mechanic/app).
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}) },
})
