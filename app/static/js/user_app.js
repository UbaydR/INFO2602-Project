// User-side map and review functionality
let map;
const markers = {};

async function initUserMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    map = L.map('map').setView([10.6417, -61.3995], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    await loadFoodPlaceMarkers();
}

// Load existing food places and add markers in view-only
async function loadFoodPlaceMarkers() {
    try {
        const response = await fetch('/api/food-places');
        const places = await response.json();

        for (const place of places) {
            const marker = L.marker([place.latitude, place.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${place.name}</b><br>
                    <a href="#" onclick="viewPlace(${place.id}); return false;">View Details</a>
                `);

            markers[place.id] = marker;
        }
    } catch (err) {
        console.error("Failed to load food places:", err);
    }
}

//star rating display
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="material-symbols-outlined" style="color: #ffc107; font-size: 18px;">star</span>';
        } else {
            stars += '<span class="material-symbols-outlined" style="color: #ccc; font-size: 18px;">star</span>';
        }
    }
    return stars;
}

//function for avg rating
function computeAverage(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// View food place details + reviews in the sidebar
async function viewPlace(id) {
    try {
        const [placeRes, reviewsRes] = await Promise.all([
            fetch(`/api/food-places/${id}`),
            fetch(`/api/food-places/${id}/reviews`)
        ]);

        const place = await placeRes.json();
        const reviews = await reviewsRes.json();

        const panel = document.getElementById("panel-content");
        const avg = computeAverage(reviews);

        let reviewsHTML = '';
        if (reviews.length > 0) {
            reviewsHTML = reviews.map(r => `
                <div class="review-item" style="border-bottom: 1px solid #415a77; padding: 8px 0; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${r.username}</strong>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <small style="color: #aaa;">${new Date(r.created_at).toLocaleDateString()}</small>
                            ${r.is_own ? `
                                <span class="material-symbols-outlined delete-review-btn"
                                    onclick="deleteReview(${r.id}, ${id}); return false;"
                                    style="color: #aaa; font-size: 18px; cursor: pointer; opacity: 0; transition: opacity 0.2s;"
                                    title="Delete review">
                                    delete
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div>${renderStars(r.rating)}</div>
                    ${r.comment ? `<p style="margin: 4px 0 0 0; color: #ccc;">${r.comment}</p>` : ''}
                </div>
            `).join('');
        } else {
            reviewsHTML = '<p style="color: #aaa;">No reviews yet. Be the first!</p>';
        }

        panel.innerHTML = `
            ${place.place_url ? `<img src="${place.place_url}" class="img-fluid mb-2" style="border-radius: 8px;"/>` : ""}
            <h5>${place.name}</h5>
            <p>${place.description || "No description"}</p>

            ${avg > 0 ? `
                <div style="margin-bottom: 8px;">
                    ${renderStars(Math.round(avg))}
                    <span style="color: #aaa; margin-left: 4px;">${avg} / 5 (${reviews.length} review${reviews.length !== 1 ? 's' : ''})</span>
                </div>
            ` : ''}

            ${place.menu_url
                ? `<p><a href="${place.menu_url}" target="_blank">View Menu</a></p>`
                : ""}

            <p style="color: #aaa; font-size: 0.85em;">
                Lat: ${place.latitude}<br>
                Lng: ${place.longitude}
            </p>

            <hr style="border-color: #415a77;">

            <h6>Leave a Review</h6>
            <form id="review-form">
                <div id="star-selector" style="margin-bottom: 10px; cursor: pointer;">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <span class="star-btn material-symbols-outlined"
                              data-value="${i}"
                              onclick="selectStar(${i})"
                              style="color: #ccc; font-size: 28px; transition: color 0.2s;">
                            star
                        </span>
                    `).join('')}
                </div>
                <input type="hidden" name="rating" id="selected-rating" value="0">

                <textarea name="comment" placeholder="Write your review (optional)"
                    class="form-control mb-2"
                    style="background: #0d1b2a; color: #fff; border: 1px solid #415a77;"  
                    rows="3"></textarea>

                <style>
                    #review-form textarea::placeholder { color: #aaa !important; }
                    .review-item:hover .delete-review-btn { opacity: 1 !important; }
                </style>

                <button type="submit" class="btn btn-success w-100">Submit Review</button>
            </form>

            <hr style="border-color: #415a77;">

            <h6>Reviews</h6>
            <div id="reviews-list">
                ${reviewsHTML}
            </div>

            <div style="margin-top: 12px;">
                <button class="btn btn-outline-light btn-sm w-100" style="background-color: var(--platinum); color: grey; border: none; padding: 0.5rem 1rem; border-radius: 4px;" onclick="resetPanel()">← Back</button>
            </div>
        `;

        document.getElementById("review-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            await submitReview(id);
        });

    } catch (err) {
        console.error("View error:", err);
    }
}

// rating selector
function selectStar(value) {
    document.getElementById("selected-rating").value = value;
    const stars = document.querySelectorAll("#star-selector .star-btn");
    stars.forEach(star => {
        const starVal = parseInt(star.getAttribute("data-value"));
        star.style.color = starVal <= value ? "#ffc107" : "#ccc";
    });
}

async function submitReview(placeId) {
    const rating = document.getElementById("selected-rating").value;
    const comment = document.querySelector('#review-form textarea[name="comment"]').value;

    if (rating === "0" || rating === "") {
        alert("Please select a star rating.");
        return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    if (comment) {
        formData.append("comment", comment);
    }

    try {
        const response = await fetch(`/api/food-places/${placeId}/reviews`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            // Reload the place view to show updated reviews
            await viewPlace(placeId);
        } else {
            const err = await response.json();
            alert(err.detail || "Failed to submit review.");
        }
    } catch (err) {
        console.error("Review submit error:", err);
        alert("Network error.");
    }
}

async function deleteReview(reviewId, placeId) {
    if (!confirm("Delete your review?")) return;

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            await viewPlace(placeId);
        } else {
            const err = await response.json();
            alert(err.detail || "Failed to delete review.");
        }
    } catch (err) {
        console.error("Delete review error:", err);
        alert("Network error.");
    }
}

function resetPanel() {
    const panel = document.getElementById("panel-content");
    panel.innerHTML = `<p class="text">Click on a marker to view a food place.</p>`;
}

initUserMap();
