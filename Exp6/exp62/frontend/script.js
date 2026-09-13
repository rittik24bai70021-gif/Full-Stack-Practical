const API_URL = "http://localhost:8080/api/users";

let currentDeleteId = null;
let lastLoadedMode = "cached";

// =========================================
// Helpers
// =========================================

function showLoading() {
    document
        .getElementById("loadingOverlay")
        .classList.remove("hidden");
}

function hideLoading() {
    document
        .getElementById("loadingOverlay")
        .classList.add("hidden");
}

function updateQueryStatus(status, text) {
    const badge = document.getElementById("queryStatus");

    badge.className = "status-badge";

    if (status === "loading") {
        badge.classList.add("status-loading");
    } else if (status === "success") {
        badge.classList.add("status-success");
    } else if (status === "error") {
        badge.classList.add("status-error");
    } else {
        badge.classList.add("status-ready");
    }

    badge.textContent = text;
}

function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    if (type === "error") {
        toastIcon.textContent = "✕";
    } else if (type === "warning") {
        toastIcon.textContent = "⚠";
    } else {
        toastIcon.textContent = "✓";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// =========================================
// Render Users
// =========================================

function renderUsers(users, isNative = false) {
    const tableBody =
        document.getElementById("userTableBody");

    tableBody.innerHTML = "";

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-icon">📂</div>
                    <strong>No users found</strong>
                    <p>The database currently has no user records.</p>
                </td>
            </tr>
        `;

        document.getElementById("totalUsers").textContent = "0";
        document.getElementById("tableUserCount").textContent = "0";

        return;
    }

    users.forEach(userData => {
        let id;
        let uid;
        let name;
        let city;
        let country;

        if (isNative) {
            id = userData[0];
            uid = userData[1];
            name = userData[2];
            city = userData[3];
            country = userData[4];
        } else {
            id = userData.id;
            uid = userData.uid;
            name = userData.name;

            city =
                userData.address?.city || "-";

            country =
                userData.address?.country || "-";
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${id}</td>

            <td>
                <strong>${uid}</strong>
            </td>

            <td>${name}</td>

            <td>${city}</td>

            <td>${country}</td>

            <td>
                <button
                    class="delete-button"
                    onclick="openDeleteModal(${id})"
                >
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    document.getElementById("totalUsers").textContent =
        users.length;

    document.getElementById("tableUserCount").textContent =
        users.length;
}

// =========================================
// Load Users
// =========================================

async function loadUsers(mode) {
    lastLoadedMode = mode;

    const endpointMap = {
        normal: "/normal",
        optimized: "/optimized",
        cached: "/cached",
        native: "/native",
        "sort/id": "/sort/id",
        "sort/name": "/sort/name"
    };

    const labelMap = {
        normal: "Normal Query",
        optimized: "JOIN FETCH",
        cached: "Cached Query",
        native: "Native SQL",
        "sort/id": "Sort by ID",
        "sort/name": "Sort by Name"
    };

    const endpoint = endpointMap[mode];

    if (!endpoint) {
        showToast(
            "Invalid Operation",
            "Unknown query mode selected.",
            "error"
        );

        return;
    }

    const operationLabel =
        labelMap[mode];

    document.getElementById("operationName").textContent =
        operationLabel;

    document.getElementById("lastQuery").textContent =
        operationLabel;

    document.getElementById("tableSubtitle").textContent =
        `Results from ${operationLabel}`;

    updateQueryStatus(
        "loading",
        "RUNNING"
    );

    showLoading();

    const start =
        performance.now();

    try {
        const response =
            await fetch(
                API_URL + endpoint
            );

        const end =
            performance.now();

        const elapsed =
            (end - start).toFixed(2);

        document.getElementById(
            "responseTime"
        ).textContent =
            `${elapsed} ms`;

        if (!response.ok) {
            throw new Error(
                `Request failed with status ${response.status}`
            );
        }

        const data =
            await response.json();

        renderUsers(
            data,
            mode === "native"
        );

        if (mode === "cached") {
            document.getElementById(
                "cacheStatus"
            ).textContent =
                "ACTIVE";
        } else {
            document.getElementById(
                "cacheStatus"
            ).textContent =
                "Ready";
        }

        updateQueryStatus(
            "success",
            "SUCCESS"
        );

        showToast(
            "Query Completed",
            `${operationLabel} completed in ${elapsed} ms.`
        );

    } catch (error) {
        console.error(error);

        updateQueryStatus(
            "error",
            "FAILED"
        );

        document.getElementById(
            "responseTime"
        ).textContent =
            "-- ms";

        showToast(
            "Request Failed",
            "Unable to retrieve users from the backend.",
            "error"
        );

    } finally {
        hideLoading();
    }
}

// =========================================
// Refresh
// =========================================

function refreshUsers() {
    loadUsers(lastLoadedMode || "cached");
}

// =========================================
// Add User
// =========================================

document
    .getElementById("userForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const uid =
                document
                    .getElementById("uid")
                    .value
                    .trim();

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const city =
                document
                    .getElementById("city")
                    .value
                    .trim();

            const country =
                document
                    .getElementById("country")
                    .value
                    .trim();

            const payload = {
                uid,
                name,
                city,
                country
            };

            showLoading();

            const start =
                performance.now();

            try {
                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                const end =
                    performance.now();

                const elapsed =
                    (end - start).toFixed(2);

                document.getElementById(
                    "responseTime"
                ).textContent =
                    `${elapsed} ms`;

                if (!response.ok) {
                    let errorMessage =
                        "Unable to create user.";

                    try {
                        const errorData =
                            await response.json();

                        if (errorData.message) {
                            errorMessage =
                                errorData.message;
                        }
                    } catch {
                    }

                    throw new Error(
                        errorMessage
                    );
                }

                document
                    .getElementById("userForm")
                    .reset();

                document.getElementById(
                    "lastQuery"
                ).textContent =
                    "Create User";

                document.getElementById(
                    "cacheStatus"
                ).textContent =
                    "CLEARED";

                showToast(
                    "User Added",
                    `User ${name} was created successfully.`
                );

                await loadUsers(
                    "cached"
                );

            } catch (error) {
                console.error(error);

                showToast(
                    "Unable to Add User",
                    error.message,
                    "error"
                );

            } finally {
                hideLoading();
            }
        }
    );

// =========================================
// Delete Modal
// =========================================

function openDeleteModal(id) {
    currentDeleteId = id;

    document
        .getElementById("deleteModal")
        .classList.remove("hidden");
}

function closeDeleteModal() {
    currentDeleteId = null;

    document
        .getElementById("deleteModal")
        .classList.add("hidden");
}

document
    .getElementById(
        "confirmDeleteButton"
    )
    .addEventListener(
        "click",
        async function () {

            if (currentDeleteId === null) {
                return;
            }

            const id =
                currentDeleteId;

            closeDeleteModal();

            showLoading();

            const start =
                performance.now();

            try {
                const response =
                    await fetch(
                        `${API_URL}/${id}`,
                        {
                            method: "DELETE"
                        }
                    );

                const end =
                    performance.now();

                const elapsed =
                    (end - start).toFixed(2);

                document.getElementById(
                    "responseTime"
                ).textContent =
                    `${elapsed} ms`;

                if (!response.ok) {
                    throw new Error(
                        "Delete request failed."
                    );
                }

                document.getElementById(
                    "lastQuery"
                ).textContent =
                    "Delete User";

                document.getElementById(
                    "cacheStatus"
                ).textContent =
                    "CLEARED";

                showToast(
                    "User Deleted",
                    `User ID ${id} was removed successfully.`
                );

                await loadUsers(
                    "cached"
                );

            } catch (error) {
                console.error(error);

                showToast(
                    "Delete Failed",
                    "Unable to delete the selected user.",
                    "error"
                );

            } finally {
                hideLoading();
            }
        }
    );

// =========================================
// Close modal by clicking outside
// =========================================

document
    .getElementById("deleteModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target.id ===
                "deleteModal"
            ) {
                closeDeleteModal();
            }
        }
    );

// =========================================
// Initial Load
// =========================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        document.getElementById(
            "cacheStatus"
        ).textContent =
            "Ready";

        updateQueryStatus(
            "ready",
            "READY"
        );

        loadUsers(
            "cached"
        );
    }
);