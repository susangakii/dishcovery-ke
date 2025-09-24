/****************************************************************************************/
//FETCH FUNCTIONS
//fetch all restaurants
function getRestaurants() {
    return fetch("http://localhost:3000/restaurants", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(data => data.restaurants)
        .catch((error) => {
            console.error("Error Fetching Restaurants:", error);
            return [];
        })
}

//fetch a specific restaurant by id
function getRestaurantById(id) {
    return fetch(`http://localhost:3000/restaurants/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(data => data)
        .catch((error) => {
            console.error("Error Fetching Restaurant by Id:", error);
            return null;
        })
}

/****************************************************************************************/
//OTHER NECESSARY FUNCTIONS
let allRestaurants = [];
let filteredRestaurants = [];

// load initial restaurant data and sets up the page
async function loadInitialData() {
    try {
        allRestaurants = await getRestaurants();
        populateCountyDropdown();
        populateCuisineDropdown();
        displayRecommendations();
    } catch (error) {
        console.error("Error Loading Initial Data:", error);
        showErrorMessage("Failed to Load Restaurant Data. Please Try Again.");
    }
}

//populate the select county dropdown
function populateCountyDropdown() {
    const countySelect = document.getElementById('county-select');
    const counties = [
        "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
        "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
        "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
        "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
        "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
        "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans-Nzoia",
        "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
    ];

    counties.forEach(county => {
        const option = document.createElement('option');
        option.value = county;
        option.textContent = county;
        countySelect.appendChild(option);
    });
}

//populate the cuisine dropdown
function populateCuisineDropdown() {
    const cuisineSelect = document.getElementById('cuisine-filter');
    const cuisines = ["African", "Cafe", "Chinese", "Continental", "Farm-to-table", "Healthy", "International", "Italian", "Japanese", "Kenyan", "Korean", "Safari", "Seafood", "Steakhouse", "Swahili"];

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.value = cuisine;
        option.textContent = cuisine;
        cuisineSelect.appendChild(option);
    });
}

function displayRecommendations() {
    const likeContainer = document.getElementById('like-container');
    likeContainer.innerHTML = '<h2>You Might Like These:</h2>';
    
    const recommended = [];
    allRestaurants.slice(0, 5).forEach(countyData => {
        if (countyData.restaurants && countyData.restaurants.length > 0) {
            recommended.push({
                ...countyData.restaurants[Math.floor(Math.random() * countyData.restaurants.length)], county: countyData.county
            });
        }
    });

    displayRestaurantsInContainer(recommended, 'like-container', false);
}

//hide the results section/featured restaurants section upon initial page load
function hideResultsSection() {
    document.querySelector('.results-section').classList.remove('show');
    document.querySelector('.results-section').style.display = 'none';
}


/****************************************************************************************/
//ASYNC FUNCTIONS
// shows recommended restaurants on the initial page load



//collapse and uncollapse the filter button at the top pf the page
function toggleFilter() {
    const filterSidebar = document.querySelector('.filters-sidebar');
    filterSidebar.classList.toggle('collapsed');
}

/****************************************************************************************/
//EVENT LISTENERS
document.addEventListener("DOMContentLoaded", function () {
    loadInitialData();
    hideResultsSection();
});

