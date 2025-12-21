
// State
let allCountries = [];
let sovereignCountries = [];
let displayCountries = []; // The list currently being shown
let currentIndex = 0;
let isNameVisible = true;
let isCapitalVisible = true;
let isContinentVisible = true;
let isSovereignFilterActive = false; // Start with all countries

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    card: document.getElementById('country-card'),
    flag: document.getElementById('flag-img'),
    name: document.getElementById('country-name'),
    capital: document.getElementById('capital-name'),
    continent: document.getElementById('continent-name'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    counter: document.getElementById('counter'),
    toggleNameBtn: document.getElementById('toggle-name'),
    toggleCapitalBtn: document.getElementById('toggle-capital'),
    toggleContinentBtn: document.getElementById('toggle-continent'),
    toggleFilterBtn: document.getElementById('toggle-filter')
};

// Initialization
async function init() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,continents,translations,independent,capital');
        const data = await response.json();

        // Process and Sort
        const sortedData = data.sort((a, b) => {
            const nameA = getCountryName(a);
            const nameB = getCountryName(b);
            return nameA.localeCompare(nameB, 'es');
        });

        allCountries = sortedData;
        // Filter for independent countries (approx 195)
        sovereignCountries = sortedData.filter(country => country.independent === true);

        // Initial State: Show all
        displayCountries = allCountries;

        elements.loading.classList.add('hidden');
        elements.card.classList.remove('hidden');

        updateUI();
        setupListeners();
    } catch (error) {
        elements.loading.textContent = 'Error al cargar los países. Intente recargar.';
        console.error('Error fetching data:', error);
    }
}

function getCountryName(country) {
    let name = country.translations && country.translations.spa
        ? country.translations.spa.common
        : country.name.common;

    // Overrides requested by user
    if (name.toLowerCase() === 'suazilandia' || name.toLowerCase() === 'swaziland') {
        return 'Esuatini';
    }
    if (name.toLowerCase() === 'djibouti') {
        return 'Yibuti';
    }

    return name;
}

function getCapitalName(country) {
    if (!country.capital || country.capital.length === 0) return 'Sin Capital';
    return country.capital[0];
}

function getContinentName(country) {
    const continentMap = {
        'Africa': 'África',
        'North America': 'América del Norte',
        'South America': 'América del Sur',
        'Asia': 'Asia',
        'Europe': 'Europa',
        'Oceania': 'Oceanía',
        'Antarctica': 'Antártida'
    };

    const continent = country.continents ? country.continents[0] : 'Desconocido';
    return continentMap[continent] || continent;
}

function updateUI() {
    if (displayCountries.length === 0) return;

    const country = displayCountries[currentIndex];

    // Update Content
    const name = getCountryName(country);
    const capital = getCapitalName(country);
    const continent = getContinentName(country);

    elements.flag.src = country.flags.svg || country.flags.png;
    elements.flag.alt = `Bandera de ${name}`;

    elements.name.textContent = name;
    elements.capital.textContent = capital;
    elements.continent.textContent = continent;

    elements.counter.textContent = `${currentIndex + 1} / ${displayCountries.length}`;

    // Update Visibility States
    updateVisibilityClass(elements.name, isNameVisible);
    updateVisibilityClass(elements.capital, isCapitalVisible);
    updateVisibilityClass(elements.continent, isContinentVisible);

    // Update Toggle Button States
    toggleButtonState(elements.toggleNameBtn, isNameVisible);
    toggleButtonState(elements.toggleCapitalBtn, isCapitalVisible);
    toggleButtonState(elements.toggleContinentBtn, isContinentVisible);

    // Update Filter State
    if (isSovereignFilterActive) {
        elements.toggleFilterBtn.classList.add('active');
        elements.toggleFilterBtn.style.opacity = '1';
        elements.toggleFilterBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
        <span>195</span>
      `;
    } else {
        elements.toggleFilterBtn.classList.remove('active');
        elements.toggleFilterBtn.style.opacity = '0.7'; // Less opacity to show inactive state
        elements.toggleFilterBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>Todo</span>
      `;
    }
}

function updateVisibilityClass(element, isVisible) {
    if (isVisible) {
        element.classList.remove('blurred-text');
    } else {
        element.classList.add('blurred-text');
    }
}

function toggleButtonState(btn, isActive) {
    if (isActive) {
        btn.classList.add('active');
        btn.style.opacity = '1';
    } else {
        btn.classList.remove('active');
        btn.style.opacity = '0.5';
    }
}

function setupListeners() {
    elements.prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = displayCountries.length - 1; // Loop back
        }
        updateUI();
    });

    elements.nextBtn.addEventListener('click', () => {
        if (currentIndex < displayCountries.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop start
        }
        updateUI();
    });

    elements.toggleNameBtn.addEventListener('click', () => {
        isNameVisible = !isNameVisible;
        updateUI();
    });

    elements.toggleCapitalBtn.addEventListener('click', () => {
        isCapitalVisible = !isCapitalVisible;
        updateUI();
    });

    elements.toggleContinentBtn.addEventListener('click', () => {
        isContinentVisible = !isContinentVisible;
        updateUI();
    });

    elements.toggleFilterBtn.addEventListener('click', () => {
        isSovereignFilterActive = !isSovereignFilterActive;

        if (isSovereignFilterActive) {
            displayCountries = sovereignCountries;
        } else {
            displayCountries = allCountries;
        }

        currentIndex = 0; // Reset to start to avoid index errors
        updateUI();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') elements.prevBtn.click();
        if (e.key === 'ArrowRight') elements.nextBtn.click();
    });
}

// Start
init();
