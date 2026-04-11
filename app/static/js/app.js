// Store map + markers globally
let map;
const markers = {};

//map functionality
async function initMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    map = L.map('map').setView([10.6417, -61.3995], 16);

    //wms server down so changed to OpenStreetMap tiles for now
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    await loadFoodPlaceMarkers();

    let tempMarker;

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        tempMarker = L.marker([lat, lng]).addTo(map);

        window._marker = tempMarker;

        tempMarker.bindPopup(
            `<b>Add New Food Place</b><br>
             <a href="#" onclick="openForm(${lat}, ${lng}); return false;">
             Click here</a>`
        ).openPopup();
    });
}

//load existing food places from backend and add to map
async function loadFoodPlaceMarkers() {
    try {
        const response = await fetch('/api/food-places');
        const places = await response.json();

        for (const place of places) {
            const marker = L.marker([place.latitude, place.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${place.name}</b><br>
                    <a href="#" onclick="viewPlace(${place.id}); return false;">View</a> |
                    <a href="#" style="color:red;" onclick="deletePlace(${place.id}); return false;">Delete</a>
                `);

            markers[place.id] = marker;
        }
    } catch (err) {
        console.error("Failed to load food places:", err);
    }
}

//delete food place by id
async function deletePlace(id) {
    if (!confirm("Delete this food place?")) return;

    try {
        const response = await fetch(`/admin/food-places/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // Remove marker instantly
            if (markers[id]) {
                map.removeLayer(markers[id]);
                delete markers[id];
            }

            // Clear side panel
            const panel = document.getElementById("panel-content");
            if (panel) {
                panel.innerHTML = `<p class="text-success">✓ ${place.name} deleted!</p>`;
            }

        } else {
            alert("Failed to delete.");
        }

    } catch (err) {
        console.error("Delete error:", err);
        alert("Network error.");
    }
}

//view food place details in side panel
async function viewPlace(id) {
    try {
        const response = await fetch(`/api/food-places/${id}`);
        const place = await response.json();

        const panel = document.getElementById("panel-content");

        panel.innerHTML = `
            ${place.place_url ? `<img src="${place.place_url}" class="img-fluid mb-2"/>` : ""}
            <h5>${place.name}</h5>
            <p>${place.description || "No description"}</p>

            ${place.menu_url 
                ? `<p><a href="${place.menu_url}" target="_blank">View Menu</a></p>` 
                : ""}

            <p>
                Lat: ${place.latitude}<br>
                Lng: ${place.longitude}
            </p>

            <div class="mt-3">
                <button class="btn btn-warning w-100"
                    onclick='openEditForm(${JSON.stringify(place)})'>
                    Edit Food Place
                </button>
            </div>
        `;
    } catch (err) {
        console.error("View error:", err);
    }
}

//open form to add new food place at given lat/lng
function openForm(lat, lng) {
    const marker = window._marker;
    const panel = document.getElementById("panel-content");

    panel.innerHTML = `
        <h6>Add Food Place</h6>

        <form id="food-place-form" enctype="multipart/form-data">

            <input type="text" name="name" placeholder="Name" required class="form-control mb-2">

            <textarea name="description" placeholder="Description" class="form-control mb-2"></textarea>

            <input type="file" name="place_image" class="form-control mb-2">
            <input type="file" name="menu_image" class="form-control mb-2">

            <input type="hidden" name="latitude" value="${lat}">
            <input type="hidden" name="longitude" value="${lng}">

            <button type="submit" class="btn btn-success w-100">Add</button>
        </form>
    `;

    document.getElementById("food-place-form").addEventListener("submit", async function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch("/admin/food-places", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();

                map.removeLayer(marker);

                const newMarker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`
                        <b>${formData.get("name")}</b><br>
                        <a href="#" onclick="viewPlace(${result.id}); return false;">View</a> |
                        <a href="#" style="color:red;" onclick="deletePlace(${result.id}); return false;">Delete</a>
                    `)
                    .openPopup();

                markers[result.id] = newMarker;

                panel.innerHTML = `<p class="text-success">✓ Added ${place.name} successfully</p>`;
            }

        } catch (err) {
            console.error("Add error:", err);
        }
    });
}

//open form to edit existing food place on side panel
function openEditForm(place) {
    const panel = document.getElementById("panel-content");

    panel.innerHTML = `
        <h6>Edit Food Place</h6>

        <form id="edit-form" enctype="multipart/form-data">

            <input type="text" name="name" value="${place.name}" class="form-control mb-2">

            <textarea name="description" class="form-control mb-2">${place.description || ""}</textarea>

            <input type="file" name="place_image" class="form-control mb-2">
            <input type="file" name="menu_image" class="form-control mb-2">

            <input type="hidden" name="latitude" value="${place.latitude}">
            <input type="hidden" name="longitude" value="${place.longitude}">

            <button type="submit" class="btn btn-primary w-100">Update</button>
        </form>
    `;

    document.getElementById("edit-form").addEventListener("submit", async function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch(`/admin/food-places/${place.id}`, {
                method: "PUT",
                body: formData
            });

            if (response.ok) {
                const updated = await response.json();

                // Update marker popup content if name changed
                if (markers[place.id]) {
                    markers[place.id].setPopupContent(`
                        <b>${updated.name}</b><br>
                        <a href="#" onclick="viewPlace(${updated.id}); return false;">View</a> |
                        <a href="#" style="color:red;" onclick="deletePlace(${updated.id}); return false;">Delete</a>
                    `);
                }

                panel.innerHTML = `<p class="text-success">✓ Updated successfully</p>`;
            }

        } catch (err) {
            console.error("Update error:", err);
        }
    });
}

initMap(); 