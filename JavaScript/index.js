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

  // Smooth Scrolling
  // const navLinks = document.querySelectorAll('.nav-link');
  // navLinks.forEach(link => {
  //     link.addEventListener('click', (e) => {
  //         e.preventDefault();
  //         const targetId = link.getAttribute('href');
  //         const targetSection = document.querySelector(targetId);

  //         targetSection.scrollIntoView({
  //             behavior: 'smooth'
  //         });
  //     });
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

/* Contact Us js*/
document.addEventListener("DOMContentLoaded", function () {
  // Handle FAQ accordion functionality
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const toggleIcon = item.querySelector(".toggle-icon");

    question.addEventListener("click", () => {
      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle the clicked item
      item.classList.toggle("active");

      // Toggle the plus/minus icon
      if (toggleIcon) {
        if (toggleIcon.textContent === "+") {
          toggleIcon.textContent = "−";
        } else {
          toggleIcon.textContent = "+";
        }
      }

      // Toggle answer visibility if using separate classes
      if (answer) {
        answer.classList.toggle("active");
      }
    });
  });

  // Form validation and submission
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get form fields
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value.trim();
      const terms = document.getElementById("terms").checked;

      // Validate form
      let isValid = true;
      let errorMessage = "";

      if (name === "") {
        isValid = false;
        errorMessage += "Please enter your name.\n";
        highlightField("name");
      }

      if (email === "") {
        isValid = false;
        errorMessage += "Please enter your email address.\n";
        highlightField("email");
      } else if (!isValidEmail(email)) {
        isValid = false;
        errorMessage += "Please enter a valid email address.\n";
        highlightField("email");
      }

      if (phone !== "" && !isValidPhone(phone)) {
        isValid = false;
        errorMessage += "Please enter a valid phone number.\n";
        highlightField("phone");
      }

      if (subject === "" || subject === null) {
        isValid = false;
        errorMessage += "Please select a subject.\n";
        highlightField("subject");
      }

      if (message === "") {
        isValid = false;
        errorMessage += "Please enter your message.\n";
        highlightField("message");
      }

      if (!terms) {
        isValid = false;
        errorMessage += "Please agree to the terms and privacy policy.\n";
        highlightField("terms");
      }

      // If validation passes, submit the form
      if (isValid) {
        // Show loading state
        const submitBtn = contactForm.querySelector(".submit-btn");
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        // Prepare form data for server submission
        const formData = {
          name: name,
          email: email,
          phone: phone,
          subject: subject,
          message: message,
          submission_date: new Date().toISOString(),
        };

        fetch("/api/save-contact-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            // Check for server errors (status code 500)
            if (response.status === 500) {
              throw new Error(
                "Server error: The database might be unavailable"
              );
            }
            // Check for other non-OK responses
            if (!response.ok) {
              throw new Error("Request failed with status: " + response.status);
            }
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              showSuccessMessage();
              contactForm.reset();
            } else {
              submitBtn.textContent = originalBtnText;
              submitBtn.disabled = false;
              alert(
                "Error: " + (data.message || "Failed to save your message.")
              );
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;

            // Display a more specific error message
            let errorMessage = "An error occurred while sending your message.";
            if (error.message.includes("database")) {
              errorMessage =
                "Database connection error. Your message could not be saved at this time.";
            } else if (error.message.includes("Server error")) {
              errorMessage = error.message;
            }

            alert(
              errorMessage +
                " Please try again later or contact support directly."
            );

            // Optionally, create a visible error message on the page
            const formContainer = document.querySelector(
              ".contact-form-container"
            );
            if (formContainer) {
              const errorElement = document.createElement("div");
              errorElement.className = "error-message";
              errorElement.textContent = errorMessage;
              errorElement.style.color = "#e74c3c";
              errorElement.style.padding = "10px";
              errorElement.style.marginBottom = "20px";
              errorElement.style.backgroundColor = "#fde2e2";
              errorElement.style.borderRadius = "4px";

              formContainer.insertBefore(errorElement, contactForm);
            }
          });
      } else {
        // Show error message
        alert("Please correct the following errors:\n\n" + errorMessage);
      }
    });
  } else {
    console.error("Contact form not found with ID 'contact-form'");
  }

  // Helper functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidPhone(phone) {
    // Basic validation for international phone numbers
    // Allows +, spaces, dashes, and parentheses
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add("error");

      field.addEventListener(
        "input",
        function () {
          field.classList.remove("error");
        },
        { once: true }
      );
    }
  }

  function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.innerHTML = `
              <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
              </div>
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon.</p>
          `;

    // Replace form with success message
    const formContainer = document.querySelector(".contact-form-container");
    if (formContainer) {
      formContainer.innerHTML = "";
      formContainer.appendChild(successMessage);

      // Scroll to success message
      successMessage.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Add CSS for form validation and success message
  const style = document.createElement("style");
  style.textContent = `
          input.error, textarea.error, select.error {
              border-color: #e74c3c !important;
              box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
          }
          
          .checkbox-container.error {
              color: #e74c3c;
          }
          
          .success-message {
              text-align: center;
              padding: 30px;
              animation: fadeIn 0.5s ease-in-out;
          }
          
          .success-icon {
              font-size: 4rem;
              color: #2ecc71;
              margin-bottom: 20px;
          }
          
          .success-message h3 {
              margin: 0 0 15px;
              color: #2c3e50;
              font-size: 1.8rem;
          }
          
          .success-message p {
              color: #7f8c8d;
              font-size: 1.1rem;
          }
          
          .faq-answer.active {
              display: block;
          }
          
          .submit-btn:disabled {
              opacity: 0.7;
              cursor: not-allowed;
          }
      `;
  document.head.appendChild(style);
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

  // Smooth Scrolling
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
