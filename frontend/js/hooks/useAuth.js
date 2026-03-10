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

export const getUser = () => currentUser;

export const getIsAuthenticated = () => !!currentUser?.id;

export const logout = () => {
  localStorage.removeItem(localStorageKeys.user);
  localStorage.removeItem(localStorageKeys.accessToken);
  localStorage.removeItem(localStorageKeys.refreshToken);

  sessionStorage.removeItem(localStorageKeys.user);
  sessionStorage.removeItem(localStorageKeys.accessToken);

  currentUser = null;
  window.location.replace("/");
};

export const verifyAccess = () => {
  loadUser();

  const pathname = window.location.pathname;
  const isAuthenticated = getIsAuthenticated();

  const publicRoutes = [
    "/",
    "/login",
    "/recovery",
    "/reset-password",
    "/register",
    "/verify-email",
  ];

  const guestRoutes = [
    "/login",
    "/recovery",
    "/reset-password",
    "/register",
    "/verify-email",
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
