import { verifyAccess } from "./hooks/useAuth.js";
import { initBookList } from "./modules/bookList.js";
import { initTopbar } from "./modules/topbar.js";
import { initAdminNavbar } from "./modules/navbar.js";
import { initUserList } from "./modules/userList.js";
import { initDashboard } from "./modules/dashboard.js";

// verifyAccess();

document.addEventListener("DOMContentLoaded", () => {
  initTopbar();
  initUserList();
  initBookList();
  initAdminNavbar();
  initDashboard();
});
