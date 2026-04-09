/**
 * httpClient.ts
 * 
 * HTTP wrapper centralizado para todas las llamadas a API.
 * Maneja:
 * - Agregar token JWT en Authorization header
 * - Interceptar 401 (token expirado/inválido) → logout automático
 * - Logging de errores
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const httpClient = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { skipAuth = false, ...fetchOptions } = options;

  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    localStorage.removeItem('token');
    window.location.href = '/login?session=expired';
    throw new Error('Token expirado. Redirigiendo a login...');
  }

  return response;
};