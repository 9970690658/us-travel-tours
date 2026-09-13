/* =========================================================
   U.S TRAVEL & TOURS
   CUSTOMER LIVE SUPPORT CHAT
   FINAL VERSION
========================================================= */

(function () {

    "use strict";

    const API_BASE_URL =
        "https://us-travel-tours.onrender.com";

    console.log("LIVE CHAT JS FILE LOADED");


    function getToken() {

        return (
            sessionStorage.getItem("authToken") ||
            localStorage.getItem("authToken") ||
            ""
        );

    }


    function clearAuth() {

        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");

        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");

    }


    function initializeChat() {

        const openChatBtn =
            document.getElementById("openChatBtn");

        const closeChatBtn =
            document.getElementById("closeChatBtn");

        const chatWindow =
            document.getElementById("chatWindow");

        const chatMessages =
            document.getElementById("chatMessages");

        const chatForm =
            document.getElementById("chatForm");

        const chatInput =
            document.getElementById("chatInput");

        const chatSendBtn =
            document.getElementById("chatSendBtn");


        console.log("LIVE CHAT ELEMENT CHECK:", {
            openChatBtn: !!openChatBtn,
            closeChatBtn: !!closeChatBtn,
            chatWindow: !!chatWindow,
            chatMessages: !!chatMessages,
            chatForm: !!chatForm,
            chatInput: !!chatInput
        });


        if (
            !openChatBtn ||
            !closeChatBtn ||
            !chatWindow ||
            !chatMessages ||
            !chatForm ||
            !chatInput
        ) {

            console.error(
                "LIVE CHAT ERROR: Required HTML elements are missing."
            );

            return;

        }


        let pollingTimer = null;


        /* =================================================
           OPEN CHAT
        ================================================= */

        async function openChat() {

            console.log(
                "LIVE CHAT: OPEN CLICK"
            );


            const token = getToken();


            console.log(
                "LIVE CHAT TOKEN:",
                token ? "FOUND" : "NOT FOUND"
            );


            if (!token) {

                const login =
                    window.confirm(
                        "Please login to use Live Support Chat.\n\nWould you like to login now?"
                    );


                if (login) {

                    sessionStorage.setItem(
                        "returnAfterLogin",
                        "index.html"
                    );

                    window.location.href =
                        "/login.html";

                }

                return;

            }


            /* OPEN FIRST */

            chatWindow.classList.add("show");

            chatWindow.setAttribute(
                "aria-hidden",
                "false"
            );


            /* LOAD */

            await loadMessages();


            chatInput.focus();


            startPolling();

        }


        /* =================================================
           CLOSE CHAT
        ================================================= */

        function closeChat() {

            console.log(
                "LIVE CHAT: CLOSE"
            );


            chatWindow.classList.remove(
                "show"
            );

            chatWindow.setAttribute(
                "aria-hidden",
                "true"
            );


            stopPolling();

        }


        /* =================================================
           API
        ================================================= */

        async function apiRequest(
            url,
            options = {}
        ) {

            const token =
                getToken();


            if (!token) {

                throw new Error(
                    "Authentication required."
                );

            }


            const response =
    await fetch(
        `${API_BASE_URL}${url}`,
        {
                        ...options,

                        headers: {
                            ...(options.headers || {}),
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            let data = null;


            try {

                data =
                    await response.json();

            } catch (error) {

                data = null;

            }


            console.log(
                "LIVE CHAT API:",
                url,
                response.status,
                data
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearAuth();

                closeChat();

                throw new Error(
                    "Your login session has expired. Please login again."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to complete chat request."
                );

            }


            return data;

        }


        /* =================================================
           ESCAPE
        ================================================= */

        function escapeHtml(value) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                String(value ?? "");

            return div.innerHTML;

        }


        /* =================================================
           TIME
        ================================================= */

        function formatTime(value) {

            if (!value) {
                return "";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "";

            }


            return date.toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        }


        /* =================================================
           RENDER
        ================================================= */

        function renderMessages(
            messages
        ) {

            if (
                !Array.isArray(messages) ||
                messages.length === 0
            ) {

                chatMessages.innerHTML = `

                    <div class="chat-welcome">

                        <div class="chat-welcome-icon">
                            <i class="fa-solid fa-headset"></i>
                        </div>

                        <h4>
                            Welcome to U.S TRAVEL & TOURS
                        </h4>

                        <p>
                            How can we help you today?
                        </p>

                    </div>

                `;

                return;

            }


            chatMessages.innerHTML =
                messages
                    .map(
                        function (message) {

                            const role =
    message.sender_type === "admin"
        ? "admin"
        : "customer";


                            return `

                                <div class="chat-message ${role}">

                                    <div class="chat-message-bubble">

                                        <div>
                                            ${escapeHtml(
                                                message.message
                                            )}
                                        </div>

                                        <div class="chat-message-time">
                                            ${formatTime(
                                                message.created_at
                                            )}
                                        </div>

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("");


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }


        /* =================================================
           LOAD
        ================================================= */

        async function loadMessages() {

            try {

                const result =
                    await apiRequest(
                        "/api/chat/messages"
                    );


                renderMessages(
                    result.messages || []
                );


            } catch (error) {

                console.error(
                    "LIVE CHAT LOAD ERROR:",
                    error
                );


                chatMessages.innerHTML = `

                    <div class="chat-welcome">

                        <div class="chat-welcome-icon">
                            <i class="fa-solid fa-circle-exclamation"></i>
                        </div>

                        <h4>
                            Unable to load chat
                        </h4>

                        <p>
                            ${escapeHtml(
                                error.message ||
                                "Please try again."
                            )}
                        </p>

                    </div>

                `;

            }

        }


        /* =================================================
           SEND
        ================================================= */

        async function sendMessage(
            event
        ) {

            event.preventDefault();


            const message =
                chatInput.value.trim();


            if (!message) {
                return;
            }


            if (message.length > 2000) {

                alert(
                    "Message cannot be longer than 2000 characters."
                );

                return;

            }


            if (!getToken()) {

                openChat();

                return;

            }


            chatInput.disabled =
                true;


            if (chatSendBtn) {

                chatSendBtn.disabled =
                    true;

            }


            try {

                await apiRequest(
                    "/api/chat/messages",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message
                            })
                    }
                );


                chatInput.value =
                    "";


                await loadMessages();


            } catch (error) {

                console.error(
                    "LIVE CHAT SEND ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to send message."
                );


            } finally {

                chatInput.disabled =
                    false;


                if (chatSendBtn) {

                    chatSendBtn.disabled =
                        false;

                }


                chatInput.focus();

            }

        }


        /* =================================================
           POLLING
        ================================================= */

        function startPolling() {

            stopPolling();


            pollingTimer =
                setInterval(
                    function () {

                        if (
                            chatWindow.classList.contains(
                                "show"
                            )
                        ) {

                            loadMessages();

                        }

                    },
                    4000
                );

        }


        function stopPolling() {

            if (pollingTimer) {

                clearInterval(
                    pollingTimer
                );

                pollingTimer = null;

            }

        }


        /* =================================================
           EVENTS
        ================================================= */

        openChatBtn.addEventListener(
            "click",
            openChat
        );


        closeChatBtn.addEventListener(
            "click",
            closeChat
        );


        chatForm.addEventListener(
            "submit",
            sendMessage
        );


        /*
         * ALSO SET DIRECT ONCLICK
         * This makes debugging much easier.
         */

        openChatBtn.onclick =
            openChat;

        closeChatBtn.onclick =
            closeChat;


        /* =================================================
           ESC
        ================================================= */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    chatWindow.classList.contains(
                        "show"
                    )
                ) {

                    closeChat();

                }

            }
        );


        console.log(
            "LIVE CHAT: INITIALIZED SUCCESSFULLY"
        );

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeChat
        );

    } else {

        initializeChat();

    }

})();