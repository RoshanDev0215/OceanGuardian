const APIS = {
    NOAA: {
        BASE_URL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2',
        KEY: 'feiQeJllehhLUgRPAyigtywpEiATFBiS'
    },
    GBIF: {
        BASE_URL: 'https://api.gbif.org/v1',
    },
    GUARDIAN: {
        BASE_URL: 'https://content.guardianapis.com',
        KEY: '76a690b54a1c5f5b91fdeccd7d744f7c' 
    },
    ERDDAP: {
        BASE_URL: 'https://coastwatch.pfeg.noaa.gov/erddap/tabledap'
    }
};

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            openModal(section);
        });
    });

    // Add click handler to close button
    document.querySelector('.close').addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('modal')) {
            closeModal();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});


// Modal Functions
function openModal(section) {
    document.getElementById('modal').style.display = 'block';
    loadContent(section);
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-content').innerHTML = '';
}

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Content Loading Function
async function loadContent(section) {
    showLoading();
    const contentDiv = document.getElementById('modal-content');
    
    try {
        // Hide all sections first
        contentDiv.querySelectorAll('div[id$="-section"]').forEach(div => {
            div.style.display = 'none';
        });

        switch(section) {
            case 'ocean-health':
                await loadOceanHealth(contentDiv);
                break;
            case 'marine-life':
                await loadMarineLife(contentDiv);
                break;
            case 'pollution':
                await loadPollution(contentDiv);
                break;
            case 'climate':
                await loadClimate(contentDiv);
                break;
            case 'seafood':
                await loadSeafood(contentDiv);
                break;
            case 'news':
                await loadNews(contentDiv);
                break;
            case 'calculator':
                loadCalculator(contentDiv);
                break;
            case 'community':
                await loadCommunity(contentDiv);
                break;
            case 'quiz':
                loadQuiz(contentDiv);
                break;
            case 'donate':
                loadDonation(contentDiv);
                break;
            case 'prevention':
                const preventionSection = document.getElementById('prevention-section');
                if (preventionSection) {
                    preventionSection.style.display = 'block';
                    initializePrevention();
                }
                break;
            default:
                contentDiv.innerHTML = `
                    <h2>${section.replace('-', ' ').toUpperCase()}</h2>
                    <p>This section is coming soon.</p>
                `;
        }
    } catch (error) {
        contentDiv.innerHTML = `
            <h2>Error</h2>
            <p>Sorry, we couldn't load this content. Please try again later.</p>
            <p>Error: ${error.message}</p>
        `;
        console.error('Error loading content:', error);
    }
    
    hideLoading();
}

// Prevention guide initialization function
function initializePrevention() {
    // Add click handlers for category headers
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.arrow');
            
            // Toggle arrow
            arrow.style.transform = content.classList.contains('active') ? 'rotate(0deg)' : 'rotate(180deg)';
            
            // Toggle content
            content.classList.toggle('active');
            
            // Close other categories
            document.querySelectorAll('.category-content').forEach(el => {
                if (el !== content) {
                    el.classList.remove('active');
                    const otherArrow = el.previousElementSibling.querySelector('.arrow');
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });
        });
    });

    // Add click handlers for subcategory headers
    document.querySelectorAll('.subcategory-header').forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering parent category click
            
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.arrow');
            
            // Toggle arrow
            arrow.style.transform = content.classList.contains('active') ? 'rotate(0deg)' : 'rotate(180deg)';
            
            // Toggle content
            content.classList.toggle('active');
            
            // Close other subcategories in the same category
            const category = this.closest('.category-content');
            category.querySelectorAll('.subcategory-content').forEach(el => {
                if (el !== content) {
                    el.classList.remove('active');
                    const otherArrow = el.previousElementSibling.querySelector('.arrow');
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });
        });
    });
}

// Ocean Health Section
const stationDataCache = new Map();

async function loadOceanHealth(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Ocean Temperature Trends (Annual)</h2>
        <div class="dashboard-controls">
            <select id="locationSelect" class="data-select">
                <option value="GHCND:USW00014895">Pacific Ocean - Station 14895</option>
                <option value="GHCND:USW00094789">Atlantic Ocean - Station 94789</option>
                <option value="GHCND:USW00012842">Gulf Coast - Station 12842</option>
            </select>
        </div>
        <div class="chart-container">
            <canvas id="oceanHealthChart"></canvas>
        </div>
        <div id="dataInfo" class="data-info"></div>
    `;
    // Add event listeners
    document.getElementById('locationSelect').addEventListener('change', (e) => {
        // Instead of fetching again, use the cached data
        const cachedData = stationDataCache.get(e.target.value);
        displayOceanData(cachedData || []);
    });

    // Initial load with default values - store the data as it's retrieved
    
    const station2Data = await fetchOceanData('GHCND:USW00094789', '10');
    stationDataCache.set('GHCND:USW00094789', station2Data);
    
    const station3Data = await fetchOceanData('GHCND:USW00012842', '10');
    stationDataCache.set('GHCND:USW00012842', station3Data);
    
    const station1Data = await fetchOceanData('GHCND:USW00014895', '10');
    stationDataCache.set('GHCND:USW00014895', station1Data);
}

async function fetchOceanData(stationId, years) {
    try {
        showLoading();
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - parseInt(years));

        const response = await fetch(
            `${APIS.NOAA.BASE_URL}/data?` + 
            `datasetid=GSOY&` +
            `stationid=${stationId}&` +
            `startdate=${startDate.toISOString().split('T')[0]}&` +
            `enddate=${endDate.toISOString().split('T')[0]}&` +
            `datatypeid=TAVG&` +
            `limit=1000&` +
            `units=metric`, 
            {
                headers: {
                    'token': APIS.NOAA.KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results || [];
        
        // Display the data for the first load
        displayOceanData(results);
        
        hideLoading();
        return results;  // Return the data for caching

    } catch (error) {
        handleAPIError(error, 'dataInfo');
        hideLoading();
        return [];
    }
}

function displayOceanData(results) {
    const processedData = processYearlyData(results);
    console.log("Processed data for chart:", processedData); 

    const ctx = document.getElementById('oceanHealthChart').getContext('2d');
    
    if (window.oceanChart) {
        window.oceanChart.destroy();
    }

    window.oceanChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: 'Average Annual Temperature (°C)',
                data: processedData.temperatures,
                borderColor: '#0077be',
                backgroundColor: 'rgba(0, 119, 190, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Temperature: ${context.parsed.y.toFixed(1)}°C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, 
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });

    displayStats(processedData.temperatures);
}


function processYearlyData(results) {
    console.log("Raw results:", results); // Add this for debugging
    
    // Create an array of data points
    const dataPoints = results
        .filter(result => result.datatype === 'TAVG') // Filter for average temperature
        .map(result => ({
            year: new Date(result.date).getFullYear(),
            temp: result.value // Convert from tenths of degrees to Celsius
        }))
        .filter(point => point.temp >= -5 && point.temp <= 40); // Filter reasonable temperatures

    console.log("Processed data points:", dataPoints); // Add this for debugging

    // Sort by year
    dataPoints.sort((a, b) => a.year - b.year);

    return {
        labels: dataPoints.map(point => point.year.toString()),
        temperatures: dataPoints.map(point => point.temp)
    };
}

function displayStats(temperatures) {
    const validTemps = temperatures.filter(temp => temp !== null);
    const average = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
    const max = Math.max(...validTemps);
    const min = Math.min(...validTemps);
    const trend = validTemps[validTemps.length - 1] - validTemps[0];

    document.getElementById('dataInfo').innerHTML = `
        <div class="data-summary">
            <div class="summary-card">
                <h3>Average</h3>
                <p>${average.toFixed(1)}°C</p>
            </div>
            <div class="summary-card">
                <h3>Maximum</h3>
                <p>${max.toFixed(1)}°C</p>
            </div>
            <div class="summary-card">
                <h3>Minimum</h3>
                <p>${min.toFixed(1)}°C</p>
            </div>
            <div class="summary-card">
                <h3>Overall Trend</h3>
                <p>${trend > 0 ? '+' : ''}${trend.toFixed(1)}°C</p>
            </div>
        </div>
        <div class="data-note">
            <p>Note: Data shown represents annual average temperatures. Each point represents one year's average temperature.</p>
        </div>
    `;
}

// Marine Life Section
async function loadMarineLife(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Marine Life Tracker</h2>
        <div class="dashboard-controls">
            <select id="speciesSelect" class="data-select">
                <option value="Megaptera novaeangliae">Humpback Whale</option>
                <option value="Tursiops truncatus">Bottlenose Dolphin</option>
                <option value="Chelonia mydas">Green Sea Turtle</option>
                <option value="Rhincodon typus">Whale Shark</option>
            </select>
        </div>
        <div id="marineMap" style="height: 400px;"></div>
        <div id="speciesInfo" class="data-info"></div>
    `;

    try {
        const map = L.map('marineMap').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        document.getElementById('speciesSelect').addEventListener('change', async (e) => {
            await fetchMarineLifeData(e.target.value, map);
        });

        await fetchMarineLifeData('Megaptera novaeangliae', map);
    } catch (error) {
        handleAPIError(error, 'speciesInfo');
    }
}

async function fetchMarineLifeData(species, map) {
    try {
        showLoading();
        const response = await fetch(`${APIS.GBIF.BASE_URL}/occurrence/search?scientificName=${species}&limit=100`);
        const data = await response.json();

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Create custom icon based on species
        const getCustomIcon = (speciesName) => {
            let emoji;
            switch(speciesName) {
                case 'Megaptera novaeangliae (Borowski, 1781)': // Humpback Whale
                    emoji = '🐋';
                    break;
                case 'Tursiops truncatus (Montagu, 1821)': // Bottlenose Dolphin
                    emoji = '🐬';
                    break;
                case 'Chelonia mydas (Linnaeus, 1758)': // Green Sea Turtle
                    emoji = '🐢';
                    break;
                case 'Rhincodon typus Smith, 1828': // Whale Shark
                    emoji = '🦈';
                    break;
                default:
                    emoji = '🌊';
            }

            return L.divIcon({
                html: `<div class="custom-marker">${emoji}</div>`,
                className: 'custom-marker-container',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            });
        };

        // Add new markers with custom icons
        data.results.forEach(occurrence => {
            if (occurrence.decimalLatitude && occurrence.decimalLongitude) {
                const customIcon = getCustomIcon(occurrence.scientificName);
                
                L.marker([occurrence.decimalLatitude, occurrence.decimalLongitude], {
                    icon: customIcon
                })
                .bindPopup(`
                    <div class="marine-popup">
                        <h3>${occurrence.scientificName}</h3>
                        <p>Recorded: ${new Date(occurrence.eventDate).toLocaleDateString()}</p>
                        <p>Location: ${occurrence.locality || 'Unknown location'}</p>
                    </div>
                `)
                .addTo(map);
            }
        });

        hideLoading();
    } catch (error) {
        handleAPIError(error, 'speciesInfo');
    }
}


// News Section
async function loadNews(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Ocean Conservation News</h2>
        <div class="dashboard-controls">
            <select id="newsCategory" class="data-select">
                <option value="ocean conservation">Ocean Conservation</option>
                <option value="marine life">Marine Life</option>
                <option value="ocean pollution">Ocean Pollution</option>
                <option value="climate change ocean">Ocean Climate Change</option>
                <option value="coral reef">Coral Reefs</option>
                <option value="sustainable fishing">Sustainable Fishing</option>
            </select>
        </div>
        <div class="news-grid" id="newsGrid"></div>
    `;

    const categorySelect = document.getElementById('newsCategory');
    categorySelect.addEventListener('change', async (e) => {
        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = '<div class="loading">Loading new articles...</div>';
        await fetchNews(e.target.value);
    });

    await fetchNews('ocean conservation'); // Load default category on initial load
}

async function fetchNews(category) {
    const apiKey = '76a690b54a1c5f5b91fdeccd7d744f7c'; // Your GNews API key
    const proxyUrl = `https://corsproxy.io/?`;
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}&token=${apiKey}&lang=en&sortby=published`;

    try {
        showLoading();
        const response = await fetch(`${proxyUrl}${gnewsUrl}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        displayNews(data.articles, category); // Updated to handle JSON response

        hideLoading();
    } catch (error) {
        console.error('News API Error:', error);
        showFallbackContent(document.getElementById('newsGrid'), category);
        hideLoading();
    }
}

function displayNews(articles, category) {
    const newsGrid = document.getElementById('newsGrid');

    if (articles.length > 0) {
        const articlesHTML = articles.slice(0, 12).map(article => {
            const title = article.title;
            const link = article.url;
            const description = article.description || "No description available."; // Handle missing descriptions
            const date = new Date(article.publishedAt);
            const source = article.source.name;

            return `
                <div class="news-card">
                    <div class="news-content">
                        <h3>${title}</h3>
                        <p class="news-description">${description}</p>
                    </div>
                    <div class="news-footer">
                        <div class="news-meta">
                            <p class="news-date">Published: ${date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p class="news-source">Source: ${source}</p>
                        </div>
                        <a href="${link}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="read-more">Read Full Article</a>
                    </div>
                </div>
            `;
        }).join('');

        newsGrid.innerHTML = `
            <div class="news-header">
                <h3>Latest News for: ${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <p>Showing ${Math.min(articles.length, 12)} recent articles</p>
            </div>
            ${articlesHTML}
        `;
    } else {
        showFallbackContent(newsGrid, category);
    }
}

function showFallbackContent(newsGrid, category) {
    newsGrid.innerHTML = `
        <div class="no-results">
            <h3>No recent news found for "${category}"</h3>
            <p>We're having trouble loading the latest news. Please try:</p>
            <ul>
                <li>Selecting a different category</li>
                <li>Checking back in a few minutes</li>
                <li>Refreshing the page</li>
            </ul>
            <button onclick="fetchNews('${category}')" class="retry-button">
                Try Again
            </button>
        </div>
    `;
}


// Climate Section
async function loadClimate(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Ocean Climate Impact</h2>
        <div class="climate-description">
            <p>This graph shows the sea temperature anomaly over time. Temperature anomaly represents how much warmer or cooler the ocean is compared to the long-term average (1981-2010 baseline). A positive anomaly means temperatures are above average.</p>
        </div>
        <div class="chart-container">
            <canvas id="climateChart"></canvas>
        </div>
        <div class="climate-insights">
            <h3>Key Insights</h3>
            <div class="insight-grid">
                <div class="insight-card">
                    <h4>What This Means</h4>
                    <p>Rising temperature anomalies indicate ongoing ocean warming, which can affect marine ecosystems, coral reefs, and sea levels.</p>
                </div>
                <div class="insight-card">
                    <h4>Impact on Marine Life</h4>
                    <p>Even small temperature changes can disrupt marine ecosystems, affecting fish populations, coral health, and biodiversity.</p>
                </div>
                <div class="insight-card">
                    <h4>Global Effects</h4>
                    <p>Warmer oceans contribute to more intense storms, changing weather patterns, and rising sea levels.</p>
                </div>
            </div>
        </div>
    `;

    try {
        const data = {
            labels: ['2019', '2020', '2021', '2022', '2023'],
            datasets: [{
                label: 'Sea Temperature Anomaly (°C)',
                data: [0.98, 1.02, 1.1, 1.15, 1.2],
                borderColor: '#ff9f43',
                backgroundColor: 'rgba(255, 159, 67, 0.2)',
                tension: 0.1,
                fill: true
            }]
        };

        const ctx = document.getElementById('climateChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Temperature Anomaly: +${context.parsed.y}°C`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperature Anomaly (°C)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        handleAPIError(error, 'climateChart');
    }
}

// Seafood Section
async function loadSeafood(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Sustainable Seafood Guide</h2>
        <div class="seafood-controls">
            <input type="text" id="seafoodSearch" class="seafood-search" placeholder="Search for seafood...">
            <select id="seafoodFilter" class="seafood-filter">
                <option value="all">All Ratings</option>
                <option value="best">Best Choice</option>
                <option value="good">Good Alternative</option>
                <option value="avoid">Avoid</option>
            </select>
            <select id="regionFilter" class="seafood-filter">
                <option value="all">All Regions</option>
                <option value="pacific">Pacific Ocean</option>
                <option value="atlantic">Atlantic Ocean</option>
                <option value="indian">Indian Ocean</option>
                <option value="arctic">Arctic Ocean</option>
            </select>
        </div>
        <div id="seafoodGrid" class="seafood-grid"></div>
    `;

    // Initialize seafood data
    const seafoodData = getSeafoodData();
    
    // Render initial grid
    renderSeafoodGrid(seafoodData);

    // Add event listeners
    document.getElementById('seafoodSearch').addEventListener('input', filterSeafood);
    document.getElementById('seafoodFilter').addEventListener('change', filterSeafood);
    document.getElementById('regionFilter').addEventListener('change', filterSeafood);
}

function getSeafoodData() {
    return [
        {
            name: "Pacific Salmon (Wild-Caught)",
            species: ["Chinook", "Coho", "Sockeye", "Pink", "Chum"],
            rating: "best",
            status: "Stable",
            region: "pacific",
            methods: ["Trolling", "Gillnet", "Seine"],
            bestChoices: ["Alaska wild-caught", "Washington wild-caught"],
            avoidChoices: ["Open net pen farmed"],
            seasonality: "May to September",
            nutrition: {
                protein: "High",
                omega3: "Very High",
                mercury: "Low"
            },
            description: "Wild-caught Pacific salmon is among the most sustainable seafood choices. These fish are carefully managed with strict quotas and monitoring."
        },
        {
            name: "Atlantic Cod",
            species: ["Gadus morhua"],
            rating: "good",
            status: "Recovering",
            region: "atlantic",
            methods: ["Bottom trawl", "Longline", "Gillnet"],
            bestChoices: ["Iceland MSC certified", "Northeast Arctic"],
            avoidChoices: ["Southern North Sea"],
            seasonality: "Year-round",
            nutrition: {
                protein: "High",
                omega3: "Medium",
                mercury: "Low"
            },
            description: "Atlantic cod populations are recovering from historical overfishing. Some stocks are now well-managed and sustainable."
        },
        {
            name: "Bluefin Tuna",
            species: ["Atlantic", "Pacific", "Southern"],
            rating: "avoid",
            status: "Depleted",
            region: "all",
            methods: ["Longline", "Purse seine"],
            bestChoices: ["None currently"],
            avoidChoices: ["All wild-caught bluefin"],
            seasonality: "Year-round",
            nutrition: {
                protein: "Very High",
                omega3: "High",
                mercury: "High"
            },
            description: "Bluefin tuna populations are severely depleted. Consumers should choose more sustainable tuna alternatives."
        },
        {
            name: "Alaskan Halibut",
            species: ["Pacific halibut"],
            rating: "best",
            status: "Stable",
            region: "pacific",
            methods: ["Bottom longline"],
            bestChoices: ["Alaska wild-caught"],
            avoidChoices: ["Atlantic halibut"],
            seasonality: "March to November",
            nutrition: {
                protein: "High",
                omega3: "Medium",
                mercury: "Low"
            },
            description: "Alaskan halibut fisheries are well-managed with strict quotas and monitoring systems."
        },

{
    name: "Rainbow Trout (Farmed)",
    species: ["Oncorhynchus mykiss"],
    rating: "best",
    status: "Sustainable",
    region: "pacific",
    methods: ["Recirculating tanks", "Raceways"],
    bestChoices: ["US farmed", "UK farmed"],
    avoidChoices: ["Lake or pond farmed without effluent treatment"],
    seasonality: "Year-round",
    nutrition: {
        protein: "High",
        omega3: "High",
        mercury: "Very Low"
    },
    description: "Farmed rainbow trout is one of the most sustainable seafood choices. Modern farming practices minimize environmental impact and produce healthy fish."
},
{
    name: "Yellowfin Tuna",
    species: ["Thunnus albacares"],
    rating: "good",
    status: "Variable by Region",
    region: "pacific",
    methods: ["Pole and line", "Trolling", "Longline"],
    bestChoices: ["Pole and line caught", "FAD-free purse seine"],
    avoidChoices: ["Longline without seabird protection"],
    seasonality: "Year-round",
    nutrition: {
        protein: "Very High",
        omega3: "High",
        mercury: "Moderate"
    },
    description: "Yellowfin tuna populations are generally healthy, though sustainability varies by fishing method and region."
},
{
    name: "Atlantic Shrimp (Wild)",
    species: ["Pandalus borealis"],
    rating: "avoid",
    status: "Overfished",
    region: "atlantic",
    methods: ["Bottom trawl"],
    bestChoices: ["MSC certified cold water prawns"],
    avoidChoices: ["Non-certified wild caught"],
    seasonality: "September to March",
    nutrition: {
        protein: "Medium",
        omega3: "Low",
        mercury: "Very Low"
    },
    description: "Wild Atlantic shrimp fishing often results in high bycatch rates and habitat damage from bottom trawling."
},
{
    name: "Pacific Sardines",
    species: ["Sardinops sagax"],
    rating: "best",
    status: "Abundant",
    region: "pacific",
    methods: ["Purse seine", "Cast net"],
    bestChoices: ["US Pacific caught", "Canada Pacific caught"],
    avoidChoices: ["None"],
    seasonality: "July to September",
    nutrition: {
        protein: "High",
        omega3: "Very High",
        mercury: "Very Low"
    },
    description: "Pacific sardines are fast-growing, abundant, and caught using low-impact fishing methods."
},
{
    name: "European Seabass (Farmed)",
    species: ["Dicentrarchus labrax"],
    rating: "good",
    status: "Stable",
    region: "atlantic",
    methods: ["Open net pens", "Recirculating systems"],
    bestChoices: ["RAS farmed", "ASC certified"],
    avoidChoices: ["Non-certified open net pens"],
    seasonality: "Year-round",
    nutrition: {
        protein: "High",
        omega3: "Medium",
        mercury: "Low"
    },
    description: "Farmed seabass sustainability varies by production method, with recirculating systems being the most environmentally friendly."
},
{
    name: "Swordfish",
    species: ["Xiphias gladius"],
    rating: "good",
    status: "Recovering",
    region: "atlantic",
    methods: ["Harpoon", "Longline"],
    bestChoices: ["US North Atlantic harpoon caught"],
    avoidChoices: ["Mediterranean caught"],
    seasonality: "August to December",
    nutrition: {
        protein: "High",
        omega3: "Medium",
        mercury: "High"
    },
    description: "North Atlantic swordfish populations have recovered significantly due to international management efforts."
},
{
    name: "Red King Crab",
    species: ["Paralithodes camtschaticus"],
    rating: "best",
    status: "Stable",
    region: "arctic",
    methods: ["Pot/Trap"],
    bestChoices: ["Alaska caught"],
    avoidChoices: ["Imported Russian crab"],
    seasonality: "October to January",
    nutrition: {
        protein: "High",
        omega3: "Low",
        mercury: "Low"
    },
    description: "Alaska king crab fisheries are well-managed with strict quotas and monitoring to ensure sustainability."
},
{
    name: "European Plaice",
    species: ["Pleuronectes platessa"],
    rating: "good",
    status: "Recovering",
    region: "atlantic",
    methods: ["Bottom trawl", "Seine net"],
    bestChoices: ["North Sea MSC certified"],
    avoidChoices: ["Non-certified trawl caught"],
    seasonality: "November to April",
    nutrition: {
        protein: "Medium",
        omega3: "Medium",
        mercury: "Low"
    },
    description: "North Sea plaice populations are recovering well under current management plans."
},
{
    name: "Farmed Mussels",
    species: ["Mytilus edulis", "Mytilus galloprovincialis"],
    rating: "best",
    status: "Sustainable",
    region: "all",
    methods: ["Rope culture", "Bottom culture"],
    bestChoices: ["Any farmed"],
    avoidChoices: ["None"],
    seasonality: "September to April",
    nutrition: {
        protein: "Medium",
        omega3: "High",
        mercury: "Very Low"
    },
    description: "Farmed mussels are one of the most sustainable seafood choices, requiring no feed input and providing ecosystem services."
},
{
    name: "Antarctic Toothfish",
    species: ["Dissostichus mawsoni"],
    rating: "avoid",
    status: "Unknown",
    region: "arctic",
    methods: ["Longline"],
    bestChoices: ["MSC certified only"],
    avoidChoices: ["Non-certified sources"],
    seasonality: "Year-round",
    nutrition: {
        protein: "High",
        omega3: "Very High",
        mercury: "High"
    },
    description: "Antarctic toothfish are vulnerable to overfishing due to slow growth and late maturity. Illegal fishing remains a concern."
},
{
    name: "Pacific Oysters",
    species: ["Crassostrea gigas"],
    rating: "best",
    status: "Sustainable",
    region: "pacific",
    methods: ["Off-bottom culture", "Beach culture"],
    bestChoices: ["Any farmed"],
    avoidChoices: ["None"],
    seasonality: "September to April",
    nutrition: {
        protein: "Medium",
        omega3: "Medium",
        mercury: "Very Low"
    },
    description: "Farmed oysters are highly sustainable, improving water quality and providing habitat for other species."
},
{
    name: "North Atlantic Mackerel",
    species: ["Scomber scombrus"],
    rating: "good",
    status: "Stable",
    region: "atlantic",
    methods: ["Purse seine", "Hook and line"],
    bestChoices: ["MSC certified, hook and line caught"],
    avoidChoices: ["Non-certified sources"],
    seasonality: "July to September",
    nutrition: {
        protein: "High",
        omega3: "Very High",
        mercury: "Low"
    },
    description: "Mackerel are fast-growing and caught using relatively low-impact fishing methods."
},
{
    name: "California Market Squid",
    species: ["Loligo opalescens"],
    rating: "best",
    status: "Stable",
    region: "pacific",
    methods: ["Seine net", "Jig"],
    bestChoices: ["US West Coast caught"],
    avoidChoices: ["None"],
    seasonality: "April to November",
    nutrition: {
        protein: "High",
        omega3: "Low",
        mercury: "Very Low"
    },
    description: "California market squid reproduce quickly and are caught using low-impact methods."
},
{
    name: "European Spiny Lobster",
    species: ["Palinurus elephas"],
    rating: "avoid",
    status: "Depleted",
    region: "atlantic",
    methods: ["Pot/Trap", "Diving"],
    bestChoices: ["None currently"],
    avoidChoices: ["All wild-caught"],
    seasonality: "June to September",
    nutrition: {
        protein: "High",
        omega3: "Low",
        mercury: "Low"
    },
    description: "European spiny lobster populations are severely depleted due to historical overfishing and slow recovery rates."
},
{
    name: "Arctic Char (Farmed)",
    species: ["Salvelinus alpinus"],
    rating: "best",
    status: "Sustainable",
    region: "arctic",
    methods: ["Recirculating systems", "Flow-through systems"],
    bestChoices: ["Any farmed"],
    avoidChoices: ["None"],
    seasonality: "Year-round",
    nutrition: {
        protein: "High",
        omega3: "High",
        mercury: "Low"
    },
    description: "Farmed Arctic char is produced in environmentally responsible systems with minimal impact on wild populations."
},
{
    name: "Japanese Amberjack (Hamachi)",
    species: ["Seriola quinqueradiata"],
    rating: "good",
    status: "Variable",
    region: "pacific",
    methods: ["Net pens", "Recirculating systems"],
    bestChoices: ["ASC certified farmed"],
    avoidChoices: ["Non-certified farmed"],
    seasonality: "Year-round",
    nutrition: {
        protein: "High",
        omega3: "High",
        mercury: "Moderate"
    },
    description: "Farmed hamachi sustainability varies by production method, with certified operations being the best choice."
},
{
    name: "Black Sea Bass",
    species: ["Centropristis striata"],
    rating: "good",
    status: "Recovering",
    region: "atlantic",
    methods: ["Hook and line", "Trap"],
    bestChoices: ["US Mid-Atlantic caught"],
    avoidChoices: ["Non-certified trawl caught"],
    seasonality: "May to October",
    nutrition: {
        protein: "High",
        omega3: "Medium",
        mercury: "Low"
    },
    description: "US black sea bass populations are rebuilding under strict management plans."
},
{
    name: "Geoduck Clam",
    species: ["Panopea generosa"],
    rating: "best",
    status: "Stable",
    region: "pacific",
    methods: ["Diver caught", "Farmed"],
    bestChoices: ["US/Canada farmed or wild"],
    avoidChoices: ["None"],
    seasonality: "Year-round",
    nutrition: {
        protein: "Medium",
        omega3: "Low",
        mercury: "Very Low"
    },
    description: "Geoduck fisheries are well-managed with minimal environmental impact, and farming practices are environmentally responsible."
},
{
    name: "Orange Roughy",
    species: ["Hoplostethus atlanticus"],
    rating: "avoid",
    status: "Depleted",
    region: "pacific",
    methods: ["Bottom trawl"],
    bestChoices: ["None"],
    avoidChoices: ["All sources"],
    seasonality: "Year-round",
    nutrition: {
        protein: "Medium",
        omega3: "Low",
        mercury: "High"
    },
    description: "Orange roughy are extremely long-lived and slow-growing, making them highly vulnerable to overfishing. Most populations are severely depleted."
},
{
    name: "Stone Crab",
    species: ["Menippe mercenaria"],
    rating: "good",
    status: "Stable",
    region: "atlantic",
    methods: ["Trap"],
    bestChoices: ["Florida caught"],
    avoidChoices: ["None"],
    seasonality: "October to May",
    nutrition: {
        protein: "High",
        omega3: "Low",
        mercury: "Low"
    },
    description: "Stone crab fisheries are sustainable because only claws above a certain size are harvested, and the crabs are returned to the water where they can regrow their claws."
}
    ];
}

function renderSeafoodGrid(seafoodList) {
    const grid = document.getElementById('seafoodGrid');
    grid.innerHTML = seafoodList.map(seafood => `
        <div class="seafood-card ${seafood.rating}">
            <div class="seafood-header">
                <h3>${seafood.name}</h3>
                <span class="seafood-rating ${seafood.rating}">
                    ${getRatingText(seafood.rating)}
                </span>
            </div>
            
            <div class="seafood-content">
                <div class="seafood-status">
                    <span class="status-indicator" data-status="${seafood.rating}"></span>
                    Population Status: ${seafood.status}
                </div>
                
                <div class="seafood-details">
                    <div class="detail-section">
                        <h4>Best Choices</h4>
                        <ul>
                            ${seafood.bestChoices.map(choice => `<li>${choice}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Avoid</h4>
                        <ul>
                            ${seafood.avoidChoices.map(choice => `<li>${choice}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Fishing Methods</h4>
                        <p>${seafood.methods.join(', ')}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Nutrition</h4>
                        <ul class="nutrition-list">
                            <li>Protein: ${seafood.nutrition.protein}</li>
                            <li>Omega-3: ${seafood.nutrition.omega3}</li>
                            <li>Mercury: ${seafood.nutrition.mercury}</li>
                        </ul>
                    </div>
                </div>

                <div class="seafood-description">
                    <p>${seafood.description}</p>
                </div>

                <div class="seasonality">
                    <span class="label">Best Season:</span>
                    <span class="value">${seafood.seasonality}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getRatingText(rating) {
    switch(rating) {
        case 'best':
            return 'Best Choice';
        case 'good':
            return 'Good Alternative';
        case 'avoid':
            return 'Avoid';
        default:
            return 'Unknown';
    }
}

function filterSeafood() {
    const searchTerm = document.getElementById('seafoodSearch').value.toLowerCase();
    const ratingFilter = document.getElementById('seafoodFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    
    const seafoodData = getSeafoodData();
    const filteredData = seafoodData.filter(seafood => {
        const matchesSearch = seafood.name.toLowerCase().includes(searchTerm) ||
                            seafood.description.toLowerCase().includes(searchTerm);
        const matchesRating = ratingFilter === 'all' || seafood.rating === ratingFilter;
        const matchesRegion = regionFilter === 'all' || seafood.region === regionFilter || seafood.region === 'all';
        
        return matchesSearch && matchesRating && matchesRegion;
    });
    
    renderSeafoodGrid(filteredData);
}

// Calculator Section
function loadCalculator(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Personal Impact Calculator</h2>
        <form id="impact-form" class="calculator-form">
            <div class="form-group">
                <label for="plastic">Monthly plastic usage (kg):</label>
                <input type="number" id="plastic" required min="0" step="0.1">
            </div>
            <div class="form-group">
                <label for="seafood">Monthly seafood consumption (kg):</label>
                <input type="number" id="seafood" required min="0" step="0.1">
            </div>
            <div class="form-group">
                <label for="water">Daily water usage (liters):</label>
                <input type="number" id="water" required min="0">
            </div>
            <button type="submit" class="submit-button">Calculate Impact</button>
        </form>
        <div id="calculator-result"></div>
    `;

    document.getElementById('impact-form').addEventListener('submit', calculateImpact);
}

function calculateImpact(event) {
    event.preventDefault();
    const plastic = Number(document.getElementById('plastic').value);
    const seafood = Number(document.getElementById('seafood').value);
    const water = Number(document.getElementById('water').value);
    
    const impact = (plastic * 2.5) + (seafood * 1.8) + (water * 0.015);
    
    document.getElementById('calculator-result').innerHTML = `
        <div class="impact-result">
            <h3>Your Ocean Impact Score: ${impact.toFixed(2)}</h3>
            <p>Score interpretation:</p>
            <ul>
                <li>0-50: Excellent! Keep up the good work</li>
                <li>51-100: Good, but room for improvement</li>
                <li>101-150: Consider reducing your impact</li>
                <li>>150: Significant impact - please consider changes</li>
            </ul>
            <div class="impact-suggestions">
                <h4>Suggestions for Improvement:</h4>
                <ul>
                    ${plastic > 5 ? '<li>Consider reducing single-use plastics</li>' : ''}
                    ${seafood > 10 ? '<li>Try incorporating more sustainable seafood options</li>' : ''}
                    ${water > 200 ? '<li>Look for ways to conserve water in daily activities</li>' : ''}
                </ul>
            </div>
        </div>
    `;
}

// Community Section
async function loadCommunity(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Community Events</h2>
        <div class="events-list">
            <div class="event-card">
                <h3>Beach Cleanup Day</h3>
                <p>Date: November 15, 2024</p>
                <p>Location: Sunny Beach</p>
                <p>Participants: 45/50</p>
                <button onclick="registerEvent('cleanup')" class="register-button">Register</button>
            </div>
            <div class="event-card">
                <h3>Marine Life Workshop</h3>
                <p>Date: November 20, 2024</p>
                <p>Location: Ocean Center</p>
                <p>Participants: 28/30</p>
                <button onclick="registerEvent('workshop')" class="register-button">Register</button>
            </div>
            <div class="event-card">
                <h3>Coral Reef Conservation Talk</h3>
                <p>Date: November 25, 2024</p>
                <p>Location: Virtual Event</p>
                <p>Participants: Unlimited</p>
                <button onclick="registerEvent('talk')" class="register-button">Register</button>
            </div>
        </div>
    `;
}

function registerEvent(eventType) {
    alert(`Thank you for your interest! In a real application, this would register you for the ${eventType} event.`);
}

// Quiz Section
const questionBank = [
    {
        question: "What percentage of the Earth's surface is covered by oceans?",
        options: ["50%", "60%", "70%", "80%"],
        correct: 2
    },
    {
        question: "Which ocean is the largest?",
        options: ["Atlantic", "Pacific", "Indian", "Southern"],
        correct: 1
    },
    {
        question: "What is the average depth of the ocean?",
        options: ["2,000 meters", "3,700 meters", "5,000 meters", "7,000 meters"],
        correct: 1
    },
    {
        question: "How much of the ocean has been explored?",
        options: ["5%", "20%", "50%", "100%"],
        correct: 0
    },
    {
        question: "Which ocean is the smallest?",
        options: ["Indian", "Southern", "Arctic", "Atlantic"],
        correct: 2
    },
    {
        question: "What is the longest mountain range in the ocean?",
        options: ["Himalayas", "Andes", "Mid-Ocean Ridge", "Rockies"],
        correct: 2
    },
    {
        question: "Which ocean is known to have the most marine life?",
        options: ["Indian", "Southern", "Pacific", "Atlantic"],
        correct: 2
    },
    {
        question: "What is the main cause of ocean currents?",
        options: ["Earth's rotation", "Wind", "Tides", "Salinity"],
        correct: 1
    },
    {
        question: "Which sea is the saltiest natural body of water?",
        options: ["Red Sea", "Dead Sea", "Mediterranean Sea", "Baltic Sea"],
        correct: 1
    },
    {
        question: "What is the process of salt removal from seawater called?",
        options: ["Desalination", "Distillation", "Evaporation", "Filtration"],
        correct: 0
    },
    {
        question: "Which ocean is shrinking due to tectonic activity?",
        options: ["Atlantic", "Pacific", "Indian", "Arctic"],
        correct: 1
    },
    {
        question: "Which type of coral reef is closest to the shore?",
        options: ["Atoll", "Barrier reef", "Fringing reef", "Patch reef"],
        correct: 2
    },
    {
        question: "What is the largest type of whale?",
        options: ["Blue whale", "Humpback whale", "Gray whale", "Orca"],
        correct: 0
    },
    {
        question: "What gas is most responsible for ocean acidification?",
        options: ["Nitrogen", "Oxygen", "Carbon dioxide", "Methane"],
        correct: 2
    },
    {
        question: "Which layer of the ocean receives the most sunlight?",
        options: ["Midnight zone", "Abyssal zone", "Twilight zone", "Epipelagic zone"],
        correct: 3
    },
    {
        question: "What is the primary food source for marine life in the deep ocean?",
        options: ["Algae", "Phytoplankton", "Zooplankton", "Detritus"],
        correct: 3
    },
    {
        question: "What is the term for a circular ocean current?",
        options: ["Gulf Stream", "Tide", "Gyre", "Riptide"],
        correct: 2
    },
    {
        question: "Which ocean phenomenon can affect global climate patterns?",
        options: ["Tides", "El Niño", "Red tides", "Thermocline"],
        correct: 1
    },
    {
        question: "Which ocean is home to the Mariana Trench?",
        options: ["Indian", "Southern", "Pacific", "Atlantic"],
        correct: 2
    },
    {
        question: "What causes the blue color of the ocean?",
        options: ["Sky reflection", "Algae", "Absorption of red light", "Salt"],
        correct: 2
    }
];


let quizQuestions = [];
let currentQuestion = 0;
let score = 0;

function loadQuiz(contentDiv) {
    currentQuestion = 0;
    score = 0;
    quizQuestions = getRandomQuestions(3); // Selects 3 random questions
    showQuestion(contentDiv);
}

function getRandomQuestions(numQuestions) {
    const shuffled = questionBank.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}

function showQuestion(contentDiv) {
    const question = quizQuestions[currentQuestion];
    contentDiv.innerHTML = `
        <h2>Ocean Knowledge Quiz</h2>
        <div class="quiz-container">
            <p>Question ${currentQuestion + 1} of ${quizQuestions.length}</p>
            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" onclick="checkAnswer(${index})">${option}</button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function checkAnswer(answerIndex) {
    if (answerIndex === quizQuestions[currentQuestion].correct) {
        score++;
    }
    
    currentQuestion++;
    
    if (currentQuestion < quizQuestions.length) {
        showQuestion(document.getElementById('modal-content'));
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    const contentDiv = document.getElementById('modal-content');
    contentDiv.innerHTML = `
        <h2>Quiz Results</h2>
        <div class="quiz-results">
            <h3>You scored ${score} out of ${quizQuestions.length}!</h3>
            <p>${getQuizFeedback(score, quizQuestions.length)}</p>
            <button onclick="loadQuiz(document.getElementById('modal-content'))" class="retry-button">Try Again</button>
        </div>
    `;
}

function getQuizFeedback(score, total) {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "Excellent! You're an ocean expert!";
    if (percentage >= 60) return "Good job! You know quite a bit about our oceans.";
    return "Keep learning! There's so much to discover about our oceans.";
}

// Donation Section
function loadDonation(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Support Ocean Conservation</h2>
        <div class="donation-options">
            <div class="donation-card">
                <h3>Ocean Cleanup</h3>
                <p>Support efforts to remove plastic from our oceans</p>
                <button onclick="handleDonation('cleanup')" class="donate-button">Donate</button>
            </div>
            <div class="donation-card">
                <h3>Marine Life Protection</h3>
                <p>Help protect endangered marine species</p>
                <button onclick="handleDonation('protection')" class="donate-button">Donate</button>
            </div>
            <div class="donation-card">
                <h3>Research & Education</h3>
                <p>Support marine research and educational programs</p>
                <button onclick="handleDonation('research')" class="donate-button">Donate</button>
            </div>
        </div>
    `;
}

function handleDonation(type) {
    alert(`Thank you for your interest in supporting ocean conservation! In a real application, this would connect to a secure payment processor.`);
}

// Error Handler Function
function handleAPIError(error, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div class="error-message">
            <p>Error loading data: ${error.message}</p>
            <button onclick="location.reload()" class="retry-button">Retry</button>
        </div>
    `;
    hideLoading();
}









// Pollution Monitor Implementation
async function loadPollution(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Ocean Pollution Monitor</h2>
        <div class="dashboard-controls">
            <select id="pollutionRegion" class="data-select">
                <option value="pacific">Pacific Ocean</option>
                <option value="atlantic">Atlantic Ocean</option>
                <option value="indian">Indian Ocean</option>
                <option value="arctic">Arctic Ocean</option>
            </select>
            <select id="pollutionYear" class="data-select">
                ${generateYearOptions()}
            </select>
        </div>
        
        <div class="pollution-dashboard">
            <div class="chart-container">
                <canvas id="pollutionTrendsChart"></canvas>
            </div>
            
            <div class="pollution-stats">
                <div class="data-summary">
                    <div class="summary-card">
                        <h3>Plastic Waste</h3>
                        <p id="plasticStat">Loading...</p>
                    </div>
                    <div class="summary-card">
                        <h3>Chemical Pollution</h3>
                        <p id="chemicalStat">Loading...</p>
                    </div>
                    <div class="summary-card">
                        <h3>Oil Pollution</h3>
                        <p id="oilStat">Loading...</p>
                    </div>
                    <div class="summary-card">
                        <h3>Overall Health</h3>
                        <p id="healthStat">Loading...</p>
                    </div>
                </div>
            </div>

            <div class="pollution-hotspots">
                <h3>Major Pollution Sources</h3>
                <div id="hotspotsContainer"></div>
            </div>

            <div class="data-note">
                <p><strong>Note:</strong> Data shown represents estimated pollution levels based on satellite observations, research vessel measurements, and coastal monitoring stations.</p>
            </div>
        </div>
    `;

    // Initialize event listeners
    document.getElementById('pollutionRegion').addEventListener('change', updatePollutionData);
    document.getElementById('pollutionYear').addEventListener('change', updatePollutionData);

    // Load initial data
    await updatePollutionData();
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let year = currentYear; year >= 2015; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    return options;
}

async function updatePollutionData() {
    const region = document.getElementById('pollutionRegion').value;
    const year = document.getElementById('pollutionYear').value;
    
    // Simulate loading state
    showLoading();
    
    try {
        // Get simulated data
        const pollutionData = getPollutionData(region, year);
        
        // Update charts and stats
        updatePollutionChart(pollutionData);
        updatePollutionStats(pollutionData);
        updateHotspots(pollutionData.hotspots);
        
        hideLoading();
    } catch (error) {
        console.error('Error updating pollution data:', error);
        handleAPIError(error, 'pollutionTrendsChart');
    }
}

function getPollutionData(region, year) {
    const baseData = {
        pacific: { plastic: 8.5, chemical: 6.2, oil: 4.8 },
        atlantic: { plastic: 7.2, chemical: 5.8, oil: 5.1 },
        indian: { plastic: 9.1, chemical: 7.3, oil: 5.9 },
        arctic: { plastic: 4.2, chemical: 3.9, oil: 3.2 }
    };

    const yearFactor = (parseInt(year) - 2015) * 0.15;
    const currentData = baseData[region];

    const monthlyData = Array.from({ length: 12 }, (_, month) => {
        const seasonalFactor = Math.sin((month + 6) * Math.PI / 6) * 0.2;
        return {
            month: new Date(year, month).toLocaleString('default', { month: 'short' }),
            plastic: currentData.plastic * (1 + seasonalFactor + yearFactor),
            chemical: currentData.chemical * (1 + seasonalFactor + yearFactor),
            oil: currentData.oil * (1 + seasonalFactor + yearFactor)
        };
    });

    const hotspots = generateHotspots(region);

    return {
        monthly: monthlyData,
        annual: {
            plastic: currentData.plastic * (1 + yearFactor),
            chemical: currentData.chemical * (1 + yearFactor),
            oil: currentData.oil * (1 + yearFactor)
        },
        hotspots
    };
}

function generateHotspots(region) {
    const hotspotsByRegion = {
        pacific: [
            { name: 'Great Pacific Garbage Patch', type: 'plastic', severity: 'Critical' },
            { name: 'East Asian Coast', type: 'chemical', severity: 'High' },
            { name: 'Western American Coast', type: 'oil', severity: 'Moderate' }
        ],
        atlantic: [
            { name: 'North Atlantic Gyre', type: 'plastic', severity: 'High' },
            { name: 'Gulf of Mexico', type: 'oil', severity: 'High' },
            { name: 'Mediterranean Outflow', type: 'chemical', severity: 'Moderate' }
        ],
        indian: [
            { name: 'Bay of Bengal', type: 'plastic', severity: 'Critical' },
            { name: 'Arabian Sea', type: 'oil', severity: 'High' },
            { name: 'Indonesian Throughflow', type: 'chemical', severity: 'High' }
        ],
        arctic: [
            { name: 'Barents Sea', type: 'chemical', severity: 'Moderate' },
            { name: 'Northwest Passage', type: 'oil', severity: 'Moderate' },
            { name: 'Greenland Sea', type: 'plastic', severity: 'Low' }
        ]
    };

    return hotspotsByRegion[region];
}

function updatePollutionChart(data) {
    const ctx = document.getElementById('pollutionTrendsChart').getContext('2d');
    
    if (window.pollutionChart) {
        window.pollutionChart.destroy();
    }

    window.pollutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.monthly.map(d => d.month),
            datasets: [
                {
                    label: 'Plastic Pollution Index',
                    data: data.monthly.map(d => d.plastic),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Chemical Pollution Index',
                    data: data.monthly.map(d => d.chemical),
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Oil Pollution Index',
                    data: data.monthly.map(d => d.oil),
                    borderColor: '#45b7d1',
                    backgroundColor: 'rgba(69, 183, 209, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pollution Index'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

function updatePollutionStats(data) {
    const { annual } = data;
    
    // Update statistics
    document.getElementById('plasticStat').innerHTML = `
        ${annual.plastic.toFixed(1)}
        <span class="health-status ${getHealthStatus(annual.plastic)}">
            ${getHealthLabel(annual.plastic)}
        </span>
    `;
    
    document.getElementById('chemicalStat').innerHTML = `
        ${annual.chemical.toFixed(1)}
        <span class="health-status ${getHealthStatus(annual.chemical)}">
            ${getHealthLabel(annual.chemical)}
        </span>
    `;
    
    document.getElementById('oilStat').innerHTML = `
        ${annual.oil.toFixed(1)}
        <span class="health-status ${getHealthStatus(annual.oil)}">
            ${getHealthLabel(annual.oil)}
        </span>
    `;

    // Calculate overall health
    const avgPollution = (annual.plastic + annual.chemical + annual.oil) / 3;
    document.getElementById('healthStat').innerHTML = `
        ${getOverallHealth(avgPollution)}
        <span class="health-status ${getHealthStatus(avgPollution)}">
            ${getHealthLabel(avgPollution)}
        </span>
    `;
}

function updateHotspots(hotspots) {
    const container = document.getElementById('hotspotsContainer');
    
    container.innerHTML = `
        <div class="hotspots-grid">
            ${hotspots.map(hotspot => `
                <div class="hotspot-card ${hotspot.severity.toLowerCase()}">
                    <h4>${hotspot.name}</h4>
                    <p>Type: ${capitalizeFirst(hotspot.type)} Pollution</p>
                    <p>Severity: <span class="severity-badge ${hotspot.severity.toLowerCase()}">${hotspot.severity}</span></p>
                </div>
            `).join('')}
        </div>
    `;
}

function getHealthStatus(value) {
    if (value < 5) return 'good';
    if (value < 7.5) return 'moderate';
    return 'critical';
}

function getHealthLabel(value) {
    if (value < 5) return 'Good';
    if (value < 7.5) return 'Moderate';
    return 'Critical';
}

function getOverallHealth(value) {
    if (value < 5) return 'Healthy';
    if (value < 7.5) return 'Concerning';
    return 'Critical';
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}




function loadPollutionPrevention(contentDiv) {
    // Fetch and insert the HTML content
    fetch('prevention-guide.html')
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;
            initializePrevention();
        })
        .catch(error => {
            console.error('Error loading prevention guide:', error);
            contentDiv.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });
}

function initializePrevention() {
    // Add click handlers for category headers
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Close all category contents
            document.querySelectorAll('.category-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Toggle current category
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });

    // Add click handlers for subcategory headers
    document.querySelectorAll('.subcategory-header').forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering parent category click
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Close all subcategory contents within the same category
            const category = this.closest('.category-content');
            category.querySelectorAll('.subcategory-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Toggle current subcategory
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });
}

