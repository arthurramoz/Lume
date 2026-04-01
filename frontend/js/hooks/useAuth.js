export const localStorageKeys = {
  user: "@lume:user",
  accessToken: "@lume:accessToken",
  refreshToken: "@lume:refreshToken",
};

let currentUser = null;

const loadUser = () => {
  const dataUser =
    sessionStorage.getItem(localStorageKeys.user) ||
    localStorage.getItem(localStorageKeys.user);

  if (dataUser) {
    currentUser = JSON.parse(dataUser);
  }
};

export const getUser = () => {
  loadUser();
  return currentUser;
};

export const getIsAuthenticated = () => {
  loadUser();
  return !!currentUser?.id;
};

export const logout = () => {
  localStorage.removeItem(localStorageKeys.user);
  localStorage.removeItem(localStorageKeys.accessToken);
  localStorage.removeItem(localStorageKeys.refreshToken);

  sessionStorage.removeItem(localStorageKeys.user);
  sessionStorage.removeItem(localStorageKeys.accessToken);

  currentUser = null;
  window.location.replace("/pages/login.html");
};

export const verifyAccess = () => {
  loadUser();

  const pathname = window.location.pathname;
  const isAuthenticated = getIsAuthenticated();

  const publicRoutes = [
    "/",
    "/index.html",
    "/pages/login.html",
    "/pages/recovery.html",
    "/pages/reset-password.html",
    "/pages/register.html",
    "/pages/verify-email.html",
  ];

  const guestRoutes = [
    "/pages/login.html",
    "/pages/recovery.html",
    "/pages/reset-password.html",
    "/pages/register.html",
    "/pages/verify-email.html",
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/category");

  if (!isAuthenticated && !isPublicRoute) {
    window.location.replace("/");
    return;
  }

  if (isAuthenticated && guestRoutes.includes(pathname)) {
    window.location.replace("/");
  }
};
