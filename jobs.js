// =========================================================
// U.S TRAVEL & TOURS
// JOB APPLICATION FRONTEND
// =========================================================
const API_BASE_URL =
    "https://us-travel-tours.onrender.com";
document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const form =
            document.getElementById(
                "jobApplicationForm"
            );

        // =====================================================
        // JOB APPLY PAGE
        // =====================================================

        if (form) {

            const token =
                localStorage.getItem("authToken") ||
                sessionStorage.getItem("authToken");

            // -------------------------------------------------
            // LOGIN REQUIRED
            // -------------------------------------------------

            if (!token) {

                sessionStorage.setItem(
                    "returnAfterLogin",
                    "job-apply.html" +
                    window.location.search
                );

                window.location.replace(
                    "login.html"
                );

                return;

            }

            // -------------------------------------------------
            // ELEMENTS
            // -------------------------------------------------

            const jobPosition =
                document.getElementById(
                    "jobPosition"
                );

            const resume =
                document.getElementById(
                    "resume"
                );

            const resumeFileName =
                document.getElementById(
                    "resumeFileName"
                );

            const message =
                document.getElementById(
                    "applicationMessage"
                );

            const submitButton =
                form.querySelector(
                    "button[type='submit']"
                );

            // -------------------------------------------------
            // AUTO SELECT JOB FROM URL
            // -------------------------------------------------

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const selectedJob =
                params.get("job");

            if (
                selectedJob &&
                jobPosition
            ) {

                const option =
                    jobPosition.querySelector(
                        `option[value="${CSS.escape(selectedJob)}"]`
                    );

                if (option) {

                    jobPosition.value =
                        selectedJob;

                }

            }

            // -------------------------------------------------
            // RESUME FILE NAME
            // -------------------------------------------------

            resume?.addEventListener(
                "change",
                function () {

                    if (
                        !resume.files ||
                        !resume.files.length
                    ) {

                        if (resumeFileName) {

                            resumeFileName.textContent =
                                "No file selected";

                        }

                        return;

                    }

                    const file =
                        resume.files[0];

                    if (resumeFileName) {

                        resumeFileName.textContent =
                            file.name;

                    }

                }
            );

            // -------------------------------------------------
            // MESSAGE
            // -------------------------------------------------

            function showMessage(
                text,
                type
            ) {

                if (!message) {
                    return;
                }

                message.textContent =
                    text;

                message.className =
                    "application-message";

                if (type) {

                    message.classList.add(
                        type
                    );

                }

            }

            // -------------------------------------------------
            // SUBMIT
            // -------------------------------------------------

            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    showMessage(
                        "",
                        ""
                    );

                    if (
                        !form.checkValidity()
                    ) {

                        form.reportValidity();

                        return;

                    }

                    if (
                        !resume ||
                        !resume.files ||
                        !resume.files.length
                    ) {

                        showMessage(
                            "Please upload your resume.",
                            "error"
                        );

                        return;

                    }

                    const file =
                        resume.files[0];

                    const allowedTypes = [

                        "application/pdf",

                        "application/msword",

                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                    ];

                    const extension =
                        file.name
                            .split(".")
                            .pop()
                            .toLowerCase();

                    const allowedExtensions = [

                        "pdf",
                        "doc",
                        "docx"

                    ];

                    if (
                        !allowedTypes.includes(
                            file.type
                        ) &&
                        !allowedExtensions.includes(
                            extension
                        )
                    ) {

                        showMessage(
                            "Only PDF, DOC or DOCX resume files are allowed.",
                            "error"
                        );

                        return;

                    }

                    if (
                        file.size >
                        5 * 1024 * 1024
                    ) {

                        showMessage(
                            "Resume must be 5 MB or smaller.",
                            "error"
                        );

                        return;

                    }

                    // -------------------------------------------------
                    // BUTTON
                    // -------------------------------------------------

                    const originalButtonHTML =
                        submitButton
                            ? submitButton.innerHTML
                            : "";

                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.innerHTML =
                            `
                                Submitting...
                                <i class="fa-solid fa-spinner fa-spin"></i>
                            `;

                    }

                    try {

                        const formData =
                            new FormData(form);

                        const response =
                            await fetch(`${API_BASE_URL}/api/job-applications`, {

                                    method: "POST",

                                    headers: {

                                        "Authorization":
                                            `Bearer ${token}`

                                    },

                                    body:
                                        formData

                                }
                            );

                        let result =
                            null;

                        try {

                            result =
                                await response.json();

                        } catch {

                            result =
                                null;

                        }

                        if (
                            response.status === 401 ||
                            response.status === 403
                        ) {

                            localStorage.removeItem(
                                "authToken"
                            );

                            sessionStorage.removeItem(
                                "authToken"
                            );

                            sessionStorage.setItem(
                                "returnAfterLogin",
                                "job-apply.html" +
                                window.location.search
                            );

                            window.location.replace(
                                "login.html"
                            );

                            return;

                        }

                        if (
                            !response.ok ||
                            !result?.success
                        ) {

                            throw new Error(
                                result?.message ||
                                "Unable to submit job application."
                            );

                        }

                        showMessage(
                            result.message ||
                            "Job application submitted successfully.",
                            "success"
                        );

                        // -------------------------------------------------
                        // RESET FORM
                        // -------------------------------------------------

                        form.reset();

                        if (
                            resumeFileName
                        ) {

                            resumeFileName.textContent =
                                "No file selected";

                        }

                        if (
                            selectedJob &&
                            jobPosition
                        ) {

                            jobPosition.value =
                                selectedJob;

                        }

                        // -------------------------------------------------
                        // SAVE LAST APPLICATION ID
                        // -------------------------------------------------

                        if (
                            result.application?.id
                        ) {

                            sessionStorage.setItem(
                                "lastJobApplicationId",
                                String(
                                    result.application.id
                                )
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Job application error:",
                            error
                        );

                        showMessage(
                            error.message ||
                            "Unable to submit job application. Please try again.",
                            "error"
                        );

                    } finally {

                        if (submitButton) {

                            submitButton.disabled =
                                false;

                            submitButton.innerHTML =
                                originalButtonHTML;

                        }

                    }

                }
            );

        }

        // =====================================================
        // MY JOB APPLICATIONS PAGE
        // =====================================================

        const myJobsContainer =
            document.getElementById(
                "myJobApplications"
            );

        if (
            myJobsContainer
        ) {

            await loadMyJobApplications(
                myJobsContainer
            );

        }

    }
);

