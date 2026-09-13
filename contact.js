/* =========================================================
   CONTACT.JS
   U.S TRAVEL & TOURS
========================================================= */

const API_BASE_URL =
    "https://us-travel-tours.onrender.com";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONTACT FORM ELEMENTS
       ===================================================== */

    const contactForm = document.getElementById("contactForm");

    const formMessage =
        document.getElementById("contactFormMessage");

    const nameInput =
        document.getElementById("contactName");

    const emailInput =
        document.getElementById("contactEmail");

    const phoneInput =
        document.getElementById("contactPhone");

    const serviceInput =
        document.getElementById("contactService");

    const subjectInput =
        document.getElementById("contactSubject");

    const messageInput =
        document.getElementById("contactMessage");

    const consentInput =
        document.getElementById("contactConsent");

    const submitButton = contactForm
        ? contactForm.querySelector(".contact-submit-btn")
        : null;


    /* =====================================================
       SHOW FORM MESSAGE
       ===================================================== */

    function showMessage(type, text) {

        if (!formMessage) {
            return;
        }

        formMessage.className =
            "contact-form-message " + type;

        formMessage.textContent = text;

        formMessage.style.display = "block";

        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =====================================================
       CLEAR FORM MESSAGE
       ===================================================== */

    function clearMessage() {

        if (!formMessage) {
            return;
        }

        formMessage.className =
            "contact-form-message";

        formMessage.textContent = "";

        formMessage.style.display = "none";
    }


    /* =====================================================
       EMAIL VALIDATION
       ===================================================== */

    function validEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    /* =====================================================
       PHONE VALIDATION
       ===================================================== */

    function validPhone(phone) {

        const numbers = phone.replace(/\D/g, "");

        return numbers.length >= 7 &&
               numbers.length <= 15;
    }


    /* =====================================================
       CHECK FORM VALIDITY
       
       IMPORTANT:
       No minimum 2 characters for name.
       No minimum 10 characters for message.

       Required:
       - Name
       - Email
       - Phone
       - Service
       - Message
       - Consent
       ===================================================== */

    function checkFormValidity() {

        if (!contactForm || !submitButton) {
            return;
        }

        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const phone = phoneInput
            ? phoneInput.value.trim()
            : "";

        const service = serviceInput
            ? serviceInput.value
            : "";

        const message = messageInput
            ? messageInput.value.trim()
            : "";

        const consent = consentInput
            ? consentInput.checked
            : false;


        /*
         * Only check whether fields have something.
         * No character minimum for name/message.
         */

        const isValid =
            name !== "" &&
            email !== "" &&
            validEmail(email) &&
            phone !== "" &&
            validPhone(phone) &&
            service !== "" &&
            message !== "" &&
            consent === true;


        /* =================================================
           ENABLE / DISABLE SUBMIT BUTTON
           ================================================= */

        submitButton.disabled = !isValid;

        if (isValid) {

            submitButton.removeAttribute(
                "aria-disabled"
            );

        } else {

            submitButton.setAttribute(
                "aria-disabled",
                "true"
            );
        }
    }


    /* =====================================================
       CONTACT FORM SUBMIT
       ===================================================== */

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async function (event) {

                /*
                 * IMPORTANT:
                 * Prevent browser from jumping/reloading.
                 */

                event.preventDefault();

                clearMessage();


                /* =========================================
                   GET FORM VALUES
                   ========================================= */

                const name = nameInput
                    ? nameInput.value.trim()
                    : "";

                const email = emailInput
                    ? emailInput.value.trim()
                    : "";

                const phone = phoneInput
                    ? phoneInput.value.trim()
                    : "";

                const service = serviceInput
                    ? serviceInput.value
                    : "";

                const subject = subjectInput
                    ? subjectInput.value.trim()
                    : "";

                const message = messageInput
                    ? messageInput.value.trim()
                    : "";

                const consent = consentInput
                    ? consentInput.checked
                    : false;


                /* =========================================
                   VALIDATION
                   ========================================= */

                if (name === "") {

                    showMessage(
                        "error",
                        "Please enter your full name."
                    );

                    if (nameInput) {
                        nameInput.focus();
                    }

                    return;
                }


                if (email === "") {

                    showMessage(
                        "error",
                        "Please enter your email address."
                    );

                    if (emailInput) {
                        emailInput.focus();
                    }

                    return;
                }


                if (!validEmail(email)) {

                    showMessage(
                        "error",
                        "Please enter a valid email address."
                    );

                    if (emailInput) {
                        emailInput.focus();
                    }

                    return;
                }


                if (phone === "") {

                    showMessage(
                        "error",
                        "Please enter your phone number."
                    );

                    if (phoneInput) {
                        phoneInput.focus();
                    }

                    return;
                }


                if (!validPhone(phone)) {

                    showMessage(
                        "error",
                        "Please enter a valid phone number."
                    );

                    if (phoneInput) {
                        phoneInput.focus();
                    }

                    return;
                }


                if (service === "") {

                    showMessage(
                        "error",
                        "Please select a service."
                    );

                    if (serviceInput) {
                        serviceInput.focus();
                    }

                    return;
                }


                /*
                 * Message only needs to contain something.
                 * NO 10-character minimum.
                 */

                if (message === "") {

                    showMessage(
                        "error",
                        "Please enter your message."
                    );

                    if (messageInput) {
                        messageInput.focus();
                    }

                    return;
                }


                if (!consent) {

                    showMessage(
                        "error",
                        "Please agree to be contacted regarding your enquiry."
                    );

                    if (consentInput) {
                        consentInput.focus();
                    }

                    return;
                }


                /* =========================================
                   SUBMIT BUTTON - SENDING STATE
                   ========================================= */

                if (submitButton) {

                    submitButton.dataset.originalText =
                        submitButton.innerHTML;

                    submitButton.disabled = true;

                    submitButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';
                }


                /* =========================================
                   BACKEND CONNECTION
                   
                   Backend will be created later.
                   ========================================= */

                try {

                    const response = await fetch(
    `${API_BASE_URL}/api/contact`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                phone: phone,

                                service: service,

                                subject: subject,

                                message: message,

                                consent: consent
                            })
                        }
                    );


                    /* =====================================
                       READ SERVER RESPONSE
                       ===================================== */

                    let data = {};

                    try {

                        data = await response.json();

                    } catch (error) {

                        data = {};
                    }


                    /* =====================================
                       SUCCESS
                       ===================================== */

                    if (response.ok) {

                        showMessage(
                            "success",
                            data.message ||
                            "Your message has been sent successfully. Our team will contact you soon."
                        );

                        contactForm.reset();
                    }


                    /* =====================================
                       SERVER ERROR
                       ===================================== */

                    else {

                        showMessage(
                            "error",
                            data.message ||
                            "Unable to send your message right now. Please try again later."
                        );
                    }

                }


                /* =========================================
                   CONNECTION / BACKEND ERROR
                   ========================================= */

                catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );

                    showMessage(
                        "error",
                        "Message service is currently unavailable. Please call us at +1 (555) 014-7725 or email ellisgeorge690@gmail.com."
                    );
                }


                /* =========================================
                   RESTORE BUTTON
                   ========================================= */

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        submitButton.dataset.originalText ||
                        'Send Message <i class="fa-solid fa-paper-plane"></i>';
                }


                /*
                 * Re-check button state.
                 * If form was reset, it becomes disabled
                 * until the user fills it again.
                 */

                checkFormValidity();

            }
        );
    }


    /* =====================================================
       PHONE INPUT
       ===================================================== */

    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9+\-()\s]/g,
                        ""
                    );

                checkFormValidity();
            }
        );
    }


    /* =====================================================
       FORM INPUT EVENTS
       ===================================================== */

    const inputs = [
        nameInput,
        emailInput,
        phoneInput,
        serviceInput,
        subjectInput,
        messageInput
    ];


    inputs.forEach(function (input) {

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            function () {

                if (
                    formMessage &&
                    formMessage.classList.contains("error")
                ) {

                    clearMessage();
                }

                checkFormValidity();
            }
        );


        input.addEventListener(
            "change",
            function () {

                if (
                    formMessage &&
                    formMessage.classList.contains("error")
                ) {

                    clearMessage();
                }

                checkFormValidity();
            }
        );

    });


    /* =====================================================
       CONSENT CHECKBOX
       ===================================================== */

    if (consentInput) {

        consentInput.addEventListener(
            "change",
            function () {

                if (
                    formMessage &&
                    formMessage.classList.contains("error")
                ) {

                    clearMessage();
                }

                checkFormValidity();
            }
        );
    }


    /* =====================================================
       CALL BUTTONS
       ===================================================== */

    const callButtons =
        document.querySelectorAll(
            'a[href^="tel:"]'
        );


    callButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const phoneNumber =
                    this.getAttribute("href");

                if (!phoneNumber) {
                    return;
                }

                window.location.href =
                    phoneNumber;
            }
        );
    });


    /* =====================================================
       EMAIL BUTTONS
       ===================================================== */

    const emailButtons =
        document.querySelectorAll(
            'a[href^="mailto:"]'
        );


    emailButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const emailAddress =
                    this.getAttribute("href");

                if (!emailAddress) {
                    return;
                }

                window.location.href =
                    emailAddress;
            }
        );
    });


    /* =====================================================
       GOOGLE MAPS BUTTONS
       ===================================================== */

    const mapButtons =
        document.querySelectorAll(
            'a[href*="google.com/maps"]'
        );


    mapButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const mapURL =
                    this.getAttribute("href");

                if (!mapURL) {
                    return;
                }

                window.open(
                    mapURL,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );
    });


    /* =====================================================
       SMOOTH SCROLL — CONTACT FORM
       ===================================================== */

    const contactFormLinks =
        document.querySelectorAll(
            'a[href="#contact-form"]'
        );


    contactFormLinks.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const target =
                    document.getElementById(
                        "contact-form"
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );
    });


    /* =====================================================
       INITIAL BUTTON STATE
       Empty form = DISABLED
       ===================================================== */

    checkFormValidity();


    /* =====================================================
       CONSOLE
       ===================================================== */

    console.log(
        "U.S TRAVEL & TOURS Contact JS loaded successfully."
    );

});