/**
 * ============================================================
 * Inventario PME
 * Sidebar Controller
 * ============================================================
 */

const SidebarController = (() => {
  /**
   * Sidebar Active State Manager (3 niveles)
   */
  function initActiveState() {
    const basePath = "/frontend-inventario-pme";
    const currentPath =
      window.location.pathname.replace(basePath, "").replace(/\/+$/, "") ||
      "/dashboard";

    const allLinks = document.querySelectorAll(
      ".nav-sidebar a[data-sidebar-path]",
    );
    let matchedLink = null;

    allLinks.forEach((link) => {
      const linkPath = link
        .getAttribute("data-sidebar-path")
        .replace(/\/+$/, "");
      if (currentPath === linkPath) {
        matchedLink = link;
      }
    });

    if (!matchedLink) {
      allLinks.forEach((link) => {
        const linkPath = link
          .getAttribute("data-sidebar-path")
          .replace(/\/+$/, "");
        if (linkPath !== "/dashboard" && currentPath.startsWith(linkPath)) {
          matchedLink = link;
        }
      });
    }

    if (!matchedLink) return;

    matchedLink.classList.add("active");

    let parentItem = matchedLink.closest("li.nav-item");
    while (parentItem) {
      const parentUl = parentItem.parentElement;
      if (!parentUl || !parentUl.classList.contains("nav-treeview")) break;

      const grandParentItem = parentUl.closest("li.nav-item");
      if (!grandParentItem) break;

      grandParentItem.classList.add("menu-open");
      parentUl.style.display = "block";
      const parentLink = grandParentItem.querySelector(":scope > a.nav-link");
      if (parentLink) {
        parentLink.classList.add("active");
      }

      parentItem = grandParentItem;
    }
  }

  function init() {
    initActiveState();
  }

  return Object.freeze({
    init,
  });
})();

export default SidebarController;
