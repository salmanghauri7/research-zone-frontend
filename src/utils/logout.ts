export async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Redirect to login page
    window.location.href = '/auth/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect even if the API call fails
    window.location.href = '/auth/login';
  }
}
