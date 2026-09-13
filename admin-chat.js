/* =========================================================
   U.S TRAVEL & TOURS
   ADMIN LIVE CHAT
========================================================= */

console.log("ADMIN CHAT JS LOADED");


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ADMIN CHAT: DOM READY"
        );

        initializeAdminChat();

    }
);


/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL =
    "https://us-travel-tours.onrender.com";

const ADMIN_CHAT_API =
    `${API_BASE_URL}/api/chat`;


let selectedCustomerId = null;

let selectedCustomerName = "";

let chatPollingTimer = null;

let conversationPollingTimer = null;

let adminChatInitialized = false;


/* =========================================================
   AUTH TOKEN
========================================================= */

function getAdminAuthToken() {

    return (
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        ""
    );

}


/* =========================================================
   AUTH HEADERS
========================================================= */

function getAdminHeaders() {

    const token =
        getAdminAuthToken();

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}


/* =========================================================
   ELEMENTS
========================================================= */

function getChatElements() {

    return {

        app:
            document.getElementById(
                "adminChatApp"
            ),

        usersList:
            document.getElementById(
                "adminChatUsersList"
            ),

        customerCount:
            document.getElementById(
                "chatCustomerCount"
            ),

        headerName:
            document.getElementById(
                "adminChatCustomerName"
            ),

        headerEmail:
            document.getElementById(
                "adminChatCustomerEmail"
            ),

        messages:
            document.getElementById(
                "adminChatMessages"
            ),

        form:
            document.getElementById(
                "adminChatForm"
            ),

        input:
            document.getElementById(
                "adminChatInput"
            ),

        sendButton:
            document.getElementById(
                "adminChatSendBtn"
            ),

        refreshButton:
            document.getElementById(
                "refreshChatUsers"
            )

    };

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeAdminChat() {

    if (adminChatInitialized) {

        console.log(
            "ADMIN CHAT: Already initialized."
        );

        return;

    }


    const elements =
        getChatElements();


    if (!elements.app) {

        console.log(
            "ADMIN CHAT: Chat section not present on this page."
        );

        return;

    }


    console.log(
        "ADMIN CHAT: Elements found."
    );


    adminChatInitialized = true;


    /* -----------------------------------------
       REFRESH BUTTON
    ----------------------------------------- */

    if (elements.refreshButton) {

        elements.refreshButton.addEventListener(
            "click",
            function () {

                loadConversations();

                if (selectedCustomerId) {

                    loadConversation(
                        selectedCustomerId,
                        false
                    );

                }

            }
        );

    }


    /* -----------------------------------------
       REPLY FORM
    ----------------------------------------- */

    if (elements.form) {

        elements.form.addEventListener(
            "submit",
            handleAdminReply
        );

    }


    /* -----------------------------------------
       FIRST LOAD
    ----------------------------------------- */

    loadConversations();


    /* -----------------------------------------
       POLLING
    ----------------------------------------- */

    conversationPollingTimer =
        setInterval(
            function () {

                loadConversations(
                    true
                );

            },
            4000
        );


    chatPollingTimer =
        setInterval(
            function () {

                if (
                    selectedCustomerId
                ) {

                    loadConversation(
                        selectedCustomerId,
                        true
                    );

                }

            },
            3000
        );

}


/* =========================================================
   LOAD CUSTOMER CONVERSATIONS
========================================================= */

async function loadConversations(
    silent = false
) {

    const elements =
        getChatElements();


    if (!elements.usersList) {
        return;
    }


    const token =
        getAdminAuthToken();


    if (!token) {

        console.error(
            "ADMIN CHAT: Admin auth token missing."
        );

        if (!silent) {

            elements.usersList.innerHTML = `

                <div class="admin-chat-empty">

                    <i class="fa-solid fa-lock"></i>

                    <p>
                        Admin authentication required.
                    </p>

                </div>

            `;

        }

        return;

    }


    try {

        console.log(
            "ADMIN CHAT: Loading conversations..."
        );


        const response =
            await fetch(
                `${ADMIN_CHAT_API}/conversations`,
                {

                    method: "GET",

                    headers:
                        getAdminHeaders(),

                    cache: "no-store"

                }
            );


        const rawText =
            await response.text();


        let result = null;


        try {

            result =
                JSON.parse(
                    rawText
                );

        } catch {

            console.error(
                "ADMIN CHAT: Invalid JSON:",
                rawText
            );

            throw new Error(
                "Invalid server response."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load conversations."
            );

        }


        const conversations =
            Array.isArray(
                result.conversations
            )
                ? result.conversations
                : [];


        console.log(
            "ADMIN CHAT: Conversations:",
            conversations
        );


        renderConversationList(
            conversations
        );


    } catch (error) {

        console.error(
            "ADMIN CHAT LOAD ERROR:",
            error
        );


        if (!silent) {

            elements.usersList.innerHTML = `

                <div class="admin-chat-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Unable to load conversations.
                    </p>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </div>

            `;

        }

    }

}


/* =========================================================
   RENDER CUSTOMER LIST
========================================================= */

function renderConversationList(
    conversations
) {

    const elements =
        getChatElements();


    if (!elements.usersList) {
        return;
    }


    /* -----------------------------------------
       COUNT
    ----------------------------------------- */

    if (elements.customerCount) {

        elements.customerCount.textContent =
            `${conversations.length} ${
                conversations.length === 1
                    ? "conversation"
                    : "conversations"
            }`;

    }


    /* -----------------------------------------
       EMPTY
    ----------------------------------------- */

    if (
        conversations.length === 0
    ) {

        elements.usersList.innerHTML = `

            <div class="admin-chat-empty">

                <i class="fa-regular fa-comments"></i>

                <p>
                    No customer conversations yet.
                </p>

                <small>
                    New customer messages will appear here.
                </small>

            </div>

        `;

        return;

    }


    /* -----------------------------------------
       BUILD LIST
    ----------------------------------------- */

    elements.usersList.innerHTML =
        conversations
            .map(
                function (customer) {

                    const active =
                        Number(
                            customer.user_id
                        ) === Number(
                            selectedCustomerId
                        );


                    const unread =
                        Number(
                            customer.unread_count
                        ) || 0;


                    const initial =
                        getInitial(
                            customer.name
                        );


                    const lastMessage =
                        customer.last_message
                            ? customer.last_message
                            : "No messages";


                    return `

                        <button
                            type="button"
                            class="admin-chat-user ${
                                active
                                    ? "active"
                                    : ""
                            }"
                            data-user-id="${
                                Number(
                                    customer.user_id
                                )
                            }"
                        >

                            <div class="admin-chat-user-avatar">
                                ${escapeHtml(
                                    initial
                                )}
                            </div>


                            <div class="admin-chat-user-content">

                                <div class="admin-chat-user-top">

                                    <strong>
                                        ${escapeHtml(
                                            customer.name ||
                                            "Customer"
                                        )}
                                    </strong>

                                    ${
                                        unread > 0
                                            ? `
                                                <span class="admin-chat-unread">
                                                    ${unread}
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>


                                <div class="admin-chat-user-email">

                                    ${escapeHtml(
                                        customer.email ||
                                        ""
                                    )}

                                </div>


                                <div class="admin-chat-user-last">

                                    ${escapeHtml(
                                        lastMessage
                                    )}

                                </div>

                            </div>

                        </button>

                    `;

                }
            )
            .join("");


    /* -----------------------------------------
       CLICK EVENTS
    ----------------------------------------- */

    const customerButtons =
        elements.usersList.querySelectorAll(
            ".admin-chat-user"
        );


    customerButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const userId =
                        Number(
                            button.dataset.userId
                        );


                    if (
                        !Number.isInteger(
                            userId
                        ) ||
                        userId <= 0
                    ) {

                        return;

                    }


                    selectedCustomerId =
                        userId;


                    loadConversation(
                        userId,
                        false
                    );


                    renderConversationList(
                        conversations
                    );

                }
            );

        }
    );

}


/* =========================================================
   LOAD ONE CUSTOMER CONVERSATION
========================================================= */

async function loadConversation(
    userId,
    silent = false
) {

    const elements =
        getChatElements();


    if (
        !userId ||
        !elements.messages
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${ADMIN_CHAT_API}/conversations/${userId}`,
                {

                    method: "GET",

                    headers:
                        getAdminHeaders(),

                    cache: "no-store"

                }
            );


        const rawText =
            await response.text();


        let result = null;


        try {

            result =
                JSON.parse(
                    rawText
                );

        } catch {

            throw new Error(
                "Invalid server response."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load conversation."
            );

        }


        const customer =
            result.customer || {};


        const messages =
            Array.isArray(
                result.messages
            )
                ? result.messages
                : [];


        selectedCustomerName =
            customer.name ||
            "Customer";


        /* -----------------------------------------
           HEADER
        ----------------------------------------- */

        if (
            elements.headerName
        ) {

            elements.headerName.textContent =
                customer.name ||
                "Customer";

        }


        if (
            elements.headerEmail
        ) {

            elements.headerEmail.textContent =
                customer.email ||
                "Customer conversation";

        }


        /* -----------------------------------------
           ENABLE REPLY
        ----------------------------------------- */

        if (
            elements.input
        ) {

            elements.input.disabled =
                false;

        }


        if (
            elements.sendButton
        ) {

            elements.sendButton.disabled =
                false;

        }


        /* -----------------------------------------
           RENDER MESSAGES
        ----------------------------------------- */

        renderAdminMessages(
            messages,
            elements.messages
        );


    } catch (error) {

        console.error(
            "ADMIN CHAT CONVERSATION ERROR:",
            error
        );


        if (!silent) {

            elements.messages.innerHTML = `

                <div class="admin-chat-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Unable to load conversation.
                    </p>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </div>

            `;

        }

    }

}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderAdminMessages(
    messages,
    container
) {

    if (
        !messages ||
        messages.length === 0
    ) {

        container.innerHTML = `

            <div class="admin-chat-empty">

                <i class="fa-regular fa-message"></i>

                <p>
                    No messages yet.
                </p>

            </div>

        `;

        return;

    }


    const shouldScroll =
        (
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight
        ) < 120;


    container.innerHTML =
        messages
            .map(
                function (item) {

                    const isCustomer =
                        item.sender_type ===
                        "customer";


                    return `

                        <div
                            class="
                                admin-chat-message
                                ${
                                    isCustomer
                                        ? "customer"
                                        : "admin"
                                }
                            "
                        >

                            <div class="admin-chat-message-bubble">

                                <div class="admin-chat-message-text">

                                    ${escapeHtml(
                                        item.message
                                    )}

                                </div>


                                <div class="admin-chat-message-time">

                                    ${formatChatDate(
                                        item.created_at
                                    )}

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    if (shouldScroll) {

        container.scrollTop =
            container.scrollHeight;

    }

}


/* =========================================================
   ADMIN REPLY
========================================================= */

async function handleAdminReply(
    event
) {

    event.preventDefault();


    const elements =
        getChatElements();


    if (
        !selectedCustomerId
    ) {

        return;

    }


    const message =
        (
            elements.input?.value ||
            ""
        ).trim();


    if (!message) {

        return;

    }


    if (
        message.length > 2000
    ) {

        alert(
            "Reply cannot exceed 2000 characters."
        );

        return;

    }


    /* -----------------------------------------
       DISABLE
    ----------------------------------------- */

    elements.input.disabled =
        true;

    elements.sendButton.disabled =
        true;


    try {

        console.log(
            "ADMIN CHAT: Sending reply to customer:",
            selectedCustomerId
        );


        const response =
            await fetch(
                `${ADMIN_CHAT_API}/conversations/${selectedCustomerId}/reply`,
                {

                    method: "POST",

                    headers:
                        getAdminHeaders(),

                    body:
                        JSON.stringify({
                            message:
                                message
                        })

                }
            );


        const rawText =
            await response.text();


        let result = null;


        try {

            result =
                JSON.parse(
                    rawText
                );

        } catch {

            throw new Error(
                "Invalid server response."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to send reply."
            );

        }


        console.log(
            "ADMIN CHAT: Reply sent successfully."
        );


        elements.input.value =
            "";


        await loadConversation(
            selectedCustomerId,
            false
        );


        await loadConversations(
            true
        );


    } catch (error) {

        console.error(
            "ADMIN CHAT REPLY ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to send reply."
        );


    } finally {

        if (selectedCustomerId) {

            elements.input.disabled =
                false;

            elements.sendButton.disabled =
                false;

            elements.input.focus();

        }

    }

}


/* =========================================================
   DATE
========================================================= */

function formatChatDate(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(
            value.replace(
                " ",
                "T"
            ) + "Z"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        [],
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   INITIAL
========================================================= */

function getInitial(
    name
) {

    if (!name) {
        return "?";
    }


    const parts =
        String(
            name
        )
            .trim()
            .split(
                /\s+/
            );


    if (
        parts.length === 1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[1].charAt(0)
    ).toUpperCase();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (
            conversationPollingTimer
        ) {

            clearInterval(
                conversationPollingTimer
            );

        }


        if (
            chatPollingTimer
        ) {

            clearInterval(
                chatPollingTimer
            );

        }

    }
);