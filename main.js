/* =========================================================
   U.S TRAVEL & TOURS
   MAIN JAVASCRIPT

   Main UI / Website Functions Only

   IMPORTANT:
   Form submissions are handled by their dedicated JS files:
   - application.js
   - payments.js
   - contact.js
   - auth.js
   - jobs.js

========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       01. MOBILE NAVIGATION
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", function () {

            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("active");

        });


        /* Close menu after clicking a link */

        const navLinks = navMenu.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

            });

        });

    }



    /* =====================================================
       02. STICKY HEADER
    ===================================================== */

    const header = document.querySelector("header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 40) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    window.addEventListener("scroll", updateHeader);

    updateHeader();



    /* =====================================================
       03. SMOOTH SCROLL
    ===================================================== */

    const smoothLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    smoothLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (
                !targetId ||
                targetId === "#" ||
                targetId.length < 2
            ) {
                return;
            }

            let target = null;

            try {

                target = document.querySelector(targetId);

            } catch (error) {

                return;

            }

            if (!target) return;

            event.preventDefault();

            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                headerHeight;

            window.scrollTo({

                top: targetPosition,
                behavior: "smooth"

            });

        });

    });



    /* =====================================================
       04. ACTIVE NAVIGATION LINK
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const navItems = document.querySelectorAll(
        ".nav-menu a"
    );

    navItems.forEach(function (link) {

        const linkPage = link.getAttribute("href");

        if (!linkPage) return;

        /*
           Ignore anchor links, mail links and telephone links
        */

        if (
            linkPage.startsWith("#") ||
            linkPage.startsWith("mailto:") ||
            linkPage.startsWith("tel:")
        ) {
            return;
        }

        const cleanPage =
            linkPage.split("/").pop().toLowerCase();

        if (
            (currentPage === "" &&
                cleanPage === "index.html") ||
            currentPage === cleanPage
        ) {

            link.classList.add("active");

        }

    });



    /* =====================================================
       05. SCROLL REVEAL ANIMATION
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".reveal, .destination-card, .service-card, .testimonial-card"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(

            function (entries, observerInstance) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observerInstance.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.12
            }

        );


        revealElements.forEach(function (element) {

            element.classList.add("reveal");

            observer.observe(element);

        });

    } else {

        /*
           Fallback for older browsers
        */

        revealElements.forEach(function (element) {

            element.classList.add("show");

        });

    }



    /* =====================================================
       06. DESTINATION CARD EFFECT
    ===================================================== */

    const destinationCards =
        document.querySelectorAll(
            ".destination-card"
        );

    destinationCards.forEach(function (card) {

        card.addEventListener(
            "mouseenter",
            function () {

                this.classList.add(
                    "destination-hover"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            function () {

                this.classList.remove(
                    "destination-hover"
                );

            }
        );

    });



    /* =====================================================
       07. BACK TO TOP BUTTON
    ===================================================== */

    const backToTop =
        document.querySelector(
            ".back-to-top"
        );

    if (backToTop) {

        function toggleBackToTop() {

            if (window.scrollY > 500) {

                backToTop.classList.add("show");

            } else {

                backToTop.classList.remove("show");

            }

        }


        window.addEventListener(
            "scroll",
            toggleBackToTop
        );

        toggleBackToTop();


        backToTop.addEventListener(
            "click",
            function () {

                window.scrollTo({

                    top: 0,
                    behavior: "smooth"

                });

            }
        );

    }



    /* =====================================================
       08. BUTTON CLICK EFFECT
    ===================================================== */

    const actionButtons =
        document.querySelectorAll(
            ".btn, .destination-content a"
        );

    actionButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const href =
                    this.getAttribute("href");

                /*
                   Do not apply effect to:
                   - buttons without href
                   - anchor links
                   - email
                   - phone
                */

                if (
                    !href ||
                    href.startsWith("#") ||
                    href.startsWith("mailto:") ||
                    href.startsWith("tel:")
                ) {

                    /*
                       For actual buttons, still allow
                       CSS click animation.
                    */

                    if (
                        this.tagName.toLowerCase() ===
                        "button"
                    ) {

                        this.classList.add(
                            "button-clicked"
                        );

                        setTimeout(() => {

                            this.classList.remove(
                                "button-clicked"
                            );

                        }, 500);

                    }

                    return;

                }


                this.classList.add(
                    "button-clicked"
                );


                setTimeout(() => {

                    this.classList.remove(
                        "button-clicked"
                    );

                }, 500);

            }
        );

    });



    /* =====================================================
       09. PHONE NUMBER INPUT
       
       Only cleans phone fields.
       Does NOT handle form submission.
    ===================================================== */

    const phoneInputs =
        document.querySelectorAll(
            'input[type="tel"]'
        );

    phoneInputs.forEach(function (input) {

        input.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9+\-\s()]/g,
                        ""
                    );

            }
        );

    });



    /* =====================================================
       10. PASSWORD SHOW / HIDE
    ===================================================== */

    const passwordToggles =
        document.querySelectorAll(
            ".password-toggle"
        );

    passwordToggles.forEach(function (toggle) {

        toggle.addEventListener(
            "click",
            function () {

                const input =
                    this.parentElement.querySelector(
                        "input"
                    );

                if (!input) return;


                if (input.type === "password") {

                    input.type = "text";

                    this.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                } else {

                    input.type = "password";

                    this.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';

                }

            }
        );

    });



    /* =====================================================
       11. FILE NAME DISPLAY
    ===================================================== */

    const fileInputs =
        document.querySelectorAll(
            'input[type="file"]'
        );

    fileInputs.forEach(function (input) {

        input.addEventListener(
            "change",
            function () {

                const fileName =
                    this.files &&
                    this.files.length
                        ? this.files[0].name
                        : "";


                /*
                   Support both:
                   .file-name
                   #paymentFileName
                */

                let fileLabel =
                    this.parentElement.querySelector(
                        ".file-name"
                    );


                if (!fileLabel) {

                    fileLabel =
                        document.querySelector(
                            "#paymentFileName"
                        );

                }


                if (
                    fileLabel &&
                    fileName
                ) {

                    fileLabel.textContent =
                        fileName;

                }

            }
        );

    });



    /* =====================================================
       12. FAQ ACCORDION
    ===================================================== */

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );

    faqItems.forEach(function (item) {

        const question =
            item.querySelector(
                ".faq-question"
            );

        if (!question) return;


        question.addEventListener(
            "click",
            function () {

                const isOpen =
                    item.classList.contains(
                        "active"
                    );


                faqItems.forEach(
                    function (otherItem) {

                        otherItem.classList.remove(
                            "active"
                        );

                    }
                );


                if (!isOpen) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

    });



    /* =====================================================
       13. CURRENT YEAR
    ===================================================== */

    const yearElements =
        document.querySelectorAll(
            ".current-year, #currentYear"
        );

    yearElements.forEach(function (element) {

        element.textContent =
            new Date().getFullYear();

    });



    /* =====================================================
       14. IMAGE FALLBACK
    ===================================================== */

    const images =
        document.querySelectorAll("img");

    images.forEach(function (image) {

        image.addEventListener(
            "error",
            function () {

                this.classList.add(
                    "image-error"
                );

            }
        );

    });



    /* =====================================================
       15. PAGE LOADED
    ===================================================== */

    document.body.classList.add(
        "page-loaded"
    );


    console.log(
        "U.S TRAVEL & TOURS website loaded successfully."
    );

});