// =========================================================
// LOAD CUSTOMER JOB APPLICATIONS
// =========================================================

async function loadMyJobApplications(
    container
) {

    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (!token) {

        window.location.replace(
            "login.html"
        );

        return;

    }

    try {

        await fetch(`${API_BASE_URL}/api/job-applications`, {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    },

                    cache:
                        "no-store"

                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "authToken"
            );

            sessionStorage.removeItem(
                "authToken"
            );

            window.location.replace(
                "login.html"
            );

            return;

        }

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load applications."
            );

        }

        const applications =
            Array.isArray(
                result.applications
            )
                ? result.applications
                : [];

        if (
            !applications.length
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <div>
                        <i class="fa-solid fa-briefcase"></i>
                    </div>

                    <h3>
                        No Job Applications Yet
                    </h3>

                    <p>
                        Your submitted job applications
                        will appear here.
                    </p>

                    <a
                        href="jobs.html"
                        class="btn btn-primary"
                    >
                        View Job Opportunities
                    </a>

                </div>

            `;

            return;

        }

        container.innerHTML =
            applications
                .map(
                    application => {

                        return `

                            <article
                                class="my-job-application-card"
                            >

                                <div
                                    class="my-job-application-top"
                                >

                                    <div>

                                        <span>
                                            APPLICATION #${escapeJobsHtml(application.id)}
                                        </span>

                                        <h3>
                                            ${escapeJobsHtml(application.job_title)}
                                        </h3>

                                    </div>

                                    <strong
                                        class="job-status-badge ${escapeJobsHtml(application.status)}"
                                    >
                                        ${formatJobStatus(application.status)}
                                    </strong>

                                </div>

                                <div
                                    class="my-job-application-details"
                                >

                                    <p>
                                        <strong>Name:</strong>
                                        ${escapeJobsHtml(application.name)}
                                    </p>

                                    <p>
                                        <strong>Email:</strong>
                                        ${escapeJobsHtml(application.email)}
                                    </p>

                                    <p>
                                        <strong>Phone:</strong>
                                        ${escapeJobsHtml(application.phone)}
                                    </p>

                                    <p>
                                        <strong>Submitted:</strong>
                                        ${formatJobDate(application.created_at)}
                                    </p>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "My job applications error:",
            error
        );

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load applications
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}

// =========================================================
// HELPERS
// =========================================================

function escapeJobsHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

function formatJobStatus(
    status
) {

    const labels = {

        new:
            "New",

        reviewing:
            "Reviewing",

        shortlisted:
            "Shortlisted",

        rejected:
            "Rejected",

        hired:
            "Hired"

    };

    return labels[status] ||
        String(
            status || "New"
        )
            .replaceAll(
                "_",
                " "
            );

}

function formatJobDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }

    return date.toLocaleDateString(
        "en-US",
        {

            month: "short",

            day: "numeric",

            year: "numeric"

        }
    );

}

