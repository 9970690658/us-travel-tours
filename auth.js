// =========================================================
// U.S TRAVEL & TOURS
// CUSTOMER AUTHENTICATION FRONTEND
// =========================================================
const API_BASE_URL = "https://us-travel-tours.onrender.com";
console.log(
    "CUSTOMER AUTHENTICATION JS LOADED"
);

// =========================================================
// HELPERS
// =========================================================

function getAuthToken() {

    return (
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        null
    );

}

function saveAuthSession(data, remember) {

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");

    if (remember) {

        localStorage.setItem(
            "authToken",
            data.token
        );

        localStorage.setItem(
            "authUser",
            JSON.stringify(data.user)
        );

    } else {

        sessionStorage.setItem(
            "authToken",
            data.token
        );

        sessionStorage.setItem(
            "authUser",
            JSON.stringify(data.user)
        );

    }

}

function clearAuthSession() {

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");

}

function showMessage(
    element,
    message,
    type = "error"
) {

    if (!element) {
        return;
    }

    element.textContent =
        message || "";

    element.classList.remove(
        "success",
        "error"
    );

    if (message) {

        element.classList.add(
            type
        );

    }

}

async function authRequest(
    url,
    options = {}
) {

    const token =
        getAuthToken();

    const headers = {
        ...(options.headers || {})
    };

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {

        headers["Content-Type"] =
            "application/json";

    }

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }

    const response =
    await fetch(
        `${API_BASE_URL}${url}`,
        {
            ...options,
            headers
        }
    );

    let data = {};

    try {

        data =
            await response.json();

    } catch {

        data = {};

    }

    if (!response.ok) {

        const error =
            new Error(
                data.message ||
                "Request failed."
            );

        error.status =
            response.status;

        error.data =
            data;

        throw error;

    }

    return data;

}

// =========================================================
// CUSTOMER LOGIN REDIRECT
// =========================================================

async function redirectCustomerAfterLogin() {

    try {

        /*
         * Check customer's applications.
         * The Authorization token is automatically
         * added by authRequest().
         */

        const result =
            await authRequest(
                "/api/applications",
                {
                    method: "GET"
                }
            );

        const applications =
            Array.isArray(result)
                ? result
                : (
                    Array.isArray(result.applications)
                        ? result.applications
                        : []
                );

        /*
         * -------------------------------------------------
         * NO APPLICATION
         * -------------------------------------------------
         *
         * New customer goes to application form.
         */

        if (applications.length === 0) {

            window.location.replace(
                "application.html"
            );

            return;

        }

        /*
         * -------------------------------------------------
         * APPLICATION EXISTS
         * -------------------------------------------------
         *
         * Customer already has an application.
         * Send customer to status page.
         */

        window.location.replace(
            "status.html"
        );

    } catch (error) {

        console.error(
            "Customer application check failed:",
            error
        );

        /*
         * If application check fails,
         * send customer to application page
         * instead of incorrectly showing status.
         */

        window.location.replace(
            "application.html"
        );

    }

}

// =========================================================
// LOGIN
// =========================================================

function initLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) {
        return;
    }

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const rememberInput =
        document.getElementById(
            "rememberMe"
        );

    const button =
        document.getElementById(
            "loginSubmitBtn"
        );

    const message =
        document.getElementById(
            "loginFormMessage"
        );

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            showMessage(
                message,
                ""
            );

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;

            const remember =
                Boolean(
                    rememberInput &&
                    rememberInput.checked
                );

            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter your email and password."
                );

                return;

            }

            button.disabled = true;

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "Signing in...";

            try {

                const result =
                    await authRequest(
                        "/api/auth/login",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    email,
                                    password,
                                    remember
                                })
                        }
                    );

                if (
                    !result ||
                    !result.success ||
                    !result.token ||
                    !result.user
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to login."
                    );

                }

                saveAuthSession(
                    result,
                    remember
                );

                showMessage(
                    message,
                    "Login successful. Redirecting...",
                    "success"
                );

                // =================================================
                // RETURN TO PREVIOUS PAGE
                // =================================================

                const returnPage =
                    sessionStorage.getItem(
                        "returnAfterLogin"
                    );

                if (returnPage) {

                    sessionStorage.removeItem(
                        "returnAfterLogin"
                    );

                    setTimeout(() => {

                        window.location.replace(
                            returnPage
                        );

                    }, 500);

                    return;

                }

                // =================================================
                // ADMIN
                // =================================================

                if (
                    result.user.role === "admin"
                ) {

                    setTimeout(() => {

                        window.location.replace(
                            "/admin/dashboard.html"
                        );

                    }, 500);

                    return;

                }

                // =================================================
                // CUSTOMER
                // =================================================

                setTimeout(async () => {

                    await redirectCustomerAfterLogin();

                }, 500);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showMessage(
                    message,
                    error.message ||
                    "Unable to login right now."
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    button.dataset.originalText ||
                    "Login";

            }

        }
    );

}

