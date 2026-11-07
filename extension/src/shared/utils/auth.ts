
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from './chrome-storage';

const AUTH_TOKEN_KEY = 'edupilot_auth_token';
const AUTH_USER_KEY = 'edupilot_auth_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: AuthUser;
}

const API_BASE_URL = 'https://edupilot-ai-backend-zrka.onrender.com/api/auth';

/**
 * Register a new student account.
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return handleAuthResponse(response);
}

/**
 * Log in an existing student.
 */
export async function login(
  email: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleAuthResponse(response);
}

/**
 * Validate and save the authentication response.
 */
async function handleAuthResponse(
  response: Response
): Promise<AuthSession> {
  const data = (await response.json()) as AuthResponse;

  if (
    !response.ok ||
    !data.success ||
    !data.token ||
    !data.user
  ) {
    throw new Error(data.error || 'Authentication failed.');
  }

  const session: AuthSession = {
    token: data.token,
    user: data.user,
  };

  await setLocalStorage(AUTH_TOKEN_KEY, session.token);
  await setLocalStorage(AUTH_USER_KEY, session.user);

  return session;
}

/**
 * Retrieve the saved authentication session.
 */
export async function getSession(): Promise<AuthSession | null> {
  const token = await getLocalStorage<string>(AUTH_TOKEN_KEY);
  const user = await getLocalStorage<AuthUser>(AUTH_USER_KEY);

  if (!token || !user) {
    return null;
  }

  return { token, user };
}

/**
 * Retrieve the JWT for authenticated API requests.
 */
export async function getAuthToken(): Promise<string | null> {
  const token = await getLocalStorage<string>(AUTH_TOKEN_KEY);
  return token ?? null;
}

/**
 * Log out without deleting notes or other local student data.
 */
export async function logout(): Promise<void> {
  await Promise.all([
    removeLocalStorage(AUTH_TOKEN_KEY),
    removeLocalStorage(AUTH_USER_KEY),
  ]);
}

/**
 * Check whether a session exists locally.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}


/**
 * Send an authenticated request to the backend.
 * Automatically attaches the student's JWT.
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await logout();
    throw new Error('Your session has expired. Please log in again.');
  }

  return response;
}