// =========================================================
// PROTECTED VISA / APPLICATION LINKS
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    const protectedLinks = document.querySelectorAll(
        'a[href="application.html"],' +
        'a[href="./application.html"],' +
        'a[href="../application.html"],' +
        '[data-application-link]'
    );

    protectedLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const token =
                localStorage.getItem("authToken") ||
                sessionStorage.getItem("authToken");

            if (token) {

                // Already logged in
                window.location.href =
                    "application.html";

            } else {

                // Save requested page
                sessionStorage.setItem(
                    "returnAfterLogin",
                    "application.html"
                );

                // Not logged in
                window.location.href =
                    "login.html";

            }

        });

    });

});


/* =========================================================
   CUSTOMER ACCOUNT / LOGIN / LOGOUT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const localToken = localStorage.getItem("authToken");
    const sessionToken = sessionStorage.getItem("authToken");

    const authToken = localToken || sessionToken;

    const loginLink = document.querySelector("[data-login-link]");
    const accountMenu = document.querySelector("[data-account-menu]");

    const mobileLogin = document.querySelector("[data-mobile-login]");
    const mobileAccount = document.querySelector("[data-mobile-account]");

    /* -----------------------------------------------------
       LOGIN / ACCOUNT VISIBILITY
    ----------------------------------------------------- */

    if (authToken) {

        // Desktop
        if (loginLink) {
            loginLink.style.display = "none";
        }

        if (accountMenu) {
            accountMenu.style.display = "block";
        }

        // Mobile
        if (mobileLogin) {
            mobileLogin.style.display = "none";
        }

        if (mobileAccount) {
            mobileAccount.style.display = "block";
        }

    } else {

        // Desktop
        if (loginLink) {
            loginLink.style.display = "";
        }

        if (accountMenu) {
            accountMenu.style.display = "none";
        }

        // Mobile
        if (mobileLogin) {
            mobileLogin.style.display = "";
        }

        if (mobileAccount) {
            mobileAccount.style.display = "none";
        }
    }


    /* -----------------------------------------------------
       ACCOUNT DROPDOWN
    ----------------------------------------------------- */

    const accountButton =
        document.querySelector("[data-account-button]");

    const accountDropdown =
        document.querySelector("[data-account-dropdown]");

    if (accountButton && accountDropdown) {

        accountButton.addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            accountDropdown.classList.toggle("show");

        });

        document.addEventListener("click", function () {

            accountDropdown.classList.remove("show");

        });

    }


    /* -----------------------------------------------------
       LOGOUT
    ----------------------------------------------------- */

    const logoutButtons =
        document.querySelectorAll("[data-logout]");

    logoutButtons.forEach(function (logoutButton) {

        logoutButton.addEventListener("click", async function (event) {

            event.preventDefault();

            const token =
                localStorage.getItem("authToken") ||
                sessionStorage.getItem("authToken");

            try {

                if (token) {

                    await fetch("/api/auth/logout", {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });

                }

            } catch (error) {

                console.warn(
                    "Logout request failed:",
                    error
                );

            }

            /* Clear customer session */

            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");

            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("authUser");

            /* Return to Home */

            window.location.href = "index.html";

        });

    });

});