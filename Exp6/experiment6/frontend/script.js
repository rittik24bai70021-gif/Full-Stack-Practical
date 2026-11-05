// ============================================================
// EXPERIMENT 6.1
// Pagination & Sorting REST API
// Frontend JavaScript
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = "http://localhost:8080/api/users";


// ============================================================
// APPLICATION STATE
// ============================================================

let currentPage = 0;
let pageSize = 5;
let sortBy = "uid";
let sortOrder = "asc";

let totalPages = 0;
let totalUsers = 0;


// ============================================================
// DOM ELEMENTS
// ============================================================

const userForm = document.getElementById("userForm");

const uidInput = document.getElementById("uid");
const nameInput = document.getElementById("name");

const pageSizeSelect =
    document.getElementById("pageSize");

const sortBySelect =
    document.getElementById("sortBy");

const sortOrderSelect =
    document.getElementById("sortOrder");

const applyBtn =
    document.getElementById("applyBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const userTableBody =
    document.getElementById("userTableBody");

const loading =
    document.getElementById("loading");

const tableContainer =
    document.getElementById("tableContainer");

const emptyState =
    document.getElementById("emptyState");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const totalUsersElement =
    document.getElementById("totalUsers");

const currentPageElement =
    document.getElementById("currentPage");

const totalPagesElement =
    document.getElementById("totalPages");

const currentSizeElement =
    document.getElementById("currentSize");

const pageNumberElement =
    document.getElementById("pageNumber");

const pageCountElement =
    document.getElementById("pageCount");

const resultInfo =
    document.getElementById("resultInfo");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const toastIcon =
    document.getElementById("toastIcon");


// ============================================================
// LOAD USERS
// ============================================================

async function loadUsers() {

    // Show loading state
    showLoading();

    try {

        const url =
            `${API_URL}` +
            `?page=${currentPage}` +
            `&size=${pageSize}` +
            `&sort=${sortBy},${sortOrder}`;


        console.log("Fetching:", url);


        const response =
            await fetch(url);


        // Check HTTP status
        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }


        // Convert response to JSON
        const data =
            await response.json();


        console.log("API Response:", data);


        // ====================================================
        // UPDATE APPLICATION STATE
        // ====================================================

        totalUsers =
            data.totalElements || 0;

        totalPages =
            data.totalPages || 0;


        // ====================================================
        // UPDATE UI
        // ====================================================

        updateStatistics(data);

        renderUsers(data.content || []);

        updatePagination(data);

        updateResultInfo(data);


    } catch (error) {

        console.error(
            "Error loading users:",
            error
        );


        showError();


        showToast(
            "Unable to connect to Spring Boot API",
            "error"
        );


    } finally {

        // IMPORTANT:
        // Hide loading after API request finishes.
        // This fixes the permanent loading problem.

        hideLoading();
    }
}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(data) {

    totalUsersElement.textContent =
        data.totalElements || 0;


    currentPageElement.textContent =
        (data.page || 0) + 1;


    totalPagesElement.textContent =
        data.totalPages || 0;


    currentSizeElement.textContent =
        data.size || pageSize;


    pageNumberElement.textContent =
        (data.page || 0) + 1;


    pageCountElement.textContent =
        data.totalPages || 1;
}


// ============================================================
// RENDER USERS
// ============================================================

function renderUsers(users) {

    // Clear previous rows
    userTableBody.innerHTML = "";


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (!users || users.length === 0) {

        tableContainer.classList.add("hidden");

        emptyState.classList.remove("hidden");

        emptyState.innerHTML = `

            <div class="empty-icon">
                👥
            </div>

            <h3>
                No Users Found
            </h3>

            <p>
                There are currently no users
                available on this page.
            </p>

        `;

        return;
    }


    // ========================================================
    // SHOW TABLE
    // ========================================================

    tableContainer.classList.remove("hidden");

    emptyState.classList.add("hidden");


    // ========================================================
    // CREATE TABLE ROWS
    // ========================================================

    users.forEach((user, index) => {

        const row =
            document.createElement("tr");


        // Calculate serial number across pages
        const serialNumber =
            (currentPage * pageSize) +
            index +
            1;


        row.innerHTML = `

            <td>
                ${serialNumber}
            </td>

            <td>
                <span class="uid">
                    ${escapeHTML(user.uid)}
                </span>
            </td>

            <td>
                <span class="name">
                    ${escapeHTML(user.name)}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteUser('${escapeAttribute(user.uid)}')">

                    🗑 Delete

                </button>

            </td>

        `;


        userTableBody.appendChild(row);

    });
}


// ============================================================
// UPDATE RESULT INFORMATION
// ============================================================

function updateResultInfo(data) {

    const total =
        data.totalElements || 0;


    const content =
        data.content || [];


    if (total === 0) {

        resultInfo.textContent =
            "No users available";

        return;
    }


    const start =
        (data.page * data.size) + 1;


    const end =
        Math.min(
            start + content.length - 1,
            total
        );


    resultInfo.textContent =
        `Showing ${start}-${end} of ${total} users`;
}


// ============================================================
// UPDATE PAGINATION BUTTONS
// ============================================================

function updatePagination(data) {

    // Previous button
    prevBtn.disabled =
        data.first === true;


    // Next button
    nextBtn.disabled =
        data.last === true;


    // Current page
    pageNumberElement.textContent =
        (data.page || 0) + 1;


    // Total pages
    pageCountElement.textContent =
        data.totalPages || 1;
}


// ============================================================
// PREVIOUS PAGE
// ============================================================

prevBtn.addEventListener(
    "click",
    async function () {

        if (currentPage <= 0) {
            return;
        }


        currentPage--;


        await loadUsers();

    }
);


