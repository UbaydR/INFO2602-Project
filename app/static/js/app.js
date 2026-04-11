//map functionality
async function initMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    var map = L.map('map').setView([10.6417, -61.3995], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Load existing saved places as markers
    await loadFoodPlaceMarkers(map);

    var marker;

    map.on('click', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        window._map = map;
        window._marker = marker;

        marker.bindPopup(
            "<b>New Food Place</b><br>" +
            "<a href='#' onclick='openForm(" + lat + ", " + lng + "); return false;'>Click here to add</a>"
        ).openPopup();
    });
}

async function loadFoodPlaceMarkers(map) {
    try {
        const response = await fetch('/api/food-places');
        const places = await response.json();

        for (const place of places) {
            L.marker([place.latitude, place.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${place.name}</b><br>
                    <a href="/api/food-places/${place.id}" onclick="viewPlace(${place.id}); return false;">View</a> &nbsp;|&nbsp;
                    <a href="/api/food-places/${place.id}" style="color:red;" onclick="deletePlace(${place.id}); return false;">Delete</a>
                `);
        }
    } catch (err) {
        console.error("Failed to load food places:", err);
    }
}

async function deletePlace(id) {
    if (!confirm("Delete this food place?")) return;

    try {
        const response = await fetch(`/admin/food-places/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            location.reload();
        } else {
            alert("Failed to delete. Please try again.");
        }

    } catch (err) {
        console.error("Delete error:", err);
        alert("Network error. Please try again.");
    }
}

async function viewPlace(id) {
    try {
        const response = await fetch(`/api/food-places/${id}`);
        const place = await response.json();

        const panel = document.getElementById("panel-content");

        panel.innerHTML = `
            ${
                place.place_url 
                ? `<img src="${place.place_url}" class="img-fluid mb-2"/>` 
                : ""
            }
            <h5>${place.name}</h5>
            <p>${place.description || "No description"}</p>

            ${
                place.menu_url 
                ? `<p><a href="${place.menu_url}" target="_blank">View Menu</a></p>` 
                : ""
            }

            <p class="text">
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

function openForm(lat, lng) {
    const map = window._map;
    const marker = window._marker;

    const panel = document.getElementById("panel-content");
    if (!panel) return;

    panel.innerHTML = `
        <h6>Add Food Place</h6>

        <form id="food-place-form" enctype="multipart/form-data">

            <div class="mb-2">
                <input type="text" name="name" placeholder="Food Place Name" required class="form-control">
            </div>

            <div class="mb-2">
                <textarea name="description" placeholder="Description" class="form-control"></textarea>
            </div>

            <div class="mb-2">
                <label class="form-label small">Food Place Image</label>
                <input type="file" name="place_image" accept="image/*" class="form-control">
            </div>

            <div class="mb-2">
                <label class="form-label small">Menu Image</label>
                <input type="file" name="menu_image" accept="image/*" class="form-control">
            </div>

            <input type="hidden" name="latitude" value="${lat}">
            <input type="hidden" name="longitude" value="${lng}">

            <p class="small text-muted">
                Lat: ${lat.toFixed(6)} <br>
                Lng: ${lng.toFixed(6)}
            </p>

            <button type="submit" class="btn btn-success w-100">Add Food Place</button>

        </form>

        <div id="form-message" class="mt-2"></div>
    `;

    document.getElementById("food-place-form").addEventListener("submit", async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const name = formData.get("name");

        try {
            const response = await fetch("/admin/food-places", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json(); 
    
   
                map.removeLayer(marker); 

  
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`<b>${name}</b><br>
                        <a href="/api/food-places/${result.id}" onclick="viewPlace(${result.id}); return false;">View</a><br> &nbsp;|&nbsp;
                        <a href="/api/food-places/${result.id}" style="color:red;" onclick="deletePlace(${result.id}); return false;">Delete</a>`)
                    .openPopup();

                //eventually change to the flash message leave for now
                panel.innerHTML = `<p class="text-success" fw-semibold>✓ ${name} added successfully!</p>`;
}

        } catch (err) {
            console.error("Submit error:", err);
            document.getElementById("form-message").innerHTML =
                `<p class="text-danger small">Network error. Please try again.</p>`;
        }
    });
}

function openEditForm(place) {
    const panel = document.getElementById("panel-content");

    panel.innerHTML = `
        <h6>Edit Food Place</h6>

        <form id="edit-food-place-form" enctype="multipart/form-data">

            <div class="mb-2">
                <input type="text" name="name" value="${place.name}" required class="form-control">
            </div>

            <div class="mb-2">
                <textarea name="description" class="form-control">${place.description || ""}</textarea>
            </div>

            <div class="mb-2">
                <label class="form-label small">Replace Food Place Image</label>
                <input type="file" name="place_image" class="form-control">
            </div>

            <div class="mb-2">
                <label class="form-label small">Replace Menu Image</label>
                <input type="file" name="menu_image" class="form-control">
            </div>

            <input type="hidden" name="latitude" value="${place.latitude}">
            <input type="hidden" name="longitude" value="${place.longitude}">

            <button type="submit" class="btn btn-primary w-100">
                Update Food Place
            </button>

        </form>

        <div id="form-message" class="mt-2"></div>
    `;

    document.getElementById("edit-food-place-form")
        .addEventListener("submit", async function(e) {
            e.preventDefault();

            const formData = new FormData(this);

            try {
                const response = await fetch(`/admin/food-places/${place.id}`, {
                    method: "PUT",
                    body: formData
                });

                if (response.ok) {
                    const updated = await response.json();

                    document.getElementById("panel-content").innerHTML =
                        `<p class="text-success">✓ Updated ${updated.name} successfully!</p>`;

                    // reload markers so changes reflect
                    location.reload();  
                }

            } catch (err) {
                console.error("Update error:", err);
            }
        });
}

async function main() {
    await initMap();
}

main();