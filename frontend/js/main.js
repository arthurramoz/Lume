import { verifyAccess } from "./hooks/useAuth.js";
import { initBookList } from "./modules/bookList.js";
import { initTopbar } from "./modules/topbar.js";

// verifyAccess();

document.addEventListener("DOMContentLoaded", () => {
    initTopbar();
    initBookList();
});
