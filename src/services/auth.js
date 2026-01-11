export const signup = async ({ email, password }) => {
  try {
    const response = await fetch("/api/auth/signup", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      method: "POST",
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response from server. Please try again.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || data.err || 'Signup failed');
    }
    return data;
  } catch (error) {
    // Re-throw with a more user-friendly message if it's a network error
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};



export const login = async ({ email, password }) => {
  try {
    const response = await fetch("/api/auth/login", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      method: "POST",
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response from server. Please try again.');
    }
    
    if (!response.ok) {
      throw new Error(data.err || data.message || 'Login failed');
    }
    return data;
  } catch (error) {
    // Re-throw with a more user-friendly message if it's a network error
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

export const socialLogin = async ({ email }) => {
  const response = await fetch("/api/auth/social-login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.err || data.message || 'Social login failed');
  }
  return data;
};
