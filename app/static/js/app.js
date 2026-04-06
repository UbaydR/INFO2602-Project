
async function getUserData(){
    const response = await fetch('/api/users');
    return response.json();
}

function loadTable(users){
    const table = document.querySelector('#result');
    for(let user of users){
        table.innerHTML += `<tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
        </tr>`;
    }
}

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

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        document.getElementById("lat").value = lat;
        document.getElementById("lng").value = lng;
    });
}


async function main(){
    initMap();

    const users = await getUserData();
    loadTable(users);
}

main();