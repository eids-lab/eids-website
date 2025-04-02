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

// First, let's add the necessary CSS
const style = document.createElement("style");
style.textContent = `
  .project-slider {
    position: relative;
  }
  
  .project-card {
    position: relative;
    z-index: 1;
  }
  
  .project-card.expanded {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1000px;
    height: 80vh;
    max-height: 800px;
    z-index: 1000;
    overflow-y: auto;
    background-color: var(--bg-secondary);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  
  .dark-mode .project-card.expanded {
    background-color: var(--dark-bg-secondary);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: none;
  }
  
  .project-card.expanded img {
    height: 300px;
  }
  
  .expanded-content {
    display: none;
    padding: 0 2rem 2rem;
  }
  
  .project-card.expanded .expanded-content {
    display: block;
  }
  
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: var(--accent-color);
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1001;
  }
  
  .dark-mode .close-btn {
    background-color: var(--dark-accent-color);
  }
  
  .close-btn:hover {
    background-color: var(--accent-hover);
  }
  
  .dark-mode .close-btn:hover {
    background-color: var(--dark-accent-hover);
  }
  
  .expand-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .detail-section {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 1.5rem;
  }
  
  .dark-mode .detail-section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .detail-section:last-child {
    border-bottom: none;
  }
  
  .detail-section h5 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--accent-color);
  }
  
  .dark-mode .detail-section h5 {
    color: var(--dark-accent-color);
  }
  
  .requirement-list {
    list-style: none;
    padding-left: 0;
  }
  
  .requirement-list li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .requirement-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--accent-color);
  }
  
  .dark-mode .requirement-list li::before {
    color: var(--dark-accent-color);
  }
  
  .apply-btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background-color: var(--accent-color);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 600;
    margin-top: 1rem;
  }
  
  .dark-mode .apply-btn {
    background-color: var(--dark-accent-color);
  }
  
  .apply-btn:hover {
    background-color: var(--accent-hover);
  }
  
  .dark-mode .apply-btn:hover {
    background-color: var(--dark-accent-hover);
  }
`;
document.head.appendChild(style);

// Create overlay
const overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

