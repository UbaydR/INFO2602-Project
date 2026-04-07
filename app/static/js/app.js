//map functionality
function initMap(){
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return; 

    var map = L.map('map').setView([10.6417, -61.3995], 16);

    
    L.tileLayer.wms("https://geoserver.sundaebytestt.com/geoserver/osm/wms", {
        layers: 'osm:osm_nohouse',
        format: 'image/png',
        transparent: true
    }).addTo(map);

    var marker;

    map.on('click', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        console.log("Clicked location:", lat, lng);

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup("<b>Add new Food Place!</b><br>" +
            "<a href='#' onclick='openForm(" + lat + ", " + lng + "); return false;'>Click here to add</a>").openPopup();
  
    });
}

//adding new food place form 
function openForm(lat, lng) {
    console.log("Opening form for:", lat, lng);

    const panel = document.getElementById("panel-content");
    if (!panel) return;

    panel.innerHTML = `
        <h6>Add Food Place</h6>

        <form method="POST" action="/admin/food-places">

            <!-- FOOD PLACE NAME -->
            <div class="mb-2">
                <input type="text" name="name" placeholder="Food Place Name" required class="form-control">
            </div>

            <!-- DESCRIPTION -->
            <div class="mb-2">
                <textarea name="description" placeholder="Description" class="form-control"></textarea>
            </div>

            <!-- FOOD PLACE IMAGE -->
            <div class="mb-2">
                <label class="form-label small">Food Place Image</label>
                <input type="file" name="place_image" accept="image/*" class="form-control">
            </div>

            <!-- MENU IMAGE -->
            <div class="mb-2">
                <label class="form-label small">Menu Image</label>
                <input type="file" name="menu_image" accept="image/*" class="form-control">
            </div>

            <!-- COORDINATES -->
            <input type="hidden" name="latitude" value="${lat}">
            <input type="hidden" name="longitude" value="${lng}">

            <p class="small text-muted">
                Lat: ${lat.toFixed(6)} <br>
                Lng: ${lng.toFixed(6)}
            </p>

            <button type="submit" class="btn btn-success w-100">
                Add Food Place
            </button>
        </form>
    `;
}

async function main(){
    initMap();
}

main();