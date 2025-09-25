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
        .then(data => data.restaurants || data)
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

    let html = "";

    if (isResults) {
        html = `<h2>Found ${restaurants.length} Restaurant(s):</h2>`;
    }

    restaurants.forEach(restaurant => {
        const imageHtml = restaurant.images && restaurant.images.length > 0 ?
            `<img src="${restaurant.images[0]}" alt="${restaurant.name}" class="restaurant-image" onerror="this.style.display='none'">` :
            `<div class="restaurant-image-placeholder">No Image Available</div>`;

        if (isRecommendations) {
            html += `
                <div class="restaurant-card">
                    ${imageHtml}
                    <h3>${restaurant.name}</h3>
                    <p><strong>Location:</strong> ${restaurant.county}</p>
                    <p><strong>Rating:</strong> ${'⭐'.repeat(Math.floor(restaurant.rating))} ${restaurant.rating}/5</p>
                    <div class="restaurant-actions">
                        <button class="details-btn" onclick="showRestaurantDetails('${restaurant.id}', '${restaurant.county}')">
                            View Details
                        </button>
                        <button class="reserve-btn" onclick="reserveRestaurant('${restaurant.name}', '${restaurant.social_media[0]}')">
                            Reserve Now
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
                    <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                    <p><strong>Price Range:</strong> ${restaurant.price_range}</p>
                    <p><strong>Rating:</strong> ${'⭐'.repeat(Math.floor(restaurant.rating))} ${restaurant.rating}/5</p>
                    <div class="restaurant-actions">
                        <button class="details-btn" onclick="showRestaurantDetails('${restaurant.id}', '${restaurant.county}')">
                            View Details
                        </button>
                        <button class="reserve-btn" onclick="reserveRestaurant('${restaurant.name}', '${restaurant.social_media[0]}')">
                            Reserve Now
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

//show restaurant info in a modal popup
function showRestaurantDetails(restaurantId, county) {
    const existingModal = document.querySelector('.restaurant-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    const restaurant = findRestaurantById(restaurantId, county);
    if (!restaurant) return;

    const imageHtml = restaurant.images && restaurant.images.length > 0 ?
        `<img src="${restaurant.images[0]}" alt="${restaurant.name}" class="restaurant-image" style="margin-bottom: 1rem;">` :
        `<div class="restaurant-image-placeholder" style="margin-bottom: 1rem;">No Image Available</div>`;

    const modal = document.createElement('div');
    modal.className = 'restaurant-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            ${imageHtml}
            <h2>${restaurant.name}</h2>
            <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
            <p><strong>Price Range:</strong> ${restaurant.price_range}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(Math.floor(restaurant.rating))} ${restaurant.rating}/5</p>
            <p><strong>Address:</strong> ${restaurant.address}</p>
            <p><strong>Phone:</strong> ${restaurant.phone}</p>
            <p><strong>Email:</strong> ${restaurant.email}</p>
            <p><strong>Special Features:</strong> ${restaurant.special_features}</p>
            
            <h3>Menu Items:</h3>
            <div class="menu-items">
                ${restaurant.dishes.map(dish => `
                    <div class="menu-item">
                        <strong>${dish.name}</strong>: ${dish.description}
                    </div>
                `).join('')}
            </div>
            
            <h3>Drinks:</h3>
            <div class="drinks-items">
                ${restaurant.drinks.map(drink => `
                    <div class="menu-item">
                        <strong>${drink.name}</strong>: ${drink.description}
                    </div>
                `).join('')}
            </div>
            
            <h3>Operating Hours:</h3>
            <div class="hours">
                ${restaurant.operating_hours.map(hour => `<p>${hour}</p>`).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

//find a specific restaurant by ID and county
function findRestaurantById(id, county) {
    const countyData = allRestaurants.find(c => c.county === county);
    return countyData ? countyData.restaurants.find(restaurant => restaurant.id === id) : null;
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

//show results section
function showResultsSection() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.style.display = 'block';
    resultsSection.classList.add('show');
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
function displayRecommendations() {
    const likeContainer = document.getElementById('like-container');
    const allRestaurantsFlat = [];

    allRestaurants.forEach(countyData => {
        countyData.restaurants.forEach(restaurant => {
            allRestaurantsFlat.push({
                ...restaurant,
                county: countyData.county
            });
        });
    });

    const shuffled = [...allRestaurantsFlat].sort(() => 0.5 - Math.random());
    const topFive = shuffled.slice(0, 6);

    displayRestaurants(topFive, likeContainer);
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

    //search button
    document.getElementById('submit-btn').addEventListener('click', function (e) {
        e.preventDefault();
        searchRestaurants();
    });

    //filter button
    document.getElementById('search-btn').addEventListener('click', function (e) {
        e.preventDefault();
        if (filteredRestaurants.length > 0) {
            applyFilters();
        }
    });

    //reset button
    document.getElementById('reset-btn').addEventListener('click', function (e) {
        e.preventDefault();
        resetFilters();
    });

    //enter keypress (when used instead of click)
    document.getElementById('dish-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchRestaurants();
        }
    });

    //filter changes (when user changes filter selection)
    document.getElementById('cuisine-filter').addEventListener('change', function () {
        if (filteredRestaurants.length > 0) {
            applyFilters();
        }
    });
    document.getElementById('price-filter').addEventListener('change', function () {
        if (filteredRestaurants.length > 0) {
            applyFilters();
        }
    });
    document.getElementById('rating-filter').addEventListener('change', function () {
        if (filteredRestaurants.length > 0) {
            applyFilters();
        }
    });
});