// Add expanded content to each card
document.querySelectorAll(".project-card").forEach((card, index) => {
  const cardTitle = card.querySelector("h4").textContent;
  const cardDesc = card.querySelector("p").textContent;
  const learnMoreLink = card.querySelector(".opp-link");

  // Create close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.textContent = "×";
  closeBtn.style.display = "none";
  card.appendChild(closeBtn);

  // Create expanded content div
  const expandedContent = document.createElement("div");
  expandedContent.className = "expanded-content";

  // Content based on card type
  let detailHTML = "";

  if (cardTitle.includes("PhD")) {
    detailHTML = `
      <div class="expand-details">
        <div class="detail-section">
          <h5>Position Overview</h5>
          <p>We are seeking exceptional PhD candidates to join our research team working on cutting-edge IoT and edge computing technologies. As a PhD researcher in our lab, you will have the opportunity to define and lead innovative research projects with real-world impact.</p>
        </div>
        
        <div class="detail-section">
          <h5>Research Areas</h5>
          <p>Our current PhD openings focus on the following areas:</p>
          <ul class="requirement-list">
            <li>Edge AI and Machine Learning for IoT applications</li>
            <li>Energy-efficient protocols for IoT networks</li>
            <li>Secure and privacy-preserving edge computing</li>
            <li>Distributed sensing and actuation systems</li>
            <li>Human-centered IoT system design</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Requirements</h5>
          <ul class="requirement-list">
            <li>Master's degree in Computer Science, Electrical Engineering, or related field</li>
            <li>Strong programming skills and system development experience</li>
            <li>Background in at least one of our research areas</li>
            <li>Excellent communication skills and ability to work in a team</li>
            <li>Passion for pushing the boundaries of technology</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Benefits</h5>
          <ul class="requirement-list">
            <li>Competitive stipend and benefits package</li>
            <li>Travel support for conferences</li>
            <li>Access to state-of-the-art research equipment and facilities</li>
            <li>Collaboration opportunities with industry partners</li>
            <li>Mentorship from leading researchers in the field</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>How to Apply</h5>
          <p>Applications are accepted on a rolling basis. Please submit your CV, research statement, and academic transcripts through our online application system.</p>
          <a href="#" class="apply-btn">Apply Now</a>
        </div>
      </div>
    `;
  } else if (cardTitle.includes("Industry")) {
    detailHTML = `
      <div class="expand-details">
        <div class="detail-section">
          <h5>Partnership Overview</h5>
          <p>Our lab offers multiple avenues for industry collaboration, from sponsored research projects to technology licensing. We work closely with partners to identify challenges where our expertise can drive innovation and create value.</p>
        </div>
        
        <div class="detail-section">
          <h5>Partnership Models</h5>
          <ul class="requirement-list">
            <li><strong>Sponsored Research:</strong> Fund specific research aligned with your company's goals</li>
            <li><strong>Joint Development:</strong> Collaborate on co-developed technologies and IP</li>
            <li><strong>Technology Licensing:</strong> License our lab's innovations for commercial use</li>
            <li><strong>Consulting Services:</strong> Engage our researchers to solve specific challenges</li>
            <li><strong>Student Recruitment:</strong> Connect with top talent trained in cutting-edge methods</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Industry Focus Areas</h5>
          <ul class="requirement-list">
            <li>Smart manufacturing and Industry 4.0</li>
            <li>Smart buildings and energy management</li>
            <li>Healthcare IoT and remote monitoring</li>
            <li>Agricultural technology and precision farming</li>
            <li>Smart cities and urban infrastructure</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Benefits of Partnership</h5>
          <ul class="requirement-list">
            <li>Access to specialized expertise and research infrastructure</li>
            <li>Early insights into emerging technologies</li>
            <li>Custom solutions for industry-specific challenges</li>
            <li>Opportunities to influence research directions</li>
            <li>Enhanced R&D capabilities without building internal teams</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Contact Us</h5>
          <p>To explore partnership opportunities, please reach out to our Industry Relations office. We'll arrange an initial consultation to discuss your needs and potential collaboration models.</p>
          <a href="#" class="apply-btn">Request Information</a>
        </div>
      </div>
    `;
  } else if (cardTitle.includes("Internships")) {
    detailHTML = `
      <div class="expand-details">
        <div class="detail-section">
          <h5>Internship Program</h5>
          <p>Our research internship program offers undergraduate and graduate students hands-on experience working alongside experienced researchers on meaningful projects. Internships typically run for 3-6 months, with both summer and semester options available.</p>
        </div>
        
        <div class="detail-section">
          <h5>Available Projects</h5>
          <ul class="requirement-list">
            <li>Developing edge AI applications for environmental monitoring</li>
            <li>Implementing secure communication protocols for IoT devices</li>
            <li>Building data visualization tools for complex sensor networks</li>
            <li>Testing energy harvesting technologies for perpetual IoT operations</li>
            <li>Designing user interfaces for IoT management systems</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Eligibility</h5>
          <ul class="requirement-list">
            <li>Currently enrolled in an undergraduate or graduate program</li>
            <li>Background in computer science, electrical engineering, or related fields</li>
            <li>Coursework or experience in programming, networks, or embedded systems</li>
            <li>Strong problem-solving skills and attention to detail</li>
            <li>Ability to work in a collaborative research environment</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>What You'll Gain</h5>
          <ul class="requirement-list">
            <li>Practical research experience in a cutting-edge field</li>
            <li>Mentorship from faculty and senior researchers</li>
            <li>Exposure to academic and industry collaboration</li>
            <li>Opportunity to contribute to publications</li>
            <li>Stipend support for qualifying positions</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h5>Apply Now</h5>
          <p>Applications for summer internships open in January each year. For semester internships, please apply at least 3 months before your desired start date.</p>
          <a href="#" class="apply-btn">Submit Application</a>
        </div>
      </div>
    `;
  }

  expandedContent.innerHTML = detailHTML;
  card.appendChild(expandedContent);

  // Add click event to Learn More link
  learnMoreLink.addEventListener("click", function (e) {
    e.preventDefault();
    card.classList.add("expanded");
    overlay.style.display = "block";
    closeBtn.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });

  // Add click event to close button
  closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    card.classList.remove("expanded");
    overlay.style.display = "none";
    closeBtn.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
  });

  // Close expanded card when clicking on overlay
  overlay.addEventListener("click", function () {
    const expandedCard = document.querySelector(".project-card.expanded");
    if (expandedCard) {
      expandedCard.classList.remove("expanded");
      expandedCard.querySelector(".close-btn").style.display = "none";
      overlay.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});
