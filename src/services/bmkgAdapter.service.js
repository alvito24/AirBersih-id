async function getWeatherContext() {
  return {
    source: 'BMKG_PLACEHOLDER',
    status: 'PENDING',
    note: 'BMKG production integration is not configured for MVP fallback mode.',
  };
}

module.exports = {
  getWeatherContext,
};