// =========================================================
// REGISTER
// =========================================================

function initRegisterForm() {

    const form =
        document.getElementById(
            "registerForm"
        );

    if (!form) {
        return;
    }

    const nameInput =
        document.getElementById(
            "registerFullName"
        );

    const emailInput =
        document.getElementById(
            "registerEmail"
        );

    const phoneInput =
        document.getElementById(
            "registerPhone"
        );

    const countryInput =
        document.getElementById(
            "registerCountry"
        );

    const cityInput =
        document.getElementById(
            "registerCity"
        );

    const passwordInput =
        document.getElementById(
            "registerPassword"
        );

    const confirmInput =
        document.getElementById(
            "registerConfirmPassword"
        );

    const consentInput =
        document.getElementById(
            "registerConsent"
        );

    const button =
        document.getElementById(
            "registerSubmitBtn"
        );

    const message =
        document.getElementById(
            "registerFormMessage"
        );

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            showMessage(
                message,
                ""
            );

            const name =
                nameInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";

            const country =
                countryInput
                    ? countryInput.value.trim()
                    : "";

            const city =
                cityInput
                    ? cityInput.value.trim()
                    : "";

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmInput.value;

            const consent =
                Boolean(
                    consentInput &&
                    consentInput.checked
                );

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showMessage(
                    message,
                    "Please complete all required fields."
                );

                return;

            }

          if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email)
) {

                showMessage(
                    message,
                    "Please enter a valid email address."
                );

                return;

            }

            if (password.length < 8) {

                showMessage(
                    message,
                    "Password must contain at least 8 characters."
                );

                return;

            }

            if (
                !/[A-Za-z]/.test(password) ||
                !/\d/.test(password)
            ) {

                showMessage(
                    message,
                    "Password must contain letters and numbers."
                );

                return;

            }

            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    message,
                    "Passwords do not match."
                );

                return;

            }

            if (!consent) {

                showMessage(
                    message,
                    "Please agree to the Terms & Conditions and Privacy Policy."
                );

                return;

            }

            button.disabled = true;

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "Creating Account...";

            try {

                const result =
                    await authRequest(
                        "/api/auth/register",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    phone,
                                    country,
                                    city,
                                    password,
                                    consent
                                })
                        }
                    );

                showMessage(
                    message,
                    result.message ||
                    "Account created successfully. Please login.",
                    "success"
                );

                form.reset();

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                showMessage(
                    message,
                    error.message ||
                    "Unable to create your account."
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    button.dataset.originalText ||
                    "Create Account";

            }

        }
    );

}

// =========================================================
// FORGOT PASSWORD
// =========================================================

function initForgotPasswordForm() {

    const form =
        document.getElementById(
            "forgotPasswordForm"
        );

    if (!form) {
        return;
    }

    const emailInput =
        document.getElementById(
            "forgotPasswordEmail"
        );

    const button =
        document.getElementById(
            "forgotPasswordSubmitBtn"
        );

    const message =
        document.getElementById(
            "forgotPasswordMessage"
        );

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            showMessage(
                message,
                ""
            );

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            if (!email) {

                showMessage(
                    message,
                    "Please enter your email address."
                );

                return;

            }

            if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email)
) {

                showMessage(
                    message,
                    "Please enter a valid email address."
                );

                return;

            }

            button.disabled = true;

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "Sending...";

            try {

                const result =
                    await authRequest(
                        "/api/auth/forgot-password",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    email
                                })
                        }
                    );

                showMessage(
                    message,
                    result.message ||
                    "If an account exists for this email, a password reset link has been sent.",
                    "success"
                );

                form.reset();

            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                showMessage(
                    message,
                    error.message ||
                    "Unable to process your request."
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    button.dataset.originalText ||
                    "Send Reset Link";

            }

        }
    );

}

// =========================================================
// RESET PASSWORD
// =========================================================

function initResetPasswordForm() {

    const form =
        document.getElementById(
            "resetPasswordForm"
        );

    if (!form) {
        return;
    }

    const passwordInput =
        document.getElementById(
            "resetPassword"
        );

    const confirmInput =
        document.getElementById(
            "resetConfirmPassword"
        );

    const button =
        document.getElementById(
            "resetPasswordSubmitBtn"
        );

    const message =
        document.getElementById(
            "resetPasswordMessage"
        );

    if (
        !passwordInput ||
        !confirmInput ||
        !button ||
        !message
    ) {
        console.error(
            "Reset password form elements are missing."
        );
        return;
    }


    // =====================================================
    // GET RESET TOKEN FROM URL
    // =====================================================

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const token =
        urlParams.get("token");


    // =====================================================
    // TOKEN VALIDATION
    // =====================================================

    if (!token) {

        showMessage(
            message,
            "This password reset link is invalid or missing."
        );

        button.disabled = true;

        return;
    }


    // =====================================================
    // RESET FORM SUBMIT
    // =====================================================

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            showMessage(
                message,
                ""
            );


            const newPassword =
                passwordInput.value;

            const confirmPassword =
                confirmInput.value;


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !newPassword ||
                !confirmPassword
            ) {

                showMessage(
                    message,
                    "Please enter and confirm your new password."
                );

                return;
            }


            // =================================================
            // PASSWORD LENGTH
            // =================================================

            if (
                newPassword.length < 8
            ) {

                showMessage(
                    message,
                    "Password must contain at least 8 characters."
                );

                return;
            }


            // =================================================
            // PASSWORD STRENGTH
            // =================================================

            if (
                !/[A-Za-z]/.test(
                    newPassword
                ) ||
                !/\d/.test(
                    newPassword
                )
            ) {

                showMessage(
                    message,
                    "Password must contain letters and numbers."
                );

                return;
            }


            // =================================================
            // CONFIRM PASSWORD
            // =================================================

            if (
                newPassword !==
                confirmPassword
            ) {

                showMessage(
                    message,
                    "Passwords do not match."
                );

                return;
            }


            // =================================================
            // DISABLE BUTTON
            // =================================================

            button.disabled = true;

            button.dataset.originalText =
                button.textContent.trim();

            button.textContent =
                "Resetting Password...";


            try {

                // =============================================
                // SEND RESET REQUEST
                // =============================================

                const result =
                    await authRequest(
                        "/api/auth/reset-password",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    token: token,
                                    newPassword:
                                        newPassword,
                                    confirmPassword:
                                        confirmPassword
                                })
                        }
                    );


                // =============================================
                // SUCCESS
                // =============================================

                if (
                    !result ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to reset your password."
                    );
                }


                showMessage(
                    message,
                    "Password reset successfully. Redirecting to login...",
                    "success"
                );


                // =============================================
                // CLEAR PASSWORD FIELDS
                // =============================================

                passwordInput.value = "";
                confirmInput.value = "";


                // =============================================
                // REDIRECT TO LOGIN
                // =============================================

                setTimeout(
                    function() {

                        window.location.replace(
                            "login.html"
                        );

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );

                showMessage(
                    message,
                    error.message ||
                    "Unable to reset your password right now."
                );

                button.disabled = false;

                button.textContent =
                    button.dataset.originalText ||
                    "Reset Password";

                return;
            }

            // =============================================
            // KEEP BUTTON DISABLED AFTER SUCCESS
            // =============================================

            button.disabled = true;

        }
    );
}

// =========================================================
// LOGOUT BUTTONS
// =========================================================

function initLogoutButtons() {

    const logoutButtons =
        document.querySelectorAll(
            "[data-logout]"
        );

    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();

                    try {

                        await authRequest(
                            "/api/auth/logout",
                            {
                                method: "POST"
                            }
                        );

                    } catch (error) {

                        console.warn(
                            "Logout request failed:",
                            error
                        );

                    } finally {

                        clearAuthSession();

                        window.location.href =
                            "login.html";

                    }

                }
            );

        }
    );

}

// =========================================================
// INIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initLoginForm();

        initRegisterForm();

        initForgotPasswordForm();

        initResetPasswordForm();

        initLogoutButtons();

    }
);