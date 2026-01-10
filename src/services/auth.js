export const signup = async ({ email, password }) => {
  const response = await fetch("/api/auth/signup", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.err || 'Signup failed');
  }
  return data;
};



export const login = async ({ email, password }) => {
  const response = await fetch("/api/auth/login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.err || data.message || 'Login failed');
  }
  return data;
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