// ============================================================
// NEXT PAGE
// ============================================================

nextBtn.addEventListener(
    "click",
    async function () {

        if (
            totalPages > 0 &&
            currentPage >= totalPages - 1
        ) {

            return;
        }


        currentPage++;


        await loadUsers();

    }
);


// ============================================================
// APPLY PAGINATION + SORTING
// ============================================================

applyBtn.addEventListener(
    "click",
    async function () {

        // Read selected values
        pageSize =
            Number(pageSizeSelect.value);


        sortBy =
            sortBySelect.value;


        sortOrder =
            sortOrderSelect.value;


        // Always return to first page
        currentPage = 0;


        // Load new data
        await loadUsers();


        showToast(
            "Pagination and sorting applied",
            "success"
        );

    }
);


// ============================================================
// REFRESH USER LIST
// ============================================================

refreshBtn.addEventListener(
    "click",
    async function () {

        // Temporarily disable button
        refreshBtn.disabled = true;


        try {

            await loadUsers();


            showToast(
                "User list refreshed",
                "success"
            );


        } finally {

            refreshBtn.disabled = false;

        }

    }
);


// ============================================================
// ADD USER
// ============================================================

userForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get values
        const uid =
            uidInput.value.trim();


        const name =
            nameInput.value.trim();


        // ====================================================
        // VALIDATION
        // ====================================================

        if (!uid) {

            showToast(
                "Please enter a UID",
                "error"
            );

            uidInput.focus();

            return;
        }


        if (!name) {

            showToast(
                "Please enter a name",
                "error"
            );

            nameInput.focus();

            return;
        }


        // Disable button while adding
        const submitBtn =
            userForm.querySelector(
                'button[type="submit"]'
            );


        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.textContent =
                "Adding...";
        }


        try {

            // =================================================
            // SEND POST REQUEST
            // =================================================

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
                            JSON.stringify({

                                uid: uid,

                                name: name

                            })

                    }
                );


            // =================================================
            // HANDLE ERROR
            // =================================================

            if (!response.ok) {

                let errorMessage =
                    "Unable to add user";


                try {

                    const errorData =
                        await response.json();


                    if (errorData.message) {

                        errorMessage =
                            errorData.message;
                    }

                } catch (error) {

                    // Response was not JSON
                }


                throw new Error(
                    errorMessage
                );
            }


            // =================================================
            // SUCCESS
            // =================================================

            console.log(
                "User added successfully"
            );


            // Clear form
            userForm.reset();


            // Go to first page
            currentPage = 0;


            // Reload users
            await loadUsers();


            showToast(
                "User added successfully",
                "success"
            );


        } catch (error) {

            console.error(
                "Error adding user:",
                error
            );


            showToast(
                error.message ||
                "Failed to add user",
                "error"
            );


        } finally {

            // Enable button again

            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.textContent =
                    "+ Add User";
            }

        }

    }
);


// ============================================================
// DELETE USER
// ============================================================

async function deleteUser(uid) {

    // Confirm deletion
    const confirmed =
        confirm(
            `Are you sure you want to delete user ${uid}?`
        );


    if (!confirmed) {

        return;
    }


    try {

        // =====================================================
        // SEND DELETE REQUEST
        // =====================================================

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(uid)}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }


        // =====================================================
        // CHECK IF CURRENT PAGE BECOMES EMPTY
        // =====================================================

        if (
            currentPage > 0 &&
            userTableBody.children.length === 1
        ) {

            currentPage--;

        }


        // Reload users
        await loadUsers();


        showToast(
            "User deleted successfully",
            "success"
        );


    } catch (error) {

        console.error(
            "Error deleting user:",
            error
        );


        showToast(
            "Failed to delete user",
            "error"
        );

    }
}


// ============================================================
// SHOW LOADING
// ============================================================

function showLoading() {

    loading.classList.remove("hidden");

    tableContainer.classList.add("hidden");

    emptyState.classList.add("hidden");
}


// ============================================================
// HIDE LOADING
// ============================================================

function hideLoading() {

    loading.classList.add("hidden");
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError() {

    tableContainer.classList.add("hidden");

    emptyState.classList.remove("hidden");


    emptyState.innerHTML = `

        <div class="empty-icon">
            ⚠️
        </div>

        <h3>
            API Connection Failed
        </h3>

        <p>
            Make sure the Spring Boot server
            is running on port 8080.
        </p>

        <button
            type="button"
            onclick="loadUsers()">

            🔄 Try Again

        </button>

    `;
}


// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(
    message,
    type = "success"
) {

    // Set message
    toastMessage.textContent =
        message;


    // Set icon
    if (type === "error") {

        toastIcon.textContent = "✕";

    } else {

        toastIcon.textContent = "✓";

    }


    // Show toast
    toast.classList.add("show");


    // Automatically hide
    setTimeout(
        function () {

            toast.classList.remove("show");

        },
        2800
    );
}


// ============================================================
// ESCAPE HTML
// Prevent HTML injection
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// ============================================================
// KEYBOARD SHORTCUT
// Enter on filters = Apply
// ============================================================

[
    pageSizeSelect,
    sortBySelect,
    sortOrderSelect
].forEach(
    function (element) {

        element.addEventListener(
            "change",
            function () {

                // No automatic API request.
                // User clicks Apply.

            }
        );

    }
);


// ============================================================
// INITIAL APPLICATION LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Make sure default values
        // match application state

        if (pageSizeSelect) {

            pageSizeSelect.value =
                String(pageSize);
        }


        if (sortBySelect) {

            sortBySelect.value =
                sortBy;
        }


        if (sortOrderSelect) {

            sortOrderSelect.value =
                sortOrder;
        }


        // Load users
        loadUsers();

    }
);