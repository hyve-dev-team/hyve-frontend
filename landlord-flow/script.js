const app = document.getElementById("app");

const style = document.createElement("style");

style.textContent = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

body {
    background: #fff;
    color: #555;
}

.app{
    display: flex;
    min-height: 100vh;
} 

.sidebar {
    width: 18%;
    background: #fff5ef;
    padding: 35px 14px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.logout-btn {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 4px;
    font-size: 15px;
    color: #888;
    cursor: pointer;
}

.logout-btn:hover {
    background: #ffe8da;
    color: #ff6500;
}

.logo {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: 9px;
    margin-bottom: 38px;
}

.logo-icon {
    color: #ff6500;
    font-size: 35px;
    font-weight: bold;
}

.logo-text {
    font-size: 30px;
    color: #333;
}

.menu-title {
    font-size: 15px;
    color: #aaa;
    margin: 0 0 8px 7px;
}

.menu-item {
    height: 28px;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 0 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    font-size: 15px;
    color: #888;
    cursor: pointer;
}

.placeholder-page {
    display: none;
    flex: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #aaa;
    font-size: 16px;
    text-align: center;
    gap: 6px;
}

.menu-item:hover {
    background: #ffe8da;
    color: #ff6500;
}

.menu-item.active {
    background: #ffe3d3;
    color: #ff6500;
}

.menu-icon {
    width: 10px;
    text-align: center;
}

.upload-info {
    margin-top: 105px;
    background: white;
    border-radius: 8px;
    padding: 12px 7px;
    text-align: center;
    box-shadow: 0 1px 8px rgba(0,0,0,.02);
}

.upload-info p {
    font-size: 10px;
    line-height: 13px;
    color: #777;
    margin-bottom: 8px;
}

.upload-btn {
    border: none;
    background: #ff6500;
    color: white;
    width: 100%;
    height: 37px;
    border-radius: 22px;
    font-size: 13px;
    cursor: pointer;
}

.upload-btn:hover {
    background: #e95a00;
}

.main {
    flex: 1;
    display: flex;
    justify-content: center;
    padding-top: 37px;
}

.content {
    width: 82%;
    display: grid;
    grid-template-columns: 225px 1fr;
    gap: 45px;
}

.form-section {
    width: 225px;
}

.input-box,
textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
    font-size: 9px;
    color: #555;
    background: white;
}

.input-box {
    height: 36px;
    padding: 0 12px;
    margin-bottom: 7px;
}

.input-box:focus,
textarea:focus {
    border-color: #ff9a67;
}

textarea {
    height: 50px;
    padding: 12px;
    resize: none;
}

.input-wrapper {
    position: relative;
}

.input-wrapper span {
    position: absolute;
    right: 13px;
    top: 11px;
    color: #aaa;
    font-size: 11px;
}

.char-count {
    text-align: right;
    font-size: 7px;
    color: #555;
    margin-top: 2px;
}

