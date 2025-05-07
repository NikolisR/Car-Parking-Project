import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook to call protected Auth0-backed API endpoints.
 * Assumes VITE_AUTH0_AUDIENCE env var matches your Auth0 API Identifier.
 */
export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const callProtected = async (path, options = {}) => {
    const token = await getAccessTokenSilently();

    const response = await fetch(`${import.meta.env.VITE_AUTH0_AUDIENCE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json();
  };

  return { callProtected };
}
