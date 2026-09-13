/*
=========================================================
U.S TRAVEL & TOURS
APPLICATION STATUS JAVASCRIPT
=========================================================
*/

console.log("STATUS JS LOADED");


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "statusForm"
            );

        if (!form) {
            return;
        }


        const input =
            document.getElementById(
                "applicationIdInput"
            );

        const button =
            document.getElementById(
                "statusSearchBtn"
            );

        const message =
            document.getElementById(
                "statusMessage"
            );

        const resultBox =
            document.getElementById(
                "statusResult"
            );

        const resultId =
            document.getElementById(
                "resultApplicationId"
            );

        const resultStatus =
            document.getElementById(
                "resultStatus"
            );

        const resultUpdated =
            document.getElementById(
                "resultUpdatedAt"
            );

        const steps =
            document.querySelectorAll(
                ".status-step"
            );


        // =================================================
        // MESSAGE
        // =================================================

        function showMessage(
            text,
            type = "error"
        ) {

            if (!message) {
                return;
            }

            message.textContent =
                text;

            message.style.display =
                "block";


            if (type === "success") {

                message.style.background =
                    "rgba(34,139,84,.10)";

                message.style.color =
                    "#228b54";

            } else {

                message.style.background =
                    "rgba(180,40,40,.10)";

                message.style.color =
                    "#b42828";

            }

        }


        function clearMessage() {

            if (!message) {
                return;
            }

            message.textContent =
                "";

            message.style.display =
                "none";

        }


        // =================================================
        // NORMALIZE APPLICATION ID
        // =================================================

        function normalizeApplicationId(
            value
        ) {

            value =
                String(value || "")
                    .trim()
                    .toUpperCase();


            // Allow:
            // UST-000001
            // UST000001
            // 000001
            // 1

            value =
                value.replace(
                    /^UST-?/,
                    ""
                );


            const number =
                Number(value);


            if (
                !Number.isInteger(number) ||
                number <= 0
            ) {

                return null;

            }


            return number;

        }


        // =================================================
        // STATUS LABEL
        // IMPORTANT
        // THESE VALUES MATCH DATABASE STATUS VALUES
        // =================================================

        function getStatusLabel(
            status
        ) {

            const normalizedStatus =
                String(status || "")
                    .trim()
                    .toLowerCase();


            const labels = {

                pending:
                    "Pending",

                payment_pending:
                    "Submitted",

                payment_submitted:
                    "Submitted",

                under_review:
                    "Under Review",

                approved:
                    "Accepted",

                rejected:
                    "Rejected",

                completed:
                    "Completed"

            };


            return (
                labels[normalizedStatus] ||
                "Unknown"
            );

        }


        // =================================================
        // UPDATE TIMELINE
        // =================================================

        function updateTimeline(
            status
        ) {

            const normalizedStatus =
                String(status || "")
                    .trim()
                    .toLowerCase();


            /*
            Timeline order:

            payment_pending
                    ↓
            payment_submitted
                    ↓
            under_review
                    ↓
            approved

            rejected is a final result and is handled
            separately.
            */

            const order = [

                "payment_pending",

                "payment_submitted",

                "under_review",

                "approved"

            ];


            let currentIndex =
                order.indexOf(
                    normalizedStatus
                );


            /*
            Rejected:

            Application reached review stage,
            then was rejected.

            So previous stages are completed
            and Under Review remains active.
            */

            if (
                normalizedStatus ===
                "rejected"
            ) {

                currentIndex = 2;

            }


            /*
            If status is "pending",
            treat it as the first stage.
            */

            if (
                normalizedStatus ===
                "pending"
            ) {

                currentIndex = 0;

            }


            if (currentIndex < 0) {

                currentIndex = 0;

            }


            steps.forEach(
                function (step) {

                    const stepStatus =
                        String(
                            step.dataset.step || ""
                        )
                        .trim()
                        .toLowerCase();


                    const stepIndex =
                        order.indexOf(
                            stepStatus
                        );


                    step.classList.remove(
                        "active"
                    );

                    step.classList.remove(
                        "completed"
                    );


                    /*
                    Completed previous steps
                    */

                    if (
                        stepIndex >= 0 &&
                        stepIndex <
                        currentIndex
                    ) {

                        step.classList.add(
                            "completed"
                        );

                    }


                    /*
                    Current step
                    */

                    if (
                        stepIndex ===
                        currentIndex
                    ) {

                        step.classList.add(
                            "active"
                        );

                    }


                    /*
                    Approved:

                    When approved, all steps
                    should appear completed.
                    */

                    if (
                        normalizedStatus ===
                            "approved" &&
                        stepIndex >= 0
                    ) {

                        step.classList.remove(
                            "active"
                        );

                        step.classList.add(
                            "completed"
                        );

                    }


                    /*
                    Completed:

                    Everything completed.
                    */

                    if (
                        normalizedStatus ===
                            "completed" &&
                        stepIndex >= 0
                    ) {

                        step.classList.remove(
                            "active"
                        );

                        step.classList.add(
                            "completed"
                        );

                    }

                }
            );

        }


        // =================================================
        // LOAD APPLICATION
        // =================================================

        async function loadApplication(
            applicationId
        ) {

            clearMessage();


            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Checking...";

            }


            try {

                /*
                IMPORTANT:

                This calls the existing backend.

                GET:
                /api/applications/:id

                The backend returns:

                {
                    success: true,
                    application: {
                        id,
                        data,
                        status,
                        createdAt,
                        updatedAt
                    }
                }
                */
const authToken =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

if (!authToken) {
    window.location.href = "login.html";
    return;
}

const response =
    await fetch(
        `https://us-travel-tours.onrender.com/api/applications/${applicationId}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization":
                    "Bearer " + authToken
            },
            cache: "no-store"
        }
    );


                let data;


                try {

                    data =
                        await response.json();

                } catch (error) {

                    throw new Error(
                        "Invalid server response."
                    );

                }


                if (
                    !response.ok ||
                    !data.success ||
                    !data.application
                ) {

                    throw new Error(
                        data.message ||
                        "Application not found."
                    );

                }


                const application =
                    data.application;


                /*
                THIS IS THE MOST IMPORTANT LINE.

                The status comes directly from
                the database through applications.js.
                */

                const status =
                    String(
                        application.status || ""
                    )
                    .trim()
                    .toLowerCase();


                if (!status) {

                    throw new Error(
                        "Application status is not available."
                    );

                }


                // =================================================
                // DISPLAY APPLICATION ID
                // =================================================

                if (resultId) {

                    resultId.textContent =
                        "UST-" +
                        String(application.id)
                            .padStart(
                                6,
                                "0"
                            );

                }


                // =================================================
                // DISPLAY CURRENT STATUS
                // =================================================

                if (resultStatus) {

                    resultStatus.textContent =
                        getStatusLabel(
                            status
                        );


                    /*
                    STATUS COLORS
                    */

                    if (
                        status ===
                            "approved" ||
                        status ===
                            "completed"
                    ) {

                        resultStatus.style.color =
                            "#228b54";

                    } else if (
                        status ===
                            "rejected"
                    ) {

                        resultStatus.style.color =
                            "#b42828";

                    } else {

                        resultStatus.style.color =
                            "var(--gold)";

                    }

                }


                // =================================================
                // UPDATED DATE
                // =================================================

                if (resultUpdated) {

                    if (
                        application.updatedAt
                    ) {

                        const date =
                            new Date(
                                application.updatedAt
                            );


                        if (
                            !Number.isNaN(
                                date.getTime()
                            )
                        ) {

                            resultUpdated.textContent =
                                date.toLocaleString();

                        } else {

                            resultUpdated.textContent =
                                application.updatedAt;

                        }

                    } else {

                        resultUpdated.textContent =
                            "Not available";

                    }

                }


                // =================================================
                // UPDATE TIMELINE
                // =================================================

                updateTimeline(
                    status
                );


                // =================================================
                // SHOW RESULT
                // =================================================

                if (resultBox) {

                    resultBox.style.display =
                        "block";

                }


                showMessage(
                    "Application status updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Status lookup error:",
                    error
                );


                if (resultBox) {

                    resultBox.style.display =
                        "none";

                }


                showMessage(
                    error.message ||
                    "Unable to check application status."
                );

            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Check Status";

                }

            }

        }


        // =================================================
        // FORM SUBMIT
        // =================================================

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const applicationId =
                    normalizeApplicationId(
                        input.value
                    );


                if (!applicationId) {

                    showMessage(
                        "Please enter a valid Application ID, for example UST-000001."
                    );


                    if (resultBox) {

                        resultBox.style.display =
                            "none";

                    }

                    return;

                }


                loadApplication(
                    applicationId
                );

            }
        );


        // =================================================
        // AUTO LOAD CURRENT APPLICATION ID
        // =================================================

        const savedId =
            sessionStorage.getItem(
                "applicationId"
            );


        if (savedId) {

            input.value =
                "UST-" +
                String(savedId)
                    .padStart(
                        6,
                        "0"
                    );

        }

    }
);