.add-property {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.add-circle {
    width: 147px;
    height: 147px;
    border-radius: 50%;
    background: #ffe3d2;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: .2s;
}

.add-circle:hover {
    transform: scale(1.03);
}

.add-inner {
    width: 107px;
    height: 107px;
    border-radius: 50%;
    background: #ffd0b2;
    display: flex;
    justify-content: center;
    align-items: center;
}

.plus {
    color: white;
    font-size: 60px;
    font-weight: 200;
    line-height: 1;
}

.add-title {
    font-size: 8px;
    color: #222;
    margin-top: 28px;
}

.upload-note {
    font-size: 7px;
    color: #ff6500;
    margin-top: 75px;
}

.media-section {
    grid-column: 1 / 3;
    display: flex;
    gap: 6px;
    margin-top: -23px;
}

.media-box {
    width: 72px;
    height: 66px;
    background: #fff5ef;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
}

.media-box:hover {
    background: #ffece2;
}

.media-plus {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffe2d1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
}

.play-box {
    width: 105px;
    height: 105px;
    background: #fff7f3;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.play-box img {
    width: 65px;
    height: 65px;
}

.media-box img,
.media-box video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

@media (max-width: 700px) {

    .sidebar {
        width: 110px;
    }

    .content {
        width: 90%;
        grid-template-columns: 1fr;
    }

    .media-section {
        grid-column: 1;
    }

    .add-property {
        display: none;
    }
}
    `;

document.head.appendChild(style);

const AMENITIES_OPTIONS = [
    "Parking",
    "Swimming Pool",
    "Security",
    "Gym",
    "WiFi",
    "Generator"
];

function buildAmenitiesDropdown() {
    const checkboxes = AMENITIES_OPTIONS.map((item) => `
        <label>
            <input type="checkbox" value="${item}">
            ${item}
        </label>
    `).join("");

    return `
        <div class="dropdown" id="amenitiesDropdown">
            <div class="input-box dropdown-selected" id="amenitiesSelected">Amenities ▾</div>
            <div class="dropdown-menu" id="amenitiesMenu">
                ${checkboxes}
            </div>
        </div>
    `;
}

const UPLOAD_ENDPOINT = "https://api.example.com/upload"; // TODO: replace with your real endpoint

async function uploadFiles(files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
        const response = await fetch(UPLOAD_ENDPOINT, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

        return await response.json(); // expected shape: { urls: [...] }
    } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload files. Please try again.");
        return null;
    }
}

app.innerHTML = `
<div class="app">
    <aside class="sidebar">
        <div class="logo">
            <span class="logo-icon">H</span>
            <span class="logo-text">HYVE</span>
        </div>
        <div class="menu-title">MENU</div>
        <div class="menu-item active" data-page="home">
            <span class="menu-icon">
                <img src="./assets/home.png" alt="Home Icon" width="20" height="20">
            </span>
            <span>Home</span>
        </div>
        <div class="menu-item" data-page="chat">
            <span class="menu-icon">💬</span>
            <span>Chat</span>
        </div>
        <div class="menu-item" data-page="notifications">
            <span class="menu-icon">🔔</span>
            <span>Notifications</span>
        </div>
        <div class="menu-item">
            <span class="menu-icon">
                <img src="./assets/shopping-cart.png" alt="Saved Icon" width="20" height="20">
            </span>
            <span>Saved</span>
        </div>

        <div class="menu-item">
            <span class="menu-icon">
                <img src="./assets/profile.png" alt="Profile Icon" width="20" height="20">
            </span>
            <span>Profile</span>
        </div>

        <div class="menu-item">
            <span class="menu-icon">
                <img src="./assets/search.png" alt="Search Icon" width="20" height="20">
            </span>
            <span>Search</span>
        </div>

        <div class="upload-info">
            <p>
                After files upload and<br>
                details filled, please<br>
                upload here.
            </p>

            <button class="upload-btn" id="uploadButton">
                Upload
            </button>

            <input
                type="file"
                id="fileInput"
                hidden
                accept="image/png,image/jpeg,image/webp,video/*"
            >
        </div>
        <div class="logout-btn" id="logoutBtn">
            <span class="menu-icon">⎋</span>
            <span>Logout</span>
        </div>

    </aside>


    <main class="main">

        <div class="content">

            <!-- FORM -->
            <section class="form-section">

                <input
                    class="input-box"
                    id="propertyName"
                    type="text"
                    placeholder="Property Name"
                >

                <div class="input-wrapper">
                    <input
                        class="input-box"
                        id="price"
                        type="text"
                        inputmode="numeric"
                        placeholder="Price, ₦"
                    >
                </div>

                <div class="input-wrapper">
                    <input
                        class="input-box"
                        id="location"
                        type="text"
                        placeholder="⌾  Location"
                    >
                    <span>⊗</span>
                </div>

                <div class="input-wrapper">
                    <input
                        class="input-box"
                        id="condition"
                        type="text"
                        placeholder="Condition"
                    >
                    <span>›</span>
                </div>

                <input
                    class="input-box"
                    id="propertySize"
                    type="text"
                    inputmode="numeric"
                    placeholder="Property Size (sqm)"
                >

                <input 
                    class="input-box"
                    id="minRentalPeriod"
                    type="text"
                    placeholder="Minimum Rental Period (e.g. 6months)"
                >

                ${buildAmenitiesDropdown()}

                <textarea
                    id="description"
                    maxlength="500"
                    placeholder="Description"
                ></textarea>

                <div class="char-count">
                    <span id="charCount">0</span>/500
                </div>

            </section>


            <!-- ADD PROPERTY -->
            <section class="add-property">

                <div class="add-circle" id="addProperty">
                    <div class="add-inner">
                        <span class="plus">+</span>
                    </div>
                </div>

                <div class="add-title">
                    ADD PROPERTY
                </div>

                <div class="upload-note">
                    Upload 6 images, and 1 video of Property
                </div>

            </section>


            <!-- MEDIA -->
            <section class="media-section" id="mediaSection">

                <div class="media-box" data-index="0">
                    <div class="media-plus">+</div>
                </div>

                <div class="media-box" data-index="1">
                    <div class="media-plus">+</div>
                </div>

                <div class="media-box" data-index="2">
                    <div class="media-plus">+</div>
                </div>

                <div class="media-box" data-index="3">
                    <div class="media-plus">+</div>
                </div>

                <div class="media-box" data-index="4">
                    <div class="media-plus">+</div>
                </div>

                <div class="media-box" data-index="5">
                    <div class="media-plus">
                        <div class="play-box">
                            <img src="play.svg" alt="Play button">
                        </div>
                    </div>
                </div>

            </section>

        </div>

    </main>

    <section class="placeholder-page" id="page-chat">
        <h2>Chat</h2>
        <p>Chat Module coming soon...</p>
    </section>
    <section class="placeholder-page" id="page-notifications">
        <h2>Notifications</h2>
        <p>Notifications Module coming soon...</p>
    </section>
</div>
`;

const menuItems = document.querySelectorAll(".menu-item[data-page]");
const mainPage = document.querySelector(".main");

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menuItems.forEach((el) => el.classList.remove("active"));
        item.classList.add("active");

        const page = item.dataset.page;

        mainPage.style.display = page === "home" ? "flex" : "none";

        document.querySelectorAll(".placeholder-page").forEach((sec) => {
            sec.style.display = "none";
        });

        if (page !== "home") {
            const target = document.getElementById(`page-${page}`);
            if (target) target.style.display = "flex";
        }
    });
});


// =================================
// 3. NUMBER-ONLY INPUTS (price & property size)
// =================================

const priceInput = document.getElementById("price");
priceInput.addEventListener("input", () => {
    priceInput.value = priceInput.value.replace(/[^0-9]/g, "");
});

const propertySizeInput = document.getElementById("propertySize");
propertySizeInput.addEventListener("input", () => {
    propertySizeInput.value = propertySizeInput.value.replace(/[^0-9]/g, "");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login.html";
});


// =================================
// 4. DESCRIPTION CHARACTER COUNTER
// =================================

const description = document.getElementById("description");
const charCount = document.getElementById("charCount");

description.addEventListener("input", () => {
    charCount.textContent = description.value.length;
});


// =================================
// 5. AMENITIES DROPDOWN
// =================================

const amenitiesSelected = document.getElementById("amenitiesSelected");
const amenitiesMenu = document.getElementById("amenitiesMenu");
let selectedAmenities = [];

amenitiesSelected.addEventListener("click", () => {
    amenitiesMenu.classList.toggle("open");
});

amenitiesMenu.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", () => {
        selectedAmenities = Array.from(
            amenitiesMenu.querySelectorAll("input:checked")
        ).map((el) => el.value);

        amenitiesSelected.textContent = selectedAmenities.length
            ? selectedAmenities.join(", ")
            : "Amenities ▾";
    });
});

document.addEventListener("click", (e) => {
    if (!document.getElementById("amenitiesDropdown").contains(e.target)) {
        amenitiesMenu.classList.remove("open");
    }
});


// =================================
// 6. FILE UPLOAD
// =================================

const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const mediaBoxes = document.querySelectorAll(".media-box");

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];

let uploadedFiles = [];

uploadButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {

    const files = Array.from(fileInput.files).filter(
        (file) => allowedImageTypes.includes(file.type) || file.type.startsWith("video/")
    );

    uploadedFiles = files;

    files.slice(0, 6).forEach((file, index) => {

        const box = mediaBoxes[index];

        if (!box) return;

        const url = URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {

            box.innerHTML = `
                <img src="${url}" alt="Property image">
            `;

        } else if (file.type.startsWith("video/")) {

            box.innerHTML = `
                <video src="${url}" muted></video>
            `;
        }

    });

});


// =================================
// 7. CLICK MEDIA BOX TO UPLOAD
// =================================

mediaBoxes.forEach((box) => {

    box.addEventListener("click", () => {
        fileInput.click();
    });

});


// =================================
// 8. ADD PROPERTY BUTTON
// =================================

document.getElementById("addProperty").addEventListener("click", async () => {

    const property = {

        name: document.getElementById("propertyName").value,

        price: document.getElementById("price").value,

        location: document.getElementById("location").value,

        condition: document.getElementById("condition").value,

        propertySize: document.getElementById("propertySize").value,

        minRentalPeriod: document.getElementById("minRentalPeriod").value,

        amenities: selectedAmenities,

        description: document.getElementById("description").value,

        files: uploadedFiles

    };

    // Basic validation
    if (!property.name) {
        alert("Please enter the property name.");
        return;
    }

    if (!property.price) {
        alert("Please enter the property price.");
        return;
    }

    if (!property.location) {
        alert("Please enter the property location.");
        return;
    }

    if (!property.description) {
        alert("Please enter a property description.");
        return;
    }


     let uploadResult = null;
    if (uploadedFiles.length) {
        uploadResult = await uploadFiles(uploadedFiles);
    }
    property.mediaUrls = uploadResult ? uploadResult.urls : [];


    console.log("PROPERTY CREATED:", property);

    alert("Property added successfully!");

});    