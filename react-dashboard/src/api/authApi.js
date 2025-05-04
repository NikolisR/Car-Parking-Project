// src/api/authApi.js
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook to call protected Auth0-backed API endpoints.
 * Assumes VITE_AUTH0_AUDIENCE env var matches your Auth0 API Identifier.
 */
export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const callProtected = async (path, options = {}) => {
    // 1. Retrieve a valid access token
    const token = await getAccessTokenSilently();

    // 2. Perform fetch with Authorization header
    const response = await fetch(`${import.meta.env.VITE_AUTH0_AUDIENCE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // 3. Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    // 4. Return parsed JSON
    return response.json();
  };

  return { callProtected };
}