// =========================================================
// MY JOB APPLICATIONS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const container =
            document.getElementById(
                "myJobApplications"
            );

        if (!container) {
            return;
        }


        const loading =
            document.getElementById(
                "myJobsLoading"
            );

        const empty =
            document.getElementById(
                "myJobsEmpty"
            );

        const errorBox =
            document.getElementById(
                "myJobsError"
            );

        const errorText =
            document.getElementById(
                "myJobsErrorText"
            );

        const wrapper =
            document.getElementById(
                "myJobsTableWrapper"
            );

        const body =
            document.getElementById(
                "myJobsTableBody"
            );


        const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

if (!token) {
    window.location.href =
        "login.html?returnAfterLogin=job-apply.html";
    return;
}


        // -----------------------------------------------------
        // LOAD USER JOB APPLICATIONS
        // -----------------------------------------------------

        try {

            await fetch(
    `${API_BASE_URL}/api/job-applications/my`,
    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            let result = null;

            try {
                result =
                    await response.json();
            } catch {
                result = null;
            }


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "authToken"
                );

                sessionStorage.removeItem(
                    "authToken"
                );

                window.location.href =
                    "login.html?returnAfterLogin=my-job-applications.html";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    result?.message ||
                    "Unable to load your job applications."
                );
            }


            const applications =
                Array.isArray(
                    result?.applications
                )
                    ? result.applications
                    : [];


            // -------------------------------------------------
            // HIDE LOADING
            // -------------------------------------------------

            if (loading) {
                loading.style.display =
                    "none";
            }


            // -------------------------------------------------
            // NO APPLICATIONS
            // -------------------------------------------------

            if (!applications.length) {

                if (empty) {
                    empty.style.display =
                        "block";
                }

                return;
            }


            // -------------------------------------------------
            // SHOW TABLE
            // -------------------------------------------------

            if (wrapper) {
                wrapper.style.display =
                    "block";
            }


            if (!body) {
                return;
            }


            body.innerHTML = "";


            applications.forEach(
                application => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const status =
                        String(
                            application.status ||
                            "new"
                        ).toLowerCase();


                    const statusLabels = {

                        new:
                            "Submitted",

                        reviewing:
                            "Under Review",

                        shortlisted:
                            "Shortlisted",

                        hired:
                            "Accepted",

                        rejected:
                            "Rejected"
                    };


                    const statusLabel =
                        statusLabels[status] ||
                        status
                            .replaceAll(
                                "_",
                                " "
                            )
                            .replace(
                                /\b\w/g,
                                letter =>
                                    letter.toUpperCase()
                            );


                    const applicationId =
                        application.id ??
                        "—";


                    const jobTitle =
                        application.job_title ||
                        "—";


                    const createdAt =
                        application.created_at ||
                        application.createdAt;


                    let dateText =
                        "—";


                    if (createdAt) {

                        const date =
                            new Date(
                                createdAt
                            );

                        if (
                            !Number.isNaN(
                                date.getTime()
                            )
                        ) {

                            dateText =
                                date.toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    }
                                );
                        }
                    }


                    const resumeHTML =
                        application.resume_file
                            ? `
                                <a
                                    href="${API_BASE_URL}/api/job-applications/${encodeURIComponent(applicationId)}/resume"
                                    class="job-resume-link"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    View Resume
                                </a>
                            `
                            : "—";


                    row.innerHTML = `

                        <td>
                            #${escapeJobHtml(
                                applicationId
                            )}
                        </td>

                        <td class="job-title-cell">
                            ${escapeJobHtml(
                                jobTitle
                            )}
                        </td>

                        <td>
                            <span class="job-status-badge">
                                ${escapeJobHtml(
                                    statusLabel
                                )}
                            </span>
                        </td>

                        <td class="job-date">
                            ${escapeJobHtml(
                                dateText
                            )}
                        </td>

                        <td>
                            ${resumeHTML}
                        </td>

                    `;


                    body.appendChild(
                        row
                    );
                }
            );


        } catch (error) {

            console.error(
                "My job applications error:",
                error
            );


            if (loading) {
                loading.style.display =
                    "none";
            }


            if (errorBox) {
                errorBox.style.display =
                    "block";
            }


            if (errorText) {
                errorText.textContent =
                    error.message ||
                    "Unable to load your job applications.";
            }
        }
    }
);


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeJobHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   MY JOB APPLICATIONS
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const tableWrapper =
        document.getElementById("myJobsTableWrapper");

    const tableBody =
        document.getElementById("myJobsTableBody");

    const loading =
        document.getElementById("myJobsLoading");

    const empty =
        document.getElementById("myJobsEmpty");

    const errorBox =
        document.getElementById("myJobsError");

    const errorText =
        document.getElementById("myJobsErrorText");

    if (!tableWrapper || !tableBody) {
        return;
    }

    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (!token) {

        window.location.href =
            "login.html?returnAfterLogin=my-job-applications.html";

        return;
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getStatus(status) {

        const map = {

            new: {
                label: "Submitted",
                className: "status-submitted"
            },

            reviewing: {
                label: "Under Review",
                className: "status-reviewing"
            },

            shortlisted: {
                label: "Shortlisted",
                className: "status-shortlisted"
            },

            hired: {
                label: "Accepted",
                className: "status-accepted"
            },

            rejected: {
                label: "Rejected",
                className: "status-rejected"
            }

        };

        return map[status] || {
            label: "Submitted",
            className: "status-submitted"
        };
    }

    function formatJobTitle(value) {

        return String(value || "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
    }

    function formatDate(value) {

        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    try {

        const response = await fetch(
            "/api/job-applications/my",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token,
                    "Accept": "application/json"
                },

                cache: "no-store"
            }
        );

        const result = await response.json();

        if (response.status === 401 ||
            response.status === 403) {

            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");

            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("authUser");

            window.location.href =
                "login.html?returnAfterLogin=my-job-applications.html";

            return;
        }

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load job applications."
            );
        }

        const applications =
            Array.isArray(result)
                ? result
                : (
                    result.applications ||
                    result.data ||
                    []
                );

        loading.style.display = "none";

        if (!applications.length) {

            empty.style.display = "block";

            return;
        }

        tableBody.innerHTML = "";

        applications.forEach(function (application) {

            const status =
                getStatus(application.status);

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td class="job-id-cell">
                    #${escapeHTML(application.id)}
                </td>

                <td class="job-title-cell">
                    ${escapeHTML(
                        application.job_title ||
                        application.jobPosition ||
                        application.position ||
                        "-"
                    )}
                </td>

                <td>
                    <span class="job-status ${status.className}">
                        ${status.label}
                    </span>
                </td>

                <td>
                    ${formatDate(
                        application.created_at ||
                        application.applied_at ||
                        application.createdAt
                    )}
                </td>

                <td>
                    ${
                        application.id
                        ? `
                            <button
    type="button"
    class="view-resume-btn"
    data-resume-id="${escapeHTML(application.id)}">

    <i class="fa-solid fa-file-arrow-up"></i>
    View Resume

</button>
                        `
                        : "-"
                    }
                </td>
            `;

            tableBody.appendChild(row);

        });

        tableWrapper.style.display = "block";

    } catch (err) {

        console.error(
            "MY JOB APPLICATIONS ERROR:",
            err
        );

        loading.style.display = "none";

        errorBox.style.display = "block";

        errorText.textContent =
            err.message ||
            "Unable to load your job applications.";
    }

});/* =========================================================
   MY JOB APPLICATIONS - AUTHENTICATED RESUME VIEW
========================================================= */

document.addEventListener("click", async function (event) {

    const button =
        event.target.closest(".view-resume-btn");

    if (!button) {
        return;
    }

    event.preventDefault();

    const applicationId =
        button.getAttribute("data-resume-id");

    if (!applicationId) {
        return;
    }

    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (!token) {

        window.location.href =
            "login.html?returnAfterLogin=my-job-applications.html";

        return;
    }

    const originalHTML =
        button.innerHTML;

    button.classList.add("loading");

    button.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Opening...';

    try {

        const response = await fetch(
            `/api/job-applications/applications/${encodeURIComponent(applicationId)}/resume`,
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                },

                cache: "no-store"
            }
        );

        if (response.status === 401 ||
            response.status === 403) {

            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");

            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("authUser");

            window.location.href =
                "login.html?returnAfterLogin=my-job-applications.html";

            return;
        }

        if (!response.ok) {

            let message =
                "Unable to open resume.";

            try {

                const data =
                    await response.json();

                if (data.message) {
                    message = data.message;
                }

            } catch (_) {}

            throw new Error(message);
        }

        const blob =
            await response.blob();

        const blobUrl =
            URL.createObjectURL(blob);

        const newWindow =
            window.open(
                blobUrl,
                "_blank",
                "noopener,noreferrer"
            );

        if (!newWindow) {

            const downloadLink =
                document.createElement("a");

            downloadLink.href =
                blobUrl;

            downloadLink.download =
                "resume-" + applicationId;

            document.body.appendChild(
                downloadLink
            );

            downloadLink.click();

            downloadLink.remove();
        }

        setTimeout(function () {
            URL.revokeObjectURL(blobUrl);
        }, 60000);

    } catch (error) {

        console.error(
            "RESUME OPEN ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to open resume."
        );

    } finally {

        button.classList.remove("loading");

        button.innerHTML =
            originalHTML;
    }

});