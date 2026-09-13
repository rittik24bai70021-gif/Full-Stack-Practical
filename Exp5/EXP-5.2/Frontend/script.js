const API_URL = "http://localhost:8080/api/users";


// ==========================================
// MESSAGE DISPLAY
// ==========================================

function showMessage(message, type) {

    const messageBox = document.getElementById("message");

    messageBox.textContent = message;

    messageBox.className = `message ${type}`;

    setTimeout(() => {
        messageBox.className = "message hidden";
    }, 4000);
}


// ==========================================
// LOAD ALL USERS
// ==========================================

async function loadUsers() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        const tableBody =
            document.getElementById("userTableBody");

        tableBody.innerHTML = "";

        const users = result.data || [];

        document.getElementById("totalUsers").textContent =
            users.length;


        if (users.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }


        users.forEach(user => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${user.id}</td>

                <td>${user.uid}</td>

                <td>${user.name}</td>

                <td>

                    <button
                        class="btn edit"
                        onclick="editUser(${user.id}, '${user.uid}', '${user.name}')">
                        Edit
                    </button>

                    <button
                        class="btn danger"
                        onclick="deleteUser(${user.id})">
                        Delete
                    </button>

                </td>

            `;

            tableBody.appendChild(row);

        });

    }
    catch (error) {

        showMessage(
            "Unable to connect to the backend.",
            "error"
        );

        console.error(error);
    }
}


// ==========================================
// ADD USER
// ==========================================

document
    .getElementById("userForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const uid =
            document.getElementById("uid").value.trim();

        const name =
            document.getElementById("name").value.trim();


        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    uid: uid,
                    name: name
                })

            });


            const result = await response.json();


            if (!response.ok) {

                showMessage(
                    result.message || "Failed to create user.",
                    "error"
                );

                return;
            }


            showMessage(
                result.message,
                "success"
            );


            document.getElementById("userForm").reset();

            loadUsers();

        }
        catch (error) {

            showMessage(
                "Backend connection failed.",
                "error"
            );

            console.error(error);
        }

    });


// ==========================================
// SEARCH USER
// ==========================================

async function searchUser() {

    const id =
        document.getElementById("searchId").value.trim();


    if (!id) {

        showMessage(
            "Please enter a user ID.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        const result =
            await response.json();


        const resultBox =
            document.getElementById("searchResult");


        if (!response.ok) {

            resultBox.innerHTML = `
                <div class="result-card">
                    ❌ <strong>${result.message}</strong>
                </div>
            `;

            return;
        }


        const user = result.data;


        resultBox.innerHTML = `

            <div class="result-card">

                <strong>User Found</strong>

                <p>ID: ${user.id}</p>

                <p>UID: ${user.uid}</p>

                <p>Name: ${user.name}</p>

            </div>

        `;

    }
    catch (error) {

        showMessage(
            "Unable to connect to backend.",
            "error"
        );

        console.error(error);
    }
}


// ==========================================
// EDIT USER
// ==========================================

function editUser(id, uid, name) {

    const newUid =
        prompt("Enter new UID:", uid);

    if (newUid === null) {
        return;
    }


    const newName =
        prompt("Enter new name:", name);

    if (newName === null) {
        return;
    }


    updateUser(id, newUid, newName);
}


// ==========================================
// UPDATE USER
// ==========================================

async function updateUser(id, uid, name) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    uid: uid,
                    name: name
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            showMessage(
                result.message || "Update failed.",
                "error"
            );

            return;
        }


        showMessage(
            result.message,
            "success"
        );


        loadUsers();

    }
    catch (error) {

        showMessage(
            "Backend connection failed.",
            "error"
        );

        console.error(error);
    }
}


// ==========================================
// DELETE USER
// ==========================================

async function deleteUser(id) {

    const confirmation =
        confirm("Are you sure you want to delete this user?");


    if (!confirmation) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            showMessage(
                result.message || "Delete failed.",
                "error"
            );

            return;
        }


        showMessage(
            result.message,
            "success"
        );


        loadUsers();

    }
    catch (error) {

        showMessage(
            "Backend connection failed.",
            "error"
        );

        console.error(error);
    }
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadUsers();