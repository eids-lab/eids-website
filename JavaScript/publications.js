document.addEventListener("DOMContentLoaded", () => {
  // Dark Mode Toggle
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;

  // Check user's previous theme preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === "dark-mode";
  }

  themeSwitch?.addEventListener("change", () => {
    if (themeSwitch.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      localStorage.removeItem("theme");
    }
  });

  // Fetch publications for a specific ORCID
  const orcidId = "0000-0003-0796-6265"; // Your ORCID ID
  fetchPublicationsFromORCID(orcidId);

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll(
    ".hero-section, .about-section, .project-highlights"
  );

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const windowHeight = window.innerHeight;
      const revealTop = element.getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check
});

/**
 * Fetches publications directly from ORCID API
 * @param {String} orcidId - The ORCID identifier
 */
async function fetchPublicationsFromORCID(orcidId) {
  const publicationsList = document.querySelector('.publications-list');
  
  // Show loading indicator
  publicationsList.innerHTML = '<div class="loading">Loading publications...</div>';
  
  try {
    // ORCID API requires Accept header for JSON response
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch publications: ${response.status}`);
    }
    
    const data = await response.json();
    const works = data.group || [];
    
    // Process ORCID works data
    const publications = works.map(workGroup => {
      const workSummary = workGroup['work-summary']?.[0] || {};
      const title = workSummary.title?.['title']?.value || 'Untitled Publication';
      
      // Extract publication date
      const publicationDate = workSummary['publication-date'] || {};
      const year = publicationDate?.year?.value || 'Unknown Year';
      
      // Extract journal/venue
      const journalTitle = workSummary['journal-title']?.value || 'Unknown Venue';
      
      // Extract DOI if available
      const externalIds = workSummary['external-ids']?.['external-id'] || [];
      const doiRecord = externalIds.find(id => id['external-id-type'] === 'doi');
      const doi = doiRecord?.['external-id-value'] || '';
      
      // Generate URL (DOI or ORCID work URL)
      let url = doi ? `https://doi.org/${doi}` : `https://orcid.org/${orcidId}/work/${workSummary.putCode}`;
      
      // Generate author list (not directly available in this API response)
      // Using placeholder as we'd need additional API calls to get full author lists
      const authors = 'Author information available in full paper';
      
      return {
        title,
        authors,
        venue: journalTitle,
        year,
        url
      };
    });
    
    if (publications.length > 0) {
      displayPublications(publications);
      updateSectionHeader(orcidId);
    } else {
      // Fallback to Crossref if no publications found
      fetchPublicationsFromCrossref(orcidId);
    }
    
  } catch (error) {
    console.error('Error fetching publications from ORCID:', error);
    // Fallback to Crossref
    fetchPublicationsFromCrossref(orcidId);
  }
}

/**
 * Fallback method using Crossref API
 * @param {String} orcidId - The ORCID identifier
 */
async function fetchPublicationsFromCrossref(orcidId) {
  try {
    // Crossref API has good CORS support
    const response = await fetch(`https://api.crossref.org/works?filter=orcid:${orcidId}&rows=100`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publications from Crossref');
    }
    
    const data = await response.json();
    const items = data.message?.items || [];
    
    if (items.length === 0) {
      // If still no results, try OpenAlex as final fallback
      fetchPublicationsFromOpenAlex(orcidId);
      return;
    }
    
    const publications = items.map(item => {
      // Extract authors
      const authors = item.author?.map(author => 
        `${author.given || ''} ${author.family || ''}`
      ).join(', ') || 'Unknown Authors';
      
      // Extract year
      const year = item.published?.['date-parts']?.[0]?.[0] || 'Unknown Year';
      
      // Extract venue
      const venue = item['container-title']?.[0] || item['publisher'] || 'Unknown Venue';
      
      // URL (DOI or URL)
      const url = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : '#');
      
      return {
        title: item.title?.[0] || 'Untitled Publication',
        authors,
        venue,
        year,
        url
      };
    });
    
    displayPublications(publications);
    updateSectionHeader(orcidId);
    
  } catch (error) {
    console.error('Error fetching publications from Crossref:', error);
    // Final fallback to OpenAlex
    fetchPublicationsFromOpenAlex(orcidId);
  }
}

/**
 * Final fallback using OpenAlex API
 * @param {String} orcidId - The ORCID identifier
 */
async function fetchPublicationsFromOpenAlex(orcidId) {
  try {
    // OpenAlex API has good CORS support
    const response = await fetch(`https://api.openalex.org/works?filter=author.orcid:${orcidId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publications from OpenAlex');
    }
    
    const data = await response.json();
    const items = data.results || [];
    
    if (items.length === 0) {
      // If all APIs failed to find publications
      showNoPubsMessage();
      return;
    }
    
    const publications = items.map(item => {
      // Extract authors
      const authors = item.authorships?.map(authorship => 
        authorship.author?.display_name || 'Unknown'
      ).join(', ') || 'Unknown Authors';
      
      // Extract year
      const year = item.publication_year || 'Unknown Year';
      
      // Extract venue
      const venue = item.host_venue?.display_name || 'Unknown Venue';
      
      // URL
      const url = item.doi ? `https://doi.org/${item.doi}` : (item.url || '#');
      
      return {
        title: item.title || 'Untitled Publication',
        authors,
        venue,
        year,
        url
      };
    });
    
    displayPublications(publications);
    updateSectionHeader(orcidId);
    
  } catch (error) {
    console.error('Error fetching publications from OpenAlex:', error);
    showNoPubsMessage();
  }
}

/**
 * Shows a message when no publications are found across all sources
 */
function showNoPubsMessage() {
  const publicationsList = document.querySelector('.publications-list');
  publicationsList.innerHTML = `
    <div class="no-publications">
      <p>No publications found for this identifier across multiple academic databases.</p>
      <p>This could be because:</p>
      <ul>
        <li>The publications are not indexed in the databases we're searching</li>
        <li>The ORCID ID might not be linked to publications in these databases</li>
        <li>There might be temporary API access issues</li>
      </ul>
      <button id="manually-add-pubs" class="add-pubs-btn">Add Sample Publications</button>
    </div>
  `;
  
  // Allow adding sample publications manually for testing
  document.getElementById('manually-add-pubs')?.addEventListener('click', () => {
    addSamplePublications();
  });
}

/**
 * Adds sample publications for testing
 */
function addSamplePublications() {
  const publications = [
    {
      title: "Machine Learning Approaches for Edge Computing",
      authors: "Chen, M., Wilson, J., & Johnson, S.",
      venue: "IEEE Transactions on Edge Computing",
      year: "2024",
      url: "#"
    },
    {
      title: "Distributed AI Systems for Real-time Industrial Applications",
      authors: "Johnson, S., Rodriguez, A., & Chen, M.",
      venue: "Journal of Intelligent Manufacturing",
      year: "2023",
      url: "#"
    },
    {
      title: "Edge Intelligence for Smart City Infrastructure",
      authors: "Rodriguez, A., Chen, M., & Wilson, J.",
      venue: "Smart Cities Journal",
      year: "2023",
      url: "#"
    },
    {
      title: "Energy-Efficient Algorithms for IoT Networks",
      authors: "Wilson, J., Johnson, S., & Rodriguez, A.",
      venue: "ACM Transactions on IoT",
      year: "2022",
      url: "#"
    }
  ];
  
  displayPublications(publications);
}

/**
 * Updates the section header with ORCID information
 * @param {String} orcidId - The ORCID identifier
 */
function updateSectionHeader(orcidId) {
  const sectionHeader = document.querySelector('.section-header');
  
  // Format the ORCID display
  const displayName = `ORCID: ${orcidId}`;
  
  // Add ORCID to header if not already present
  if (!sectionHeader.querySelector('h2')) {
    const heading = document.createElement('h2');
    heading.textContent = `Publications - ${displayName}`;
    heading.innerHTML += ` <a href="https://orcid.org/${orcidId}" target="_blank" rel="noopener noreferrer" class="orcid-link"><i class="fa-brands fa-orcid"></i></a>`;
    sectionHeader.prepend(heading);
  } else {
    // sectionHeader.querySelector('h2').textContent = `Publications - ${displayName}`;
    // sectionHeader.querySelector('h2').innerHTML += ` <a href="https://orcid.org/${orcidId}" target="_blank" rel="noopener noreferrer" class="orcid-link"><i class="fa-brands fa-orcid"></i></a>`;
  }
}

