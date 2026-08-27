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

app.innerHTML = `
<div class="app">
    <aside class="sidebar">
        <div class="logo">
            <span class="logo-icon">H</span>
            <span class="logo-text">HYVE</span>
        </div>
        <div class="menu-title">MENU</div>
        <div class="menu-item active">
            <span class="menu-icon">
                <img src="./assets/home.png" alt="Home Icon" width="20" height="20">
            </span>
            <span>Home</span>
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
                accept="image/*,video/*"
            >
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
                        type="number"
                        placeholder="Price, ₦"
                    >
                    <span>›</span>
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

                <input
                    class="input-box"
                    id="address"
                    type="text"
                    placeholder="Address"
                >

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
                    id="amenities"
                    type="text"
                    placeholder="Amenities"
                >

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
                    <div class="media-plus">▶</div>
                </div>

            </section>

        </div>

    </main>

</div>
`;


// =================================
// 3. DESCRIPTION CHARACTER COUNTER
// =================================

const description = document.getElementById("description");
const charCount = document.getElementById("charCount");

description.addEventListener("input", () => {
    charCount.textContent = description.value.length;
});


// =================================
// 4. FILE UPLOAD
// =================================

const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const mediaBoxes = document.querySelectorAll(".media-box");

let uploadedFiles = [];

uploadButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {

    const files = Array.from(fileInput.files);

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
// 5. CLICK MEDIA BOX TO UPLOAD
// =================================

mediaBoxes.forEach((box) => {

    box.addEventListener("click", () => {
        fileInput.click();
    });

});


// =================================
// 6. ADD PROPERTY BUTTON
// =================================

document.getElementById("addProperty").addEventListener("click", () => {

    const property = {

        name: document.getElementById("propertyName").value,

        price: document.getElementById("price").value,

        location: document.getElementById("location").value,

        address: document.getElementById("address").value,

        condition: document.getElementById("condition").value,

        amenities: document.getElementById("amenities").value,

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


    console.log("PROPERTY CREATED:", property);

    alert("Property added successfully!");

});    