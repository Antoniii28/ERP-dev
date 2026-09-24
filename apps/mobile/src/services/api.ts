export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const getHealthStatus = async () => {
  const response = await fetch(`${apiBaseUrl}/health`);
  return response.json();
};
