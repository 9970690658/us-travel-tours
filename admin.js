// =========================================================
// U.S TRAVEL & TOURS
// ADMIN DASHBOARD
// =========================================================
const API_BASE_URL =
    "https://us-travel-tours.onrender.com";
document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (!token) {
        window.location.replace("/admin-login.html");
        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const welcomeName =
        document.getElementById("welcomeName");

    const adminAvatar =
        document.getElementById("adminAvatar");

    const currentDate =
        document.getElementById("currentDate");

    const adminYear =
        document.getElementById("adminYear");


    // =====================================================
    // DATE
    // =====================================================

    const today = new Date();

    if (currentDate) {
        currentDate.textContent =
            today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    if (adminYear) {
        adminYear.textContent =
            today.getFullYear();
    }


    // =====================================================
    // CLEAR AUTHENTICATION
    // =====================================================

    function clearAuthentication() {

        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authExpiresAt");

        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");
        sessionStorage.removeItem("authExpiresAt");
    }


    // =====================================================
    // VERIFY ADMIN
    // =====================================================

    async function verifyAdmin() {

        const response =
            await fetch(`${API_BASE_URL}/api/auth/admin-check`, {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${token}`,
                    "Accept":
                        "application/json"
                },
                cache: "no-store"
            });

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (
            !response.ok ||
            !result ||
            !result.success ||
            !result.user ||
            result.user.role !== "admin"
        ) {
            throw new Error(
                "Admin authentication failed."
            );
        }

        return result.user;
    }


    // =====================================================
    // API REQUEST
    // =====================================================

    async function apiRequest(
        url,
        options = {}
    ) {

        const headers = {
            ...(options.headers || {}),
            "Authorization":
                `Bearer ${token}`
        };

        if (
            options.body &&
            !headers["Content-Type"]
        ) {
            headers["Content-Type"] =
                "application/json";
        }

        const response =
    await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers,
                cache: "no-store"
            });

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            clearAuthentication();

            window.location.replace(
                "/admin-login.html"
            );

            throw new Error(
                "Authentication expired."
            );
        }

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "Request failed."
            );
        }

        return result;
    }


    // =====================================================
    // PROFILE
    // =====================================================

    function loadProfile(user) {

        const name =
            user?.name ||
            "Administrator";

        const email =
            user?.email ||
            "—";

        if (adminName) {
            adminName.textContent =
                name;
        }

        if (adminEmail) {
            adminEmail.textContent =
                email;
        }

        if (welcomeName) {
            welcomeName.textContent =
                name;
        }

        if (adminAvatar) {
            adminAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }
    }


    // =====================================================
    // HELPERS
    // =====================================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function formatDate(value) {

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


    function formatStatus(status) {

        const labels = {

            pending:
                "Pending",

            payment_pending:
                "Payment Pending",

            payment_submitted:
                "Submitted",

            under_review:
                "Under Review",

            approved:
                "Approved",

            rejected:
                "Rejected",

            completed:
                "Completed"
        };

        return (
            labels[
                String(status || "")
                    .toLowerCase()
            ] ||
            String(status || "Pending")
                .replaceAll("_", " ")
                .replace(
                    /\b\w/g,
                    letter => letter.toUpperCase()
                )
        );
    }


    function formatJobStatus(status) {

        const labels = {

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

        return (
            labels[
                String(status || "")
                    .toLowerCase()
            ] ||
            String(status || "Submitted")
                .replaceAll("_", " ")
                .replace(
                    /\b\w/g,
                    letter => letter.toUpperCase()
                )
        );
    }


    function formatMessageStatus(status) {

        const labels = {

            new:
                "New",

            read:
                "Read",

            replied:
                "Replied"
        };

        return (
            labels[
                String(status || "new")
                    .toLowerCase()
            ] ||
            String(status || "new")
                .replaceAll("_", " ")
                .replace(
                    /\b\w/g,
                    letter => letter.toUpperCase()
                )
        );
    }


    function getApplicationData(application) {

        return (
            application?.data ||
            application?.application_data ||
            application?.applicationData ||
            {}
        );
    }


    function valueOrDash(value) {

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return "—";
        }

        return String(value);
    }


    // =====================================================
    // APPLICATION REVIEW MODAL
    // =====================================================

    function ensureReviewModal() {

        let modal =
            document.getElementById(
                "applicationReviewModal"
            );

        if (modal) {
            return modal;
        }

        modal =
            document.createElement("div");

        modal.id =
            "applicationReviewModal";

        modal.className =
            "application-review-modal";

        modal.innerHTML = `

            <div
                class="application-review-overlay"
                data-close-review>
            </div>

            <div class="application-review-dialog">

                <div class="application-review-header">

                    <div>
                        <span>
                            APPLICATION REVIEW
                        </span>

                        <h2>
                            Application Details
                        </h2>
                    </div>

                    <button
                        type="button"
                        class="application-review-close"
                        data-close-review
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div
                    class="application-review-body"
                    id="applicationReviewBody"
                ></div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        modal.querySelectorAll(
            "[data-close-review]"
        ).forEach(button => {

            button.addEventListener(
                "click",
                closeReviewModal
            );

        });

        return modal;
    }


    function closeReviewModal() {

        const modal =
            document.getElementById(
                "applicationReviewModal"
            );

        if (modal) {
            modal.classList.remove(
                "show"
            );
        }

        document.body.style.overflow =
            "";
    }


    function addReviewRow(
        container,
        label,
        value
    ) {

        const item =
            document.createElement("div");

        item.className =
            "review-detail-item";

        item.innerHTML = `

            <span class="review-detail-label">
                ${escapeHtml(label)}
            </span>

            <strong class="review-detail-value">
                ${escapeHtml(
                    valueOrDash(value)
                )}
            </strong>
        `;

        container.appendChild(
            item
        );
    }


    function addReviewSection(
        container,
        title
    ) {

        const section =
            document.createElement("div");

        section.className =
            "review-detail-section";

        section.innerHTML = `

            <h3>
                ${escapeHtml(title)}
            </h3>

            <div class="review-detail-grid"></div>
        `;

        container.appendChild(
            section
        );

        return section.querySelector(
            ".review-detail-grid"
        );
    }


    function openApplicationReview(
        application
    ) {

        const modal =
            ensureReviewModal();

        const body =
            document.getElementById(
                "applicationReviewBody"
            );

        if (!body) {
            return;
        }

        body.innerHTML = "";

        const data =
            getApplicationData(
                application
            );

        const nameInfo =
            data.nameInformation ||
            {};

        const passportInfo =
            data.passportInformation ||
            {};

        const personalInfo =
            data.personalInformation ||
            {};

        const addressInfo =
            data.addressInformation ||
            {};

        const contactInfo =
            data.contactInformation ||
            {};

        const maritalInfo =
            data.maritalInformation ||
            {};

        const spouseInfo =
            data.spouseInformation ||
            {};

        const employmentInfo =
            data.employmentInformation ||
            {};

        const usInfo =
            data.usInformation ||
            {};

        const previousInfo =
            data.previousVisitInformation ||
            {};

        const consentInfo =
            data.consentInformation ||
            {};


        // APPLICATION SUMMARY

        const summary =
            document.createElement("div");

        summary.className =
            "review-application-summary";

        summary.innerHTML = `

            <div>
                <span>Application ID</span>

                <strong>
                    #${escapeHtml(application.id)}
                </strong>
            </div>

            <div>
                <span>Status</span>

                <strong>
                    ${escapeHtml(
                        formatStatus(
                            application.status
                        )
                    )}
                </strong>
            </div>

            <div>
                <span>Submitted</span>

                <strong>
                    ${escapeHtml(
                        formatDate(
                            application.createdAt ||
                            application.created_at ||
                            application.submitted_at
                        )
                    )}
                </strong>
            </div>
        `;

        body.appendChild(
            summary
        );


        // NAME

        let grid =
            addReviewSection(
                body,
                "Name Information"
            );

        addReviewRow(
            grid,
            "Surname",
            nameInfo.surname
        );

        addReviewRow(
            grid,
            "First / Middle Name",
            nameInfo.firstMiddleName
        );


        // PASSPORT

        grid =
            addReviewSection(
                body,
                "Passport Information"
            );

        addReviewRow(
            grid,
            "Passport Number",
            passportInfo.passportNumber
        );

        addReviewRow(
            grid,
            "Passport Country",
            passportInfo.passportCountry
        );

        addReviewRow(
            grid,
            "Passport Issue Date",
            passportInfo.passportIssueDate
        );

        addReviewRow(
            grid,
            "Passport Expiry Date",
            passportInfo.passportExpiryDate
        );


        // PERSONAL

        grid =
            addReviewSection(
                body,
                "Personal Information"
            );

        addReviewRow(
            grid,
            "Date of Birth",
            personalInfo.dateOfBirth
        );

        addReviewRow(
            grid,
            "Nationality",
            personalInfo.nationality
        );

        addReviewRow(
            grid,
            "Sex",
            personalInfo.sex
        );

        addReviewRow(
            grid,
            "National ID",
            personalInfo.nationalId
        );


        // ADDRESS

        grid =
            addReviewSection(
                body,
                "Address Information"
            );

        addReviewRow(
            grid,
            "Street Address",
            addressInfo.streetAddress
        );

        addReviewRow(
            grid,
            "City",
            addressInfo.city
        );

        addReviewRow(
            grid,
            "State / Province",
            addressInfo.stateProvince
        );

        addReviewRow(
            grid,
            "Postal Code",
            addressInfo.postalCode
        );

        addReviewRow(
            grid,
            "Country",
            addressInfo.country
        );


        // CONTACT

        grid =
            addReviewSection(
                body,
                "Contact Information"
            );

        addReviewRow(
            grid,
            "Email",
            contactInfo.email
        );

        addReviewRow(
            grid,
            "Phone",
            contactInfo.phone
        );


        // MARITAL

        grid =
            addReviewSection(
                body,
                "Marital Information"
            );

        addReviewRow(
            grid,
            "Marital Status",
            maritalInfo.maritalStatus
        );


        // SPOUSE

        grid =
            addReviewSection(
                body,
                "Spouse Information"
            );

        addReviewRow(
            grid,
            "Spouse Name",
            spouseInfo.name
        );

        addReviewRow(
            grid,
            "Spouse Date of Birth",
            spouseInfo.dateOfBirth
        );

        addReviewRow(
            grid,
            "Spouse Nationality",
            spouseInfo.nationality
        );


        // EMPLOYMENT

        grid =
            addReviewSection(
                body,
                "Employment Information"
            );

        addReviewRow(
            grid,
            "Employer",
            employmentInfo.employer
        );

        addReviewRow(
            grid,
            "Job Title",
            employmentInfo.jobTitle
        );

        addReviewRow(
            grid,
            "Employment Address",
            employmentInfo.address
        );


        // U.S. INFORMATION

        grid =
            addReviewSection(
                body,
                "U.S. Travel Information"
            );

        addReviewRow(
            grid,
            "Arrival Date",
            usInfo.arrivalDate
        );

        addReviewRow(
            grid,
            "Length of Stay",
            usInfo.lengthOfStay
        );

        addReviewRow(
            grid,
            "U.S. Address",
            usInfo.usAddress
        );

        addReviewRow(
            grid,
            "U.S. Contact",
            usInfo.usContact
        );


        // PREVIOUS VISIT

        grid =
            addReviewSection(
                body,
                "Previous U.S. Visit"
            );

        addReviewRow(
            grid,
            "Previously Visited",
            previousInfo.visited
        );

        addReviewRow(
            grid,
            "Previous Visit Date",
            previousInfo.date
        );

        addReviewRow(
            grid,
            "Previous Visa Status",
            previousInfo.visaStatus
        );


        // CONSENT

        grid =
            addReviewSection(
                body,
                "Consent"
            );

        addReviewRow(
            grid,
            "Application Consent",
            consentInfo.consent
        );


        // FALLBACK

        if (
            Object.keys(data).length === 0
        ) {

            const fallback =
                document.createElement("div");

            fallback.className =
                "review-raw-data";

            fallback.innerHTML = `

                <h3>
                    Application Data
                </h3>

                <pre>${escapeHtml(
                    JSON.stringify(
                        application,
                        null,
                        2
                    )
                )}</pre>
            `;

            body.appendChild(
                fallback
            );
        }

        modal.classList.add(
            "show"
        );

        document.body.style.overflow =
            "hidden";
    }


    // =====================================================
    // APPLICATION STATUS UPDATE
    // =====================================================

    async function updateApplicationStatus(
        applicationId,
        newStatus,
        button
    ) {

        const confirmed =
            window.confirm(
                `Change application #${applicationId} status to ${formatStatus(newStatus)}?`
            );

        if (!confirmed) {
            return;
        }

        const row =
            button?.closest("tr");

        const buttons =
            row
                ? row.querySelectorAll("button")
                : [];

        buttons.forEach(
            item => {
                item.disabled = true;
            }
        );

        const originalText =
            button?.textContent ||
            "";

        if (button) {
            button.textContent =
                "Saving...";
        }

        try {

            const result =
                await apiRequest(
                    `/api/applications/${encodeURIComponent(applicationId)}/status`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify({
                                status:
                                    newStatus
                            })
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to update application."
                );
            }

            await loadApplications();

        } catch (error) {

            console.error(
                "Application status error:",
                error
            );

            alert(
                error.message ||
                "Unable to update application."
            );

            buttons.forEach(
                item => {
                    item.disabled =
                        false;
                }
            );

            if (button) {
                button.textContent =
                    originalText;
            }
        }
    }


    // =====================================================
    // DELETE CUSTOMER APPLICATION
    // =====================================================

    async function deleteApplication(
        applicationId,
        button
    ) {

        const confirmed =
            window.confirm(
                `Delete application #${applicationId} permanently?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        const originalText =
            button?.textContent ||
            "Delete";

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Deleting...";
        }

        try {

            const result =
                await apiRequest(
                    `/api/applications/${encodeURIComponent(applicationId)}`,
                    {
                        method:
                            "DELETE"
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to delete application."
                );
            }

            await loadApplications();

            alert(
                "Application deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete application error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete application."
            );

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    originalText;
            }
        }
    }


    // =====================================================
    // APPLICATION STATUS BUTTON
    // =====================================================

    function createApplicationStatusButton(
        application,
        status,
        label
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "application-status-btn";

        button.dataset.status =
            status;

        button.textContent =
            label;

        if (
            String(application.status || "")
                .toLowerCase() ===
            status
        ) {

            button.classList.add(
                "active"
            );
        }

        button.addEventListener(
            "click",
            async function () {

                if (
                    String(application.status || "")
                        .toLowerCase() ===
                    status
                ) {
                    return;
                }

                await updateApplicationStatus(
                    application.id,
                    status,
                    button
                );
            }
        );

        return button;
    }


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    async function loadApplications() {

        const loading =
            document.getElementById(
                "applicationsLoading"
            );

        const wrapper =
            document.getElementById(
                "applicationsTableWrapper"
            );

        const empty =
            document.getElementById(
                "applicationsEmpty"
            );

        const body =
            document.getElementById(
                "applicationsTableBody"
            );

        const count =
            document.getElementById(
                "applicationCount"
            );

        const total =
            document.getElementById(
                "totalApplications"
            );

        const underReview =
            document.getElementById(
                "underReview"
            );

        const approved =
            document.getElementById(
                "approvedApplications"
            );

        try {

            if (loading) {
                loading.style.display =
                    "block";

                loading.textContent =
                    "Loading applications...";
            }

            const result =
                await apiRequest(
                    "/api/applications"
                );

            const applications =
                Array.isArray(result)
                    ? result
                    : Array.isArray(
                        result?.applications
                    )
                        ? result.applications
                        : [];

            if (count) {
                count.textContent =
                    applications.length;
            }

            if (total) {
                total.textContent =
                    applications.length;
            }

            const reviewCount =
                applications.filter(
                    application =>
                        String(
                            application.status ||
                            ""
                        ).toLowerCase() ===
                        "under_review"
                ).length;

            const approvedCount =
                applications.filter(
                    application =>
                        String(
                            application.status ||
                            ""
                        ).toLowerCase() ===
                        "approved"
                ).length;

            if (underReview) {
                underReview.textContent =
                    reviewCount;
            }

            if (approved) {
                approved.textContent =
                    approvedCount;
            }

            if (!applications.length) {

                if (loading) {
                    loading.style.display =
                        "none";
                }

                if (wrapper) {
                    wrapper.style.display =
                        "none";
                }

                if (empty) {
                    empty.style.display =
                        "block";
                }

                return;
            }

            if (loading) {
                loading.style.display =
                    "none";
            }

            if (empty) {
                empty.style.display =
                    "none";
            }

            if (wrapper) {
                wrapper.style.display =
                    "block";
            }

            if (!body) {
                return;
            }

            body.innerHTML = "";

            applications
                .slice(0, 50)
                .forEach(
                    application => {

                        const data =
                            getApplicationData(
                                application
                            );

                        const passport =
                            data?.passportInformation
                                ?.passportNumber ||
                            application.passport_number ||
                            "—";

                        const surname =
                            data?.nameInformation
                                ?.surname ||
                            "";

                        const firstMiddleName =
                            data?.nameInformation
                                ?.firstMiddleName ||
                            "";

                        const name =
                            (
                                surname ||
                                firstMiddleName
                            )
                                ? `${surname}, ${firstMiddleName}`
                                    .replace(
                                        /^,\s*/,
                                        ""
                                    )
                                    .trim()
                                : (
                                    application.name ||
                                    "Applicant"
                                );

                        const nationality =
                            data?.personalInformation
                                ?.nationality ||
                            application.nationality ||
                            "—";

                        const row =
                            document.createElement(
                                "tr"
                            );


                        const idCell =
                            document.createElement(
                                "td"
                            );

                        idCell.textContent =
                            `#${application.id ?? "—"}`;


                        const applicantCell =
                            document.createElement(
                                "td"
                            );

                        applicantCell.innerHTML = `

                            <div class="admin-applicant-cell">

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        data?.contactInformation?.email ||
                                        application.email ||
                                        "No email"
                                    )}
                                </small>

                            </div>
                        `;


                        const passportCell =
                            document.createElement(
                                "td"
                            );

                        passportCell.textContent =
                            passport;


                        const nationalityCell =
                            document.createElement(
                                "td"
                            );

                        nationalityCell.textContent =
                            nationality;


                        const statusCell =
                            document.createElement(
                                "td"
                            );

                        statusCell.innerHTML = `

                            <span class="status-badge">
                                ${escapeHtml(
                                    formatStatus(
                                        application.status
                                    )
                                )}
                            </span>
                        `;


                        const dateCell =
                            document.createElement(
                                "td"
                            );

                        dateCell.textContent =
                            formatDate(
                                application.createdAt ||
                                application.created_at ||
                                application.submitted_at
                            );


                        const actionCell =
                            document.createElement(
                                "td"
                            );

                        actionCell.className =
                            "application-actions-cell";


                        const actionWrapper =
                            document.createElement(
                                "div"
                            );

                        actionWrapper.className =
                            "application-action-wrapper";


                        const reviewButton =
                            document.createElement(
                                "button"
                            );

                        reviewButton.type =
                            "button";

                        reviewButton.className =
                            "application-review-btn";

                        reviewButton.textContent =
                            "Review";

                        reviewButton.addEventListener(
                            "click",
                            function () {

                                openApplicationReview(
                                    application
                                );
                            }
                        );


                        const reviewStatusButton =
                            createApplicationStatusButton(
                                application,
                                "under_review",
                                "Under Review"
                            );


                        const approveButton =
                            createApplicationStatusButton(
                                application,
                                "approved",
                                "Approve"
                            );


                        const rejectButton =
                            createApplicationStatusButton(
                                application,
                                "rejected",
                                "Reject"
                            );


                        const deleteButton =
                            document.createElement(
                                "button"
                            );

                        deleteButton.type =
                            "button";

                        deleteButton.className =
                            "application-delete-btn";

                        deleteButton.textContent =
                            "Delete";

                        deleteButton.addEventListener(
                            "click",
                            async function () {

                                await deleteApplication(
                                    application.id,
                                    this
                                );
                            }
                        );


                        actionWrapper.appendChild(
                            reviewButton
                        );

                        actionWrapper.appendChild(
                            reviewStatusButton
                        );

                        actionWrapper.appendChild(
                            approveButton
                        );

                        actionWrapper.appendChild(
                            rejectButton
                        );

                        actionWrapper.appendChild(
                            deleteButton
                        );

                        actionCell.appendChild(
                            actionWrapper
                        );


                        row.appendChild(
                            idCell
                        );

                        row.appendChild(
                            applicantCell
                        );

                        row.appendChild(
                            passportCell
                        );

                        row.appendChild(
                            nationalityCell
                        );

                        row.appendChild(
                            statusCell
                        );

                        row.appendChild(
                            dateCell
                        );

                        row.appendChild(
                            actionCell
                        );

                        body.appendChild(
                            row
                        );
                    }
                );

        } catch (error) {

            console.error(
                "Applications error:",
                error
            );

            if (loading) {
                loading.style.display =
                    "block";

                loading.textContent =
                    error.message ||
                    "Unable to load applications.";
            }
        }
    }


    // =====================================================
    // PAYMENTS
    // =====================================================

    async function updatePaymentStatus(
        paymentId,
        status,
        button
    ) {

        const action =
            status === "verified"
                ? "verify"
                : "reject";

        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} payment #${paymentId}?`
            );

        if (!confirmed) {
            return;
        }

        const row =
            button?.closest("tr");

        const buttons =
            row
                ? row.querySelectorAll("button")
                : [];

        buttons.forEach(
            item => {
                item.disabled = true;
            }
        );

        try {

            const result =
                await apiRequest(
                    `/api/payments/${encodeURIComponent(paymentId)}/status`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify({
                                status:
                                    status
                            })
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to update payment."
                );
            }

            await loadPayments();
            await loadApplications();

            alert(
                status === "verified"
                    ? "Payment verified successfully.\n\nApplication is now Under Review."
                    : "Payment rejected successfully.\n\nApplication is now Payment Pending."
            );

        } catch (error) {

            console.error(
                "Payment status error:",
                error
            );

            alert(
                error.message ||
                "Unable to update payment."
            );

            buttons.forEach(
                item => {
                    item.disabled =
                        false;
                }
            );
        }
    }


    async function loadPayments() {

        const loading =
            document.getElementById(
                "paymentsLoading"
            );

        const wrapper =
            document.getElementById(
                "paymentsTableWrapper"
            );

        const empty =
            document.getElementById(
                "paymentsEmpty"
            );

        const body =
            document.getElementById(
                "paymentsTableBody"
            );

        const count =
            document.getElementById(
                "paymentCount"
            );

        const pending =
            document.getElementById(
                "pendingPayments"
            );

        try {

            const result =
                await apiRequest(
                    "/api/payments"
                );

            const payments =
                Array.isArray(result)
                    ? result
                    : Array.isArray(
                        result?.payments
                    )
                        ? result.payments
                        : [];

            const pendingPayments =
                payments.filter(
                    payment =>
                        String(
                            payment.status ||
                            ""
                        ).toLowerCase() ===
                        "pending"
                );

            if (count) {
                count.textContent =
                    payments.length;
            }

            if (pending) {
                pending.textContent =
                    pendingPayments.length;
            }

            if (!payments.length) {

                if (loading) {
                    loading.style.display =
                        "none";
                }

                if (wrapper) {
                    wrapper.style.display =
                        "none";
                }

                if (empty) {
                    empty.style.display =
                        "block";
                }

                return;
            }

            if (loading) {
                loading.style.display =
                    "none";
            }

            if (empty) {
                empty.style.display =
                    "none";
            }

            if (wrapper) {
                wrapper.style.display =
                    "block";
            }

            if (!body) {
                return;
            }

            body.innerHTML = "";

            payments
                .slice(0, 50)
                .forEach(
                    payment => {

                        const row =
                            document.createElement(
                                "tr"
                            );

                        const paymentId =
                            payment.id ?? "—";

                        const applicationId =
                            payment.application_id ??
                            payment.applicationId ??
                            "—";

                        const method =
                            payment.payment_method ||
                            payment.method ||
                            "—";

                        const reference =
                            payment.payment_reference ||
                            payment.reference ||
                            "—";

                        const status =
                            String(
                                payment.status ||
                                "pending"
                            ).toLowerCase();

                        const date =
                            payment.created_at ||
                            payment.createdAt;

                        row.innerHTML = `

                            <td>
                                #${escapeHtml(paymentId)}
                            </td>

                            <td>
                                #${escapeHtml(applicationId)}
                            </td>

                            <td>
                                ${escapeHtml(method)}
                            </td>

                            <td>
                                ${escapeHtml(reference)}
                            </td>

                            <td>
                                <span class="status-badge">
                                    ${escapeHtml(
                                        formatStatus(status)
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatDate(date)
                                )}
                            </td>

                            <td class="payment-actions-cell">

                                ${
                                    status === "pending"
                                        ? `
                                            <div class="payment-action-buttons">

                                                <button
                                                    type="button"
                                                    class="payment-action-btn verify-payment"
                                                    data-payment-action="verify"
                                                >
                                                    Verify
                                                </button>

                                                <button
                                                    type="button"
                                                    class="payment-action-btn reject-payment"
                                                    data-payment-action="reject"
                                                >
                                                    Reject
                                                </button>

                                            </div>
                                        `
                                        : `
                                            <span class="payment-action-done">
                                                ${escapeHtml(
                                                    formatStatus(status)
                                                )}
                                            </span>
                                        `
                                }

                            </td>
                        `;

                        body.appendChild(
                            row
                        );

                        const verifyButton =
                            row.querySelector(
                                "[data-payment-action='verify']"
                            );

                        verifyButton?.addEventListener(
                            "click",
                            async function () {

                                await updatePaymentStatus(
                                    paymentId,
                                    "verified",
                                    this
                                );
                            }
                        );

                        const rejectButton =
                            row.querySelector(
                                "[data-payment-action='reject']"
                            );

                        rejectButton?.addEventListener(
                            "click",
                            async function () {

                                await updatePaymentStatus(
                                    paymentId,
                                    "rejected",
                                    this
                                );
                            }
                        );
                    }
                );

        } catch (error) {

            console.error(
                "Payments error:",
                error
            );

            if (loading) {
                loading.textContent =
                    error.message ||
                    "Unable to load payments.";
            }
        }
    }


    // =====================================================
    // CONTACT MESSAGE STATUS
    // =====================================================

    async function updateContactMessageStatus(
        messageId,
        newStatus,
        button
    ) {

        const label =
            formatMessageStatus(
                newStatus
            );

        const confirmed =
            window.confirm(
                `Change contact message #${messageId} status to ${label}?`
            );

        if (!confirmed) {
            return;
        }

        const row =
            button?.closest("tr");

        const buttons =
            row
                ? row.querySelectorAll("button")
                : [];

        buttons.forEach(
            item => {
                item.disabled = true;
            }
        );

        try {

            const result =
                await apiRequest(
                    `/api/contact/messages/${encodeURIComponent(messageId)}/status`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify({
                                status:
                                    newStatus
                            })
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to update contact message."
                );
            }

            await loadContactMessages();

        } catch (error) {

            console.error(
                "Contact message status error:",
                error
            );

            alert(
                error.message ||
                "Unable to update contact message."
            );

            buttons.forEach(
                item => {
                    item.disabled =
                        false;
                }
            );
        }
    }


    // =====================================================
    // DELETE CONTACT MESSAGE
    // =====================================================

    async function deleteContactMessage(
        messageId,
        button
    ) {

        const confirmed =
            window.confirm(
                `Delete contact message #${messageId} permanently?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        const originalText =
            button?.textContent ||
            "Delete";

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Deleting...";
        }

        try {

            const result =
                await apiRequest(
                    `/api/contact/messages/${encodeURIComponent(messageId)}`,
                    {
                        method:
                            "DELETE"
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to delete contact message."
                );
            }

            await loadContactMessages();

        } catch (error) {

            console.error(
                "Delete contact message error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete contact message."
            );

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    originalText;
            }
        }
    }
// =====================================================
// SEND CONTACT REPLY
// =====================================================

async function sendContactReply(
    messageId,
    replyText,
    button,
    modal
) {

    const reply =
        String(replyText || "").trim();

    if (!reply) {

        alert(
            "Please enter a reply message."
        );

        return;
    }

    const originalText =
        button?.textContent ||
        "Send Reply";

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Sending...";
    }

    try {

        const result =
            await apiRequest(
                `/api/contact/messages/${encodeURIComponent(messageId)}/reply`,
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            reply: reply
                        })
                }
            );

        if (
            !result ||
            result.success !== true
        ) {
            throw new Error(
                result?.message ||
                "Unable to send reply."
            );
        }

        alert(
            "Reply sent successfully to the customer."
        );

        if (modal) {
            modal.remove();
            document.body.style.overflow = "";
        }

        await loadContactMessages();

    } catch (error) {

        console.error(
            "Contact reply error:",
            error
        );

        alert(
            error.message ||
            "Unable to send reply."
        );

        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalText;
        }
    }
}

    // =====================================================
    // OPEN CONTACT MESSAGE
    // =====================================================

    async function openContactMessage(
        message
    ) {

        let fullMessage =
            message;

        try {

            const result =
                await apiRequest(
                    `/api/contact/messages/${encodeURIComponent(message.id)}`
                );

            if (
                result?.success &&
                result?.message
            ) {
                fullMessage =
                    result.message;
            }

        } catch (error) {

            console.error(
                "Contact message details error:",
                error
            );
        }


        const modal =
            document.createElement("div");

        modal.className =
            "contact-message-modal";

        modal.innerHTML = `

            <div class="contact-message-overlay"></div>

            <div class="contact-message-dialog">

                <div class="contact-message-header">

                    <div>
                        <span>
                            CUSTOMER MESSAGE
                        </span>

                        <h2>
                            ${escapeHtml(
                                fullMessage.subject ||
                                "Contact Message"
                            )}
                        </h2>
                    </div>

                    <button
                        type="button"
                        class="contact-message-close"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div class="contact-message-body">

                    <div class="contact-message-meta">

                        <div>
                            <span>Name</span>
                            <strong>
                                ${escapeHtml(
                                    fullMessage.name ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Email</span>
                            <strong>
                                ${escapeHtml(
                                    fullMessage.email ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Phone</span>
                            <strong>
                                ${escapeHtml(
                                    fullMessage.phone ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Service</span>
                            <strong>
                                ${escapeHtml(
                                    fullMessage.service ||
                                    "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>
                                ${escapeHtml(
                                    formatMessageStatus(
                                        fullMessage.status
                                    )
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Date</span>
                            <strong>
                                ${escapeHtml(
                                    formatDate(
                                        fullMessage.created_at ||
                                        fullMessage.createdAt
                                    )
                                )}
                            </strong>
                        </div>

                    </div>

                    <div class="contact-message-content">

                        <span>Message</span>

                        <p>
                            ${escapeHtml(
                                fullMessage.message ||
                                "No message."
                            ).replace(
                                /\n/g,
                                "<br>"
                            )}
                        </p>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        // -------------------------------------------------
// REPLY BOX
// -------------------------------------------------

const replySection =
    document.createElement("div");

replySection.className =
    "contact-message-reply";

replySection.innerHTML = `

    <div class="contact-message-reply-title">
        Reply to Customer
    </div>

    <textarea
        class="contact-message-reply-input"
        placeholder="Write your reply to the customer..."
        maxlength="5000"
        rows="6"
    ></textarea>

    <div class="contact-message-reply-footer">

        <span class="contact-message-reply-hint">
            Reply will be sent directly to
            ${escapeHtml(fullMessage.email || "customer email")}
        </span>

        <button
            type="button"
            class="contact-message-reply-btn"
        >
            Send Reply
        </button>

    </div>
`;

const messageBody =
    modal.querySelector(
        ".contact-message-body"
    );

if (messageBody) {

    messageBody.appendChild(
        replySection
    );
}

const replyInput =
    replySection.querySelector(
        ".contact-message-reply-input"
    );

const replyButton =
    replySection.querySelector(
        ".contact-message-reply-btn"
    );

replyButton?.addEventListener(
    "click",
    async function () {

        await sendContactReply(
            fullMessage.id,
            replyInput?.value || "",
            this,
            modal
        );

    }
);

        const closeModal =
            () => {

                modal.remove();

                document.body.style.overflow =
                    "";
            };

        modal.querySelector(
            ".contact-message-close"
        )?.addEventListener(
            "click",
            closeModal
        );

        modal.querySelector(
            ".contact-message-overlay"
        )?.addEventListener(
            "click",
            closeModal
        );

        document.body.style.overflow =
            "hidden";


        // Automatically mark NEW as READ

        if (
            String(
                fullMessage.status || ""
            ).toLowerCase() ===
            "new"
        ) {

            try {

                await apiRequest(
                    `/api/contact/messages/${encodeURIComponent(fullMessage.id)}/status`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify({
                                status:
                                    "read"
                            })
                    }
                );

                await loadContactMessages();

            } catch (error) {

                console.error(
                    "Mark message read error:",
                    error
                );
            }
        }
    }


    // =====================================================
    // LOAD CONTACT MESSAGES
    // =====================================================

    async function loadContactMessages() {

        const loading =
            document.getElementById(
                "messagesLoading"
            );

        const wrapper =
            document.getElementById(
                "messagesTableWrapper"
            );

        const empty =
            document.getElementById(
                "messagesEmpty"
            );

        const body =
            document.getElementById(
                "messagesTableBody"
            );

        try {

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    "Loading contact messages...";
            }

            const result =
                await apiRequest(
                    "/api/contact/messages"
                );

            const messages =
                Array.isArray(result)
                    ? result
                    : Array.isArray(
                        result?.messages
                    )
                        ? result.messages
                        : [];

            if (!messages.length) {

                if (loading) {
                    loading.style.display =
                        "none";
                }

                if (wrapper) {
                    wrapper.style.display =
                        "none";
                }

                if (empty) {
                    empty.style.display =
                        "block";
                }

                return;
            }

            if (loading) {
                loading.style.display =
                    "none";
            }

            if (empty) {
                empty.style.display =
                    "none";
            }

            if (wrapper) {
                wrapper.style.display =
                    "block";
            }

            if (!body) {
                return;
            }

            body.innerHTML = "";

            messages
                .slice(0, 100)
                .forEach(
                    message => {

                        const row =
                            document.createElement(
                                "tr"
                            );

                        const messageId =
                            message.id ??
                            "—";

                        const status =
                            String(
                                message.status ||
                                "new"
                            ).toLowerCase();

                        row.innerHTML = `

                            <td>
                                #${escapeHtml(
                                    messageId
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        message.name ||
                                        "—"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(
                                    message.email ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    message.phone ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    message.service ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    message.subject ||
                                    "—"
                                )}
                            </td>

                            <td>
                                <span class="status-badge">
                                    ${escapeHtml(
                                        formatMessageStatus(
                                            status
                                        )
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatDate(
                                        message.created_at ||
                                        message.createdAt
                                    )
                                )}
                            </td>

                            <td class="message-actions-cell">

                                <div class="message-action-buttons">

                                    <button
                                        type="button"
                                        class="message-view-btn"
                                        data-message-view
                                    >
                                        View
                                    </button>

                                    ${
                                        status !== "read"
                                            ? `
                                                <button
                                                    type="button"
                                                    class="message-status-btn"
                                                    data-message-status="read"
                                                >
                                                    Read
                                                </button>
                                            `
                                            : ""
                                    }

                                    ${
                                        status !== "replied"
                                            ? `
                                                <button
                                                    type="button"
                                                    class="message-status-btn"
                                                    data-message-status="replied"
                                                >
                                                    Replied
                                                </button>
                                            `
                                            : ""
                                    }

                                    <button
                                        type="button"
                                        class="message-delete-btn"
                                        data-message-delete
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>
                        `;

                        body.appendChild(
                            row
                        );


                        // VIEW

                        row.querySelector(
                            "[data-message-view]"
                        )?.addEventListener(
                            "click",
                            async function () {

                                await openContactMessage(
                                    message
                                );
                            }
                        );


                        // STATUS

                        row.querySelectorAll(
                            "[data-message-status]"
                        ).forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async function () {

                                        await updateContactMessageStatus(
                                            messageId,
                                            this.dataset.messageStatus,
                                            this
                                        );
                                    }
                                );
                            }
                        );


                        // DELETE

                        row.querySelector(
                            "[data-message-delete]"
                        )?.addEventListener(
                            "click",
                            async function () {

                                await deleteContactMessage(
                                    messageId,
                                    this
                                );
                            }
                        );

                    }
                );

        } catch (error) {

            console.error(
                "Contact messages error:",
                error
            );

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    error.message ||
                    "Unable to load contact messages.";
            }
        }
    }


    // =====================================================
    // JOB APPLICATION STATUS
    // =====================================================

    async function updateJobApplicationStatus(
        applicationId,
        newStatus,
        button
    ) {

        const label =
            formatJobStatus(
                newStatus
            );

        const confirmed =
            window.confirm(
                `Change job application #${applicationId} status to ${label}?`
            );

        if (!confirmed) {
            return;
        }

        const row =
            button?.closest("tr");

        const buttons =
            row
                ? row.querySelectorAll(
                    ".job-status-btn"
                )
                : [];

        buttons.forEach(
            item => {
                item.disabled =
                    true;
            }
        );

        try {

            const result =
                await apiRequest(
                    `/api/jobs/applications/${encodeURIComponent(applicationId)}/status`,
                    {
                        method: "PATCH",
                        body:
                            JSON.stringify({
                                status:
                                    newStatus
                            })
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to update job application."
                );
            }

            await loadJobApplications();

            alert(
                `Job application #${applicationId} is now ${label}.`
            );

        } catch (error) {

            console.error(
                "Job application status error:",
                error
            );

            alert(
                error.message ||
                "Unable to update job application."
            );

            buttons.forEach(
                item => {
                    item.disabled =
                        false;
                }
            );
        }
    }


    // =====================================================
    // OPEN JOB RESUME
    // =====================================================

    async function openJobResume(
        applicationId,
        button
    ) {

        if (!applicationId) {
            return;
        }

        const originalText =
            button?.textContent ||
            "Resume";

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Loading...";
        }

        try {

            const response =
    await fetch(
        `${API_BASE_URL}/api/jobs/applications/${encodeURIComponent(applicationId)}/resume`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        },
                        cache: "no-store"
                    }
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearAuthentication();

                window.location.replace(
                    "/admin-login.html"
                );

                return;
            }

            if (!response.ok) {

                let message =
                    "Unable to open resume.";

                try {

                    const result =
                        await response.json();

                    message =
                        result?.message ||
                        message;

                } catch {}

                throw new Error(
                    message
                );
            }

            const blob =
                await response.blob();

            if (
                !blob ||
                blob.size === 0
            ) {
                throw new Error(
                    "Resume file is empty or unavailable."
                );
            }

            const blobUrl =
                URL.createObjectURL(
                    blob
                );

            const opened =
                window.open(
                    blobUrl,
                    "_blank",
                    "noopener,noreferrer"
                );

            if (!opened) {

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    blobUrl;

                link.download =
                    `job-application-${applicationId}-resume`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();
            }

            setTimeout(
                () => {
                    URL.revokeObjectURL(
                        blobUrl
                    );
                },
                60000
            );

        } catch (error) {

            console.error(
                "Resume error:",
                error
            );

            alert(
                error.message ||
                "Unable to open resume."
            );

        } finally {

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    originalText;
            }
        }
    }


    // =====================================================
    // DELETE JOB APPLICATION
    // =====================================================

    async function deleteJobApplication(
        applicationId,
        button
    ) {

        const confirmed =
            window.confirm(
                `Delete job application #${applicationId} permanently?\n\nThe uploaded resume will also be deleted.`
            );

        if (!confirmed) {
            return;
        }

        const originalText =
            button?.textContent ||
            "Delete";

        try {

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Deleting...";
            }

            const result =
                await apiRequest(
                    `/api/jobs/applications/${encodeURIComponent(applicationId)}`,
                    {
                        method:
                            "DELETE"
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Unable to delete job application."
                );
            }

            await loadJobApplications();

            alert(
                "Job application deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete job application error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete job application."
            );

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    originalText;
            }
        }
    }


    // =====================================================
    // LOAD JOB APPLICATIONS
    // =====================================================

    async function loadJobApplications() {

        const loading =
            document.getElementById(
                "jobsLoading"
            );

        const wrapper =
            document.getElementById(
                "jobsTableWrapper"
            );

        const empty =
            document.getElementById(
                "jobsEmpty"
            );

        const body =
            document.getElementById(
                "jobsTableBody"
            );

        const count =
            document.getElementById(
                "jobApplicationCount"
            );

        try {

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    "Loading job applications...";
            }

            const result =
                await apiRequest(
                    "/api/jobs/applications"
                );

            const applications =
                Array.isArray(
                    result?.applications
                )
                    ? result.applications
                    : [];

            if (count) {
                count.textContent =
                    applications.length;
            }

            if (!applications.length) {

                if (loading) {
                    loading.style.display =
                        "none";
                }

                if (wrapper) {
                    wrapper.style.display =
                        "none";
                }

                if (empty) {
                    empty.style.display =
                        "block";
                }

                return;
            }

            if (loading) {
                loading.style.display =
                    "none";
            }

            if (empty) {
                empty.style.display =
                    "none";
            }

            if (wrapper) {
                wrapper.style.display =
                    "block";
            }

            if (!body) {
                return;
            }

            body.innerHTML = "";

            applications
                .slice(0, 50)
                .forEach(
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


                        // RESUME

                        const resumeHTML =
                            application.resume_file
                                ? `
                                    <button
                                        type="button"
                                        class="job-resume-btn"
                                        data-resume-id="${escapeHtml(application.id)}"
                                    >
                                        Resume
                                    </button>
                                `
                                : "—";


                        // STATUS BUTTONS

                        const statusButtons = [

                            {
                                value:
                                    "new",
                                label:
                                    "Submitted"
                            },

                            {
                                value:
                                    "reviewing",
                                label:
                                    "Under Review"
                            },

                            {
                                value:
                                    "shortlisted",
                                label:
                                    "Shortlisted"
                            },

                            {
                                value:
                                    "hired",
                                label:
                                    "Accepted"
                            },

                            {
                                value:
                                    "rejected",
                                label:
                                    "Rejected"
                            }
                        ];


                        row.innerHTML = `

                            <td>
                                #${escapeHtml(
                                    application.id
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        application.name ||
                                        "Applicant"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(
                                    application.job_title ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    application.email ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    application.phone ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${resumeHTML}
                            </td>

                            <td>
                                <span class="status-badge">
                                    ${escapeHtml(
                                        formatJobStatus(
                                            status
                                        )
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatDate(
                                        application.created_at
                                    )
                                )}
                            </td>

                            <td class="job-actions-cell">

                                <div class="job-status-controls">

                                    ${statusButtons
                                        .map(
                                            item => `

                                                <button
                                                    type="button"
                                                    class="job-status-btn ${
                                                        status ===
                                                        item.value
                                                            ? "active"
                                                            : ""
                                                    }"
                                                    data-job-id="${escapeHtml(application.id)}"
                                                    data-job-status="${item.value}"
                                                >
                                                    ${item.label}
                                                </button>
                                            `
                                        )
                                        .join("")}

                                    <button
                                        type="button"
                                        class="job-delete-btn"
                                        data-job-delete-id="${escapeHtml(application.id)}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>
                        `;

                        body.appendChild(
                            row
                        );


                        // RESUME

                        const resumeButton =
                            row.querySelector(
                                "[data-resume-id]"
                            );

                        resumeButton?.addEventListener(
                            "click",
                            async function () {

                                await openJobResume(
                                    this.dataset.resumeId,
                                    this
                                );
                            }
                        );


                        // STATUS

                        row.querySelectorAll(
                            ".job-status-btn"
                        ).forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async function () {

                                        const jobId =
                                            this.dataset.jobId;

                                        const newStatus =
                                            this.dataset.jobStatus;

                                        if (
                                            status ===
                                            newStatus
                                        ) {
                                            return;
                                        }

                                        await updateJobApplicationStatus(
                                            jobId,
                                            newStatus,
                                            this
                                        );
                                    }
                                );
                            }
                        );


                        // DELETE

                        const deleteButton =
                            row.querySelector(
                                "[data-job-delete-id]"
                            );

                        deleteButton?.addEventListener(
                            "click",
                            async function () {

                                await deleteJobApplication(
                                    this.dataset.jobDeleteId,
                                    this
                                );
                            }
                        );
                    }
                );

        } catch (error) {

            console.error(
                "Job applications error:",
                error
            );

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    error.message ||
                    "Unable to load job applications.";
            }
        }
    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    const navItems =
        document.querySelectorAll(
            ".admin-nav-item[data-section]"
        );

    const quickActions =
        document.querySelectorAll(
            ".quick-action[data-section]"
        );

    function openSection(section) {

        const target =
            document.getElementById(
                section
            );

        if (target) {

            target.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });
        }

        navItems.forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    section
                );
            }
        );
    }


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openSection(
                        this.dataset.section
                    );
                }
            );
        }
    );


    quickActions.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    openSection(
                        this.dataset.section
                    );
                }
            );
        }
    );


    // =====================================================
    // MOBILE SIDEBAR
    // =====================================================

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const overlay =
        document.getElementById(
            "adminOverlay"
        );

    const mobileMenu =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebarClose =
        document.getElementById(
            "sidebarClose"
        );


    function openSidebar() {

        sidebar?.classList.add(
            "open"
        );

        overlay?.classList.add(
            "active"
        );
    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "open"
        );

        overlay?.classList.remove(
            "active"
        );
    }


    mobileMenu?.addEventListener(
        "click",
        openSidebar
    );

    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );

    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    // =====================================================
    // LOGOUT
    // =====================================================

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );

    logoutButton?.addEventListener(
        "click",
        async function () {

            try {

                await fetch(
    `${API_BASE_URL}/api/auth/logout`,
                    {
                        method:
                            "POST",
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            } finally {

                clearAuthentication();

                window.location.replace(
                    "/admin-login.html"
                );
            }
        }
    );


    // =====================================================
    // REFRESH BUTTONS
    // =====================================================

    document
        .getElementById(
            "refreshApplications"
        )
        ?.addEventListener(
            "click",
            loadApplications
        );

    document
        .getElementById(
            "refreshPayments"
        )
        ?.addEventListener(
            "click",
            loadPayments
        );

    document
        .getElementById(
            "refreshJobs"
        )
        ?.addEventListener(
            "click",
            loadJobApplications
        );

    document
        .getElementById(
            "refreshMessages"
        )
        ?.addEventListener(
            "click",
            loadContactMessages
        );


    // =====================================================
    // MODAL CSS
    // =====================================================

    function injectReviewStyles() {

        if (
            document.getElementById(
                "adminReviewStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "adminReviewStyles";

        style.textContent = `

            .application-review-modal {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }

            .application-review-modal.show {
                display: flex;
            }

            .application-review-overlay {
                position: absolute;
                inset: 0;
                background: rgba(10, 18, 32, 0.72);
                backdrop-filter: blur(4px);
            }

            .application-review-dialog {
                position: relative;
                z-index: 2;
                width: min(1000px, 100%);
                max-height: 90vh;
                background: #fff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 25px 80px rgba(0,0,0,0.25);
                display: flex;
                flex-direction: column;
            }

            .application-review-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 24px 28px;
                border-bottom: 1px solid #e8e8e8;
                background: #fff;
            }

            .application-review-header span,
            .contact-message-header span {
                display: block;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 1.5px;
                color: #9a7b35;
                margin-bottom: 5px;
            }

            .application-review-header h2,
            .contact-message-header h2 {
                margin: 0;
                font-size: 25px;
                color: #162033;
            }

            .application-review-close,
            .contact-message-close {
                width: 40px;
                height: 40px;
                border: 0;
                border-radius: 50%;
                background: #f2f3f5;
                color: #222;
                font-size: 27px;
                line-height: 1;
                cursor: pointer;
            }

            .application-review-body {
                padding: 28px;
                overflow-y: auto;
            }

            .review-application-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 24px;
            }

            .review-application-summary > div {
                background: #f7f8fa;
                border: 1px solid #e8e8e8;
                border-radius: 10px;
                padding: 15px;
            }

            .review-application-summary span {
                display: block;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: .7px;
                color: #777;
                margin-bottom: 6px;
            }

            .review-application-summary strong {
                font-size: 15px;
                color: #182235;
            }

            .review-detail-section {
                margin-bottom: 24px;
                border: 1px solid #e7e8eb;
                border-radius: 12px;
                overflow: hidden;
            }

            .review-detail-section h3 {
                margin: 0;
                padding: 14px 18px;
                background: #f7f8fa;
                border-bottom: 1px solid #e7e8eb;
                font-size: 15px;
                color: #182235;
            }

            .review-detail-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
            }

            .review-detail-item {
                padding: 14px 18px;
                border-bottom: 1px solid #eeeeee;
            }

            .review-detail-item:nth-child(odd) {
                border-right: 1px solid #eeeeee;
            }

            .review-detail-label {
                display: block;
                font-size: 11px;
                color: #777;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: .5px;
            }

            .review-detail-value {
                display: block;
                font-size: 14px;
                color: #182235;
                word-break: break-word;
            }

            .application-action-wrapper {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-width: 280px;
            }

            .application-review-btn,
            .application-status-btn,
            .application-delete-btn,
            .job-resume-btn {
                border: 1px solid #dfe2e7;
                border-radius: 7px;
                background: #fff;
                padding: 7px 10px;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            .application-review-btn:hover,
            .job-resume-btn:hover {
                background: #f4f6f8;
            }

            .application-status-btn.active {
                background: #182235;
                color: #fff;
                border-color: #182235;
            }

            .application-status-btn:hover:not(.active) {
                background: #f5f6f8;
            }

            .application-delete-btn {
                color: #b42318;
                border-color: #f0c7c4;
            }

            .application-delete-btn:hover {
                background: #fff3f2;
            }

            .admin-applicant-cell strong {
                display: block;
            }

            .admin-applicant-cell small {
                display: block;
                margin-top: 4px;
                color: #777;
                font-size: 11px;
            }


            /* CONTACT MESSAGE MODAL */

            .contact-message-modal {
                position: fixed;
                inset: 0;
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }

            .contact-message-overlay {
                position: absolute;
                inset: 0;
                background: rgba(10, 18, 32, 0.72);
                backdrop-filter: blur(4px);
            }

            .contact-message-dialog {
                position: relative;
                z-index: 2;
                width: min(900px, 100%);
                max-height: 90vh;
                background: #fff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 25px 80px rgba(0,0,0,0.25);
            }

            .contact-message-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 24px 28px;
                border-bottom: 1px solid #e8e8e8;
            }

            .contact-message-body {
                padding: 28px;
                max-height: 70vh;
                overflow-y: auto;
            }

            .contact-message-meta {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 22px;
            }

            .contact-message-meta > div {
                padding: 14px;
                border: 1px solid #e7e8eb;
                border-radius: 10px;
                background: #f8f9fa;
            }

            .contact-message-meta span,
            .contact-message-content > span {
                display: block;
                font-size: 11px;
                color: #777;
                text-transform: uppercase;
                letter-spacing: .6px;
                margin-bottom: 6px;
            }

            .contact-message-meta strong {
                display: block;
                color: #182235;
                font-size: 14px;
                word-break: break-word;
            }

            .contact-message-content {
                border: 1px solid #e7e8eb;
                border-radius: 10px;
                padding: 18px;
            }

            .contact-message-content p {
                margin: 0;
                color: #303846;
                font-size: 14px;
                line-height: 1.8;
                word-break: break-word;
            }

            .message-action-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                min-width: 220px;
            }

            .message-view-btn,
            .message-status-btn,
            .message-delete-btn {
                border: 1px solid #dfe2e7;
                border-radius: 7px;
                background: #fff;
                padding: 7px 9px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            .message-view-btn:hover,
            .message-status-btn:hover {
                background: #f4f6f8;
            }

            .message-delete-btn {
                color: #b42318;
                border-color: #f0c7c4;
            }

            .message-delete-btn:hover {
                background: #fff3f2;
            }


            @media (max-width: 700px) {

                .application-review-modal {
                    padding: 10px;
                }

                .application-review-dialog {
                    max-height: 95vh;
                }

                .application-review-header,
                .contact-message-header {
                    padding: 18px;
                }

                .application-review-body,
                .contact-message-body {
                    padding: 18px;
                }

                .review-application-summary {
                    grid-template-columns: 1fr;
                }

                .review-detail-grid {
                    grid-template-columns: 1fr;
                }

                .review-detail-item:nth-child(odd) {
                    border-right: 0;
                }

                .contact-message-modal {
                    padding: 10px;
                }

                .contact-message-dialog {
                    max-height: 95vh;
                }

                .contact-message-meta {
                    grid-template-columns: 1fr;
                }

            }

        `;

        document.head.appendChild(
            style
        );
    }


    injectReviewStyles();


    // =====================================================
    // START DASHBOARD
    // =====================================================

    try {

        const user =
            await verifyAdmin();

        loadProfile(
            user
        );

        await Promise.all([
            loadApplications(),
            loadPayments(),
            loadJobApplications(),
            loadContactMessages()
        ]);

        console.log(
            "Admin dashboard loaded successfully."
        );


        
    } catch (error) {

        console.error(
            "Dashboard authentication error:",
            error
        );

        clearAuthentication();

        window.location.replace(
            "/admin-login.html"
        );
    }

});