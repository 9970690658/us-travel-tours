 /*
 =========================================================
 U.S TRAVEL & TOURS
 APPLICATION JAVASCRIPT

 FLOW:

 1. Validate application
 2. Send application to backend
 3. Backend saves application in database
 4. Receive applicationId
 5. Save applicationId + data in sessionStorage
 6. Redirect to payments.html
 =========================================================
 */
const API_BASE_URL = "https://us-travel-tours.onrender.com";
console.log("APPLICATION JS LOADED");
// =========================================================
// CUSTOMER LOGIN PROTECTION
// =========================================================

async function checkCustomerAuthentication() {

    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    // No login token
    if (!token) {

        sessionStorage.setItem(
            "returnAfterLogin",
            "application.html"
        );

        window.location.href =
            "login.html";

        return false;
    }

    try {

        const response =
    await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "authUser"
            );

            sessionStorage.removeItem(
                "authToken"
            );

            sessionStorage.removeItem(
                "authUser"
            );

            sessionStorage.setItem(
                "returnAfterLogin",
                "application.html"
            );

            window.location.href =
                "login.html";

            return false;
        }

        const result =
            await response.json();

        if (
            !result.success ||
            !result.user ||
            result.user.role !== "customer"
        ) {

            sessionStorage.setItem(
                "returnAfterLogin",
                "application.html"
            );

            window.location.href =
                "login.html";

            return false;
        }

        console.log(
            "Customer authentication verified:",
            result.user.email
        );

        return true;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        sessionStorage.setItem(
            "returnAfterLogin",
            "application.html"
        );

        window.location.href =
            "login.html";

        return false;
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("applicationForm");

    if (!form) {
        console.error("Application form not found.");
        return;
    }

    const submitButton =
        document.getElementById("applicationSubmitBtn");

    const messageBox =
        document.getElementById("applicationFormMessage");


    // =====================================================
    // HELPERS
    // =====================================================

    function getValue(id) {

        const field = document.getElementById(id);

        if (!field) {
            return "";
        }

        return field.value.trim();
    }


    function getRadioValue(name) {

        const checked =
            form.querySelector(
                `input[name="${name}"]:checked`
            );

        return checked ? checked.value : "";
    }


    function setMessage(message, type = "error") {

        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;

        messageBox.className =
            "form-message " + type;

        messageBox.style.display = "block";
    }


    function clearMessage() {

        if (!messageBox) {
            return;
        }

        messageBox.textContent = "";
        messageBox.style.display = "none";
    }


    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }


    function cleanPhone(value) {

        return value.replace(
    /[^\d+\-\s()]/g,
    ""
);

    }


    // =====================================================
    // SUBMIT APPLICATION
    // =====================================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearMessage();


        // -------------------------------------------------
        // PREVENT DOUBLE SUBMISSION
        // -------------------------------------------------

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent =
                "Submitting...";

        }


        try {

            // =================================================
            // READ FORM DATA
            // =================================================

            const passportNumber =
                getValue("passportNumber");

            const passportIssuingCountry =
                getValue("passportIssuingCountry");

            const passportIssueDate =
                getValue("passportIssueDate");

            const passportExpiryDate =
                getValue("passportExpiryDate");


            const surname =
                getValue("surname");

            const firstMiddleName =
                getValue("firstMiddleName");

            const otherSurnames =
                getValue("otherSurnames");

            const otherFirstMiddleNames =
                getValue("otherFirstMiddleNames");


            const dateOfBirth =
                getValue("dateOfBirth");

            const birthCity =
                getValue("birthCity");

            const birthCountry =
                getValue("birthCountry");

            const birthState =
                getValue("birthState");

            const nationality =
                getValue("nationality");

            const sex =
                getRadioValue("sex");

            const nationalId =
                getValue("nationalId");


            const homeAddress =
                getValue("homeAddress");

            const homeCity =
                getValue("homeCity");

            const homeState =
                getValue("homeState");

            const postalCode =
                getValue("postalCode");

            const homeCountry =
                getValue("homeCountry");

            const homePhone =
                cleanPhone(
                    getValue("homePhone")
                );

            const businessPhone =
                cleanPhone(
                    getValue("businessPhone")
                );

            const mobilePhone =
                cleanPhone(
                    getValue("mobilePhone")
                );

            const faxNumber =
                cleanPhone(
                    getValue("faxNumber")
                );


            const maritalStatus =
                getRadioValue("maritalStatus");

            const spouseName =
                getValue("spouseName");

            const spouseDob =
                getValue("spouseDob");


            const employerSchool =
                getValue("employerSchool");

            const presentOccupation =
                getValue("presentOccupation");

            const employerAddress =
                getValue("employerAddress");


            const usArrivalDate =
                getValue("usArrivalDate");

            const visaEmail =
                getValue("visaEmail");

            const usStayAddress =
                getValue("usStayAddress");

            const usContactName =
                getValue("usContactName");

            const usContactPhone =
                cleanPhone(
                    getValue("usContactPhone")
                );

            const stayDuration =
                getValue("stayDuration");

            const tripPurpose =
                getValue("tripPurpose");


            const usContactBusinessPhone =
                cleanPhone(
                    getValue("usContactBusinessPhone")
                );

            const usContactCellPhone =
                cleanPhone(
                    getValue("usContactCellPhone")
                );

            const tripPaidBy =
                getValue("tripPaidBy");


            const previousUsVisit =
                getRadioValue("previousUsVisit");

            const previousUsWhen =
                getValue("previousUsWhen");

            const previousUsDuration =
                getValue("previousUsDuration");


            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (!passportNumber) {
                throw new Error(
                    "Please enter your passport number."
                );
            }


            if (!surname) {
                throw new Error(
                    "Please enter your surname."
                );
            }


            if (!firstMiddleName) {
                throw new Error(
                    "Please enter your first and middle name."
                );
            }


            if (!dateOfBirth) {
                throw new Error(
                    "Please enter your date of birth."
                );
            }


            if (!nationality) {
                throw new Error(
                    "Please enter your nationality."
                );
            }


            if (
                visaEmail &&
                !isValidEmail(visaEmail)
            ) {

                throw new Error(
                    "Please enter a valid email address."
                );

            }


            // =================================================
            // CONSENT
            // =================================================

            const consentCheckbox =
                document.getElementById(
                    "applicationConsent"
                );


            if (
                consentCheckbox &&
                !consentCheckbox.checked
            ) {

                throw new Error(
                    "Please accept the application declaration before continuing."
                );

            }


            // =================================================
            // BUILD APPLICATION DATA
            // =================================================

            const applicationData = {

                applicationType:
                    "U.S. Travel & Tours Application",


                submittedAt:
                    new Date().toISOString(),


                passportInformation: {

                    passportNumber:
                        passportNumber,

                    passportIssuingCountry:
                        passportIssuingCountry,

                    passportIssueDate:
                        passportIssueDate,

                    passportExpiryDate:
                        passportExpiryDate

                },


                nameInformation: {

                    surname:
                        surname,

                    firstMiddleName:
                        firstMiddleName,

                    otherSurnames:
                        otherSurnames,

                    otherFirstMiddleNames:
                        otherFirstMiddleNames

                },


                personalInformation: {

                    dateOfBirth:
                        dateOfBirth,

                    birthCity:
                        birthCity,

                    birthCountry:
                        birthCountry,

                    birthState:
                        birthState,

                    nationality:
                        nationality,

                    sex:
                        sex,

                    nationalId:
                        nationalId

                },


                homeAddressContact: {

                    homeAddress:
                        homeAddress,

                    homeCity:
                        homeCity,

                    homeState:
                        homeState,

                    postalCode:
                        postalCode,

                    homeCountry:
                        homeCountry,

                    homePhone:
                        homePhone,

                    businessPhone:
                        businessPhone,

                    mobilePhone:
                        mobilePhone,

                    faxNumber:
                        faxNumber

                },


                maritalInformation: {

                    maritalStatus:
                        maritalStatus,

                    spouseName:
                        spouseName,

                    spouseDob:
                        spouseDob

                },


                employmentEducation: {

                    employerSchool:
                        employerSchool,

                    presentOccupation:
                        presentOccupation,

                    employerAddress:
                        employerAddress

                },


                usTravelInformation: {

                    usArrivalDate:
                        usArrivalDate,

                    email:
                        visaEmail,

                    usStayAddress:
                        usStayAddress,

                    usContactName:
                        usContactName,

                    usContactPhone:
                        usContactPhone,

                    stayDuration:
                        stayDuration,

                    tripPurpose:
                        tripPurpose

                },


                usContactInformation: {

                    businessPhone:
                        usContactBusinessPhone,

                    cellPhone:
                        usContactCellPhone,

                    tripPaidBy:
                        tripPaidBy

                },


                previousUsTravel: {

                    previousUsVisit:
                        previousUsVisit,

                    previousUsWhen:
                        previousUsWhen,

                    previousUsDuration:
                        previousUsDuration

                },


                consent:
                    true

            };


            // =================================================
            // SEND APPLICATION TO BACKEND
            // =================================================

            console.log(
                "Sending application to /api/applications..."
            );


           const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

const response =
    await fetch(
        `${API_BASE_URL}/api/applications`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`
            },

            body:
                JSON.stringify(
                    applicationData
                )
        }
    );


            // =================================================
            // READ SERVER RESPONSE
            // =================================================

            let result;

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "Invalid response received from server."
                );

            }


            console.log(
                "Application server response:",
                result
            );


            // =================================================
            // SERVER ERROR
            // =================================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to submit application. Please try again."
                );

            }


            // =================================================
            // APPLICATION ID IS CRITICAL
            // =================================================

            if (!result.applicationId) {

                throw new Error(
                    "Application was saved but no application ID was returned."
                );

            }


            const applicationId =
                Number(result.applicationId);


            // =================================================
            // SAVE PAYMENT-PENDING APPLICATION
            // =================================================

            const pendingApplication = {

                applicationId:
                    applicationId,

                status:
                    result.status ||
                    "payment_pending",

                applicationData:
                    applicationData

            };


            sessionStorage.setItem(
                "pendingApplication",
                JSON.stringify(
                    pendingApplication
                )
            );


            // Also store ID separately for safety.

            sessionStorage.setItem(
                "applicationId",
                String(applicationId)
            );


            console.log(
                "Application saved successfully.",
                {
                    applicationId:
                        applicationId,

                    status:
                        result.status
                }
            );


            // =================================================
            // SHOW SUCCESS
            // =================================================

            setMessage(
                "Application saved successfully. Redirecting to payment...",
                "success"
            );


            // =================================================
            // REDIRECT TO ACTUAL FILE
            // =================================================

            setTimeout(function () {

                window.location.href =
                    "payments.html";

            }, 700);


        } catch (error) {

            console.error(
                "Application submission error:",
                error
            );


            setMessage(
                error.message ||
                "Unable to submit application. Please try again.",
                "error"
            );


            // Re-enable button

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    submitButton.dataset.originalText ||
                    "Submit Application";

            }

        }

    });

});