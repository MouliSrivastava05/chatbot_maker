export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token");
  }
  return null;
};

export const destroyToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
  }
};

export const isUserLoggedIn = () => {
  if (typeof window !== 'undefined') {
    const tokenExistsLocally = !!getToken();
    return tokenExistsLocally;
  }
  return false;
};

export const getEmailFromToken = () => {
  const token = getToken();
  if (!token) return null;

  // Backward compatibility with legacy concatenated format
  if (token.includes('#@#')) {
    return token.split('#@#')[1];
  }

  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.email || null;
    }
  } catch (error) {
    console.error('Failed to decode token:', error);
  }
  return null;
};

