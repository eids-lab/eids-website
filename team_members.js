document.addEventListener("DOMContentLoaded", function () {
  // Team member image placeholder generation
  const memberImgs = document.querySelectorAll(".member-img");
  const colors = ["#3498db", "#2980b9", "#1abc9c", "#16a085", "#9b59b6"];
  const icons = ["👨‍💼", "👩‍💼", "👨‍💻", "👩‍💻", "👨‍🏫"];

  memberImgs.forEach((img, index) => {
    // Create gradient background with team colors
    img.style.background = `linear-gradient(135deg, ${
      colors[index % colors.length]
    }, #ecf0f1)`;

    // Add emoji as placeholder (until real images are added)
    const icon = document.createElement("span");
    icon.textContent = icons[index % icons.length];
    icon.style.fontSize = "3.5rem";
    img.appendChild(icon);

    // Add hover effect
    img.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.08) rotate(5deg)";
    });

    img.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });

  // Add expanding effect to team member cards on click
  const teamMembers = document.querySelectorAll(".team-member");

  teamMembers.forEach((member) => {
    member.addEventListener("click", function () {
      // Toggle expanded class
      this.classList.toggle("expanded");

      // Reset any other expanded cards
      teamMembers.forEach((otherMember) => {
        if (otherMember !== this) {
          otherMember.classList.remove("expanded");
        }
      });
    });
  });

  // Scroll reveal for team sections
  const revealOnScroll = () => {
    const sections = document.querySelectorAll(
      ".section-subtitle, .team-container"
    );

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.8) {
        section.classList.add("reveal");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check
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