/**
 * Displays the publications in the publications list
 * @param {Array} publications - Array of publication objects
 */
function displayPublications(publications) {
  const publicationsList = document.querySelector('.publications-list');
  
  // Clear existing content
  publicationsList.innerHTML = '';
  
  if (publications.length === 0) {
    publicationsList.innerHTML = '<p class="no-publications">No publications found for this identifier.</p>';
    return;
  }

  // Sort publications by year (newest first)
  publications.sort((a, b) => {
    const yearA = typeof a.year === 'number' ? a.year : parseInt(a.year) || 0;
    const yearB = typeof b.year === 'number' ? b.year : parseInt(b.year) || 0;
    return yearB - yearA;
  });
  
  // Group publications by year
  const publicationsByYear = {};
  publications.forEach(pub => {
    const pubYear = pub.year.toString();
    if (!publicationsByYear[pubYear]) {
      publicationsByYear[pubYear] = [];
    }
    publicationsByYear[pubYear].push(pub);
  });
  
  // Create HTML for each publication grouped by year
  Object.keys(publicationsByYear).sort((a, b) => b - a).forEach(year => {
    publicationsByYear[year].forEach(pub => {
      const pubItem = createPublicationItem(pub);
      publicationsList.appendChild(pubItem);
    });
  });
}

/**
 * Creates a publication item element
 * @param {Object} publication - Publication object
 * @returns {HTMLElement} - Publication item element
 */
function createPublicationItem(publication) {
  const pubItem = document.createElement('div');
  pubItem.className = 'publication-item';
  
  const pubYear = document.createElement('div');
  pubYear.className = 'pub-year';
  pubYear.textContent = publication.year;
  
  const pubDetails = document.createElement('div');
  pubDetails.className = 'pub-details';
  
  const pubTitle = document.createElement('h4');
  pubTitle.textContent = publication.title;
  
  const pubAuthors = document.createElement('p');
  pubAuthors.className = 'pub-authors';
  pubAuthors.textContent = publication.authors;
  
  const pubVenue = document.createElement('p');
  pubVenue.className = 'pub-venue';
  pubVenue.textContent = publication.venue;
  
  const pubLink = document.createElement('a');
  pubLink.className = 'pub-link';
  pubLink.href = publication.url;
  pubLink.textContent = 'View Paper';
  pubLink.target = '_blank';
  pubLink.rel = 'noopener noreferrer';
  
  pubDetails.appendChild(pubTitle);
  pubDetails.appendChild(pubAuthors);
  pubDetails.appendChild(pubVenue);
  pubDetails.appendChild(pubLink);
  
  pubItem.appendChild(pubYear);
  pubItem.appendChild(pubDetails);
  
  return pubItem;
}

/**
 * Add a form to search for publications by ORCID ID
 */
function addOrcidSearchForm() {
  const sectionHeader = document.querySelector('.section-header');
  
  // Create search form
  const searchForm = document.createElement('div');
  searchForm.className = 'orcid-search';
  searchForm.innerHTML = `
    <div class="search-container">
      <input type="text" id="orcid-search" placeholder="Enter ORCID ID (e.g., 0000-0003-0796-6265)">
      <button id="search-button">Search</button>
    </div>
  `;
  
  sectionHeader.appendChild(searchForm);
  
  // Add event listener for search button
  document.getElementById('search-button').addEventListener('click', () => {
    performSearch();
  });
  
  // Add event listener for Enter key
  document.getElementById('orcid-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  function performSearch() {
    const orcidId = document.getElementById('orcid-search').value.trim();
    
    // Basic validation for ORCID format
    if (orcidId && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(orcidId)) {
      fetchPublicationsFromORCID(orcidId);
    } else {
      alert('Please enter a valid ORCID ID in the format: 0000-0000-0000-0000');
    }
  }
}