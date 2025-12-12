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
