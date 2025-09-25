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

//render restaurant cards to the specified container
function displayRestaurants(restaurants, container) {
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h2>No Results Found</h2>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    const isResults = container.id === 'results-container';
    const isRecommendations = container.id === 'like-container';
    const headerText = isResults ? `Found ${restaurants.length} Restaurant(s):` : 'You Might Like These:';

    let html = `<h2>${headerText}</h2>`;

    restaurants.forEach(restaurant => {
        const imageHtml = restaurant.images && restaurant.images.length > 0 ?
            `<img src="${restaurant.images[0]}" alt="${restaurant.name}" class="restaurant-image" onerror="this.style.display='none'">` :
            `<div class="restaurant-image-placeholder">No Image Available</div>`;

        if (isRecommendations) {
            html += `
                <div class="restaurant-card">
                    ${imageHtml}
                    <h3>${restaurant.name}</h3>
                    <div class="restaurant-actions">
                        <button class="reserve-btn" onclick="reserveRestaurant('${restaurant.name}', '${restaurant.social_media[0]}')">
                            Reserve Now
                        </button>
                        <button class="details-btn" onclick="showRestaurantDetails('${restaurant.id}', '${restaurant.county}')">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        } else {
            const matchingDishes = getMatchingDishes(restaurant);
            const dishesHtml = matchingDishes.length > 0 ?
                `<p><strong>Featured Dishes:</strong> ${matchingDishes.join(', ')}</p>` : '';

            html += `
                <div class="restaurant-card">
                    ${imageHtml}
                    <h3>${restaurant.name}</h3>
                    <p><strong>Location:</strong> ${restaurant.county}</p>
                    <p><strong>Address:</strong> ${restaurant.address}</p>
                    <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                    <p><strong>Price Range:</strong> ${restaurant.price_range}</p>
                    <p><strong>Rating:</strong> ${'⭐'.repeat(Math.floor(restaurant.rating))} ${restaurant.rating}/5</p>
                    ${dishesHtml}
                    <div class="restaurant-actions">
                        <button class="reserve-btn" onclick="reserveRestaurant('${restaurant.name}', '${restaurant.social_media[0]}')">
                            Reserve Now
                        </button>
                        <button class="details-btn" onclick="showRestaurantDetails('${restaurant.id}', '${restaurant.county}')">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

//return dishes matching current search term
function getMatchingDishes(restaurant) {
    const dishName = document.getElementById('dish-input').value.trim().toLowerCase();
    if (!dishName) return [];

    return restaurant.dishes
        .filter(dish => 
            dish.name.toLowerCase().includes(dishName) ||
            dish.description.toLowerCase().includes(dishName)
        )
        .map(dish => dish.name)
        .slice(0, 3);
}

//handle restaurant reservation
function reserveRestaurant(restaurantName, socialMediaUrl) {
    if (socialMediaUrl) {
        window.open(socialMediaUrl, '_blank');
    } else {
        alert(`Contact ${restaurantName} Directly to Make a Reservation.`);
    }
}

//apply filters (cuisine, price, rating)
function applyFilters() {
    const cuisineFilter = document.getElementById('cuisine-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;

    let results = [...filteredRestaurants];

    // cuisine
    if (cuisineFilter) {
        results = results.filter(restaurant => restaurant.cuisine === cuisineFilter);
    }

    // price
    if (priceFilter) {
        results = results.filter(restaurant => {
            const priceRange = restaurant.price_range.toLowerCase();
            const priceNumbers = priceRange.match(/\d+/g);
            
            if (priceNumbers && priceNumbers.length > 0) {
                const minPrice = parseInt(priceNumbers[0]);
                
                switch (priceFilter) {
                    case 'low':
                        return minPrice < 1500;
                    case 'medium':
                        return minPrice >= 1500 && minPrice <= 3000;
                    case 'high':
                        return minPrice > 3000;
                    default:
                        return true;
                }
            }
            return true;
        });
    }

    // rating
    if (ratingFilter) {
        const minRating = parseFloat(ratingFilter);
        results = results.filter(restaurant => restaurant.rating >= minRating);
    }

    const resultsContainer = document.getElementById('results-container');
    displayRestaurants(results, resultsContainer);
    
    // close filter dropdown and scroll to results
    toggleFilter();
    showResultsSection();
    document.querySelector('.results-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

//reset the filters
function resetFilters() {
    document.getElementById('county-select').value = '';
    document.getElementById('dish-input').value = '';
    document.getElementById('cuisine-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('rating-filter').value = '';

    filteredRestaurants = [];
    hideResultsSection();
    displayRecommendations();
}

//hide the results section/featured restaurants section upon initial page load
function hideResultsSection() {
    document.querySelector('.results-section').classList.remove('show');
    document.querySelector('.results-section').style.display = 'none';
}


/****************************************************************************************/
//ASYNC FUNCTIONS
//main search (user)
async function searchRestaurants() {
    const county = document.getElementById('county-select').value;
    const dishName = document.getElementById('dish-input').value.trim().toLowerCase();

    if (!county && !dishName) {
        showErrorMessage("Please Select a County or Enter a Dish Name to Search.");
        return;
    }

    try {
        let searchResults = [];

        let dataToSearch = county ? //county filter
            allRestaurants.filter(countyData => countyData.county.toLowerCase() === county.toLowerCase()) : 
            allRestaurants;

        dataToSearch.forEach(countyData => {
            countyData.restaurants.forEach(restaurant => {
                let matches = false;
                
                if (dishName) {
                    matches = restaurant.dishes.some(dish => 
                        dish.name.toLowerCase().includes(dishName) ||
                        dish.description.toLowerCase().includes(dishName)
                    );
                } else {
                    matches = true; //displays all restaurants instead (no dishname specified)
                }

                if (matches) {
                    searchResults.push({
                        ...restaurant,
                        county: countyData.county
                    });
                }
            });
        });

        filteredRestaurants = searchResults;
        applyFilters();
        showResultsSection();
        
        // scroll/redirect user to results section after search
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth' 
        });

    } catch (error) {
        console.error("Error Searching Restaurants:", error);
        showErrorMessage("Search Failed. Please Try Again.");
    }
}



//display recommendations in the "you might like this" section 
async function displayRecommendations() {
    const likeContainer = document.getElementById('like-container');

    const recommended = [];
    allRestaurants.slice(0, 5).forEach(countyData => {
        if (countyData.restaurants && countyData.restaurants.length > 0) {
            const randomIndex = Math.floor(Math.random() * countyData.restaurants.length);
            const restaurant = countyData.restaurants[randomIndex];
            recommended.push({
                ...restaurant,
                county: countyData.county
            });
        }
    })
    await displayRestaurants(recommended, likeContainer);
}


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

