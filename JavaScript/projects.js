document.addEventListener("DOMContentLoaded", function () {
  // Project filtering functionality
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      // Filter projects
      projectCards.forEach((card) => {
        if (filterValue === "all") {
          card.style.display = "block";
        } else {
          if (card.getAttribute("data-category") === filterValue) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });

  // Tab functionality for each project card
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the parent project card
      const projectContent = this.closest(".project-content");

      // Remove active class from all tab buttons in this card
      const tabsInThisCard = projectContent.querySelectorAll(".tab-btn");
      tabsInThisCard.forEach((tab) => tab.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Get the tab content id
      const tabId = this.getAttribute("data-tab");

      // Hide all tab contents in this card
      const tabContentsInThisCard =
        projectContent.querySelectorAll(".tab-content");
      tabContentsInThisCard.forEach((content) =>
        content.classList.remove("active")
      );

      // Show the selected tab content
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Dark Mode Toggle
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;

  // Check user's previous theme preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === "dark-mode";
  }

  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      localStorage.removeItem("theme");
    }
  });

  // // Smooth Scrolling
  // const navLinks = document.querySelectorAll(".nav-link");
  // navLinks.forEach((link) => {
  //   link.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     const targetId = link.getAttribute("href");
  //     const targetSection = document.querySelector(targetId);

  //     targetSection.scrollIntoView({
  //       behavior: "smooth",
  //     });
  //   });
  // });

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll(
    ".hero-section, .about-section, .project-highlights"
  );

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const windowHeight = window.innerHeight;
      const revealTop = element.getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check
});
