// Default values
let defaultUsername = "johnpapa";
let searchedUsername = defaultUsername;
let perPage = 10; // Default per page count
let currentPage = 1;
let totalPageCount;
let sortField = 'created'; // Default sort field
let sortOrder = 'desc'; // Default sort order
document.title = searchedUsername;

// Fetch user details for the current page
function fetchUserDetails(username) {
  fetch(`https://api.github.com/users/${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to retrieve user details. Status code: ${response.status}`);
      }
      storeSearchHistory(username);
      return response.json();
    })
    .then((user) => {
      // Update the user details in the UI
      updateProfile(user);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

// Update profile details in the UI
function updateProfile(user) {
  document.querySelector('.profile').src = user.avatar_url;
  document.querySelector('.profileDetail h1').textContent = user.name || searchedUsername;
  document.querySelector('.profileDetail h4').textContent = user.bio || 'Bio goes here';
  document.querySelector('.location').textContent = `Location: ${user.location || 'N/A'}`;
  document.querySelector('.url a').href = user.blog || '#';
  document.querySelector('.url a').textContent = user.blog || 'N/A';
  document.querySelector('.urls a').href = user.blog || '#';
  document.querySelector('.urls a').textContent = user.blog || 'N/A';
}

// Fetch user repositories for the current page and sorting criteria
function fetchRepositories(username) {
  fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}&sort=${sortField}&direction=${sortOrder}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to retrieve repositories. Status code: ${response.status}`);
      }
      return response.json();
    })
    .then((repos) => {
      // Update the UI with the fetched repositories
      updateRepositories(repos);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

// Update UI with fetched repositories
function updateRepositories(repos) {
  const contentContainer = document.querySelector('.content');
  contentContainer.innerHTML = '';

  repos.forEach((repo) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h2 class="name">${repo.name}</h2>
      <h5 class="description">${repo.description || 'No description available'}</h5>
      <button class="btn">${repo.language || 'N/A'}</button>
    `;

    card.addEventListener('click', () => {
      openRepo(repo.html_url);
    });

    contentContainer.appendChild(card);
  });
}

// Function to open repository in a new tab
function openRepo(repoUrl) {
  window.open(repoUrl, '_blank');
}

// Fetch total number of repositories for pagination and per page options
function fetchTotalPageCountAndPerPageOptions(username) {
  fetch(`https://api.github.com/users/${username}`)
    .then(response => response.json())
    .then(user => {
      // Calculate total number of pages based on public repositories
      totalPageCount = Math.ceil(user.public_repos / perPage);

      // Update UI with pagination controls and per page options
      updatePaginationAndPerPageOptions(user);
    })
    .catch(error => console.error(error.message));
}

// Update UI with pagination controls and per page options
function updatePaginationAndPerPageOptions(user) {
  const paginationContainer = document.querySelector('.btnContainer');
  const perPageSelect = document.getElementById('perPageSelect');

  // Clear existing options
  perPageSelect.innerHTML = '';

  // Dynamically add per-page options with a maximum of 100
  for (let i = 10; i <= 100; i+=10) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    perPageSelect.appendChild(option);
  }

  // Set default value
  perPageSelect.value = perPage;

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.classList.add('pagination', 'prev');
  prevButton.innerHTML = '&lt;&lt;';
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRepositories(searchedUsername);
    }
  });
  paginationContainer.appendChild(prevButton);

  // Numbered pages
  for (let i = 1; i <= totalPageCount; i++) {
    const paginationButton = document.createElement('button');
    paginationButton.classList.add('pagination');
    paginationButton.textContent = i;
    paginationButton.addEventListener('click', () => {
      currentPage = i;
      fetchRepositories(searchedUsername);
    });
    paginationContainer.appendChild(paginationButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.classList.add('pagination', 'next');
  nextButton.innerHTML = '&gt;&gt;';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPageCount) {
      currentPage++;
      fetchRepositories(searchedUsername);
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Event listener for sorting buttons
document.querySelector('.older').addEventListener('click', () => {
  sortField = 'created';
  sortOrder = 'asc';
  currentPage = 1;
  fetchRepositories(searchedUsername);
});

document.querySelector('.newer').addEventListener('click', () => {
  sortField = 'created';
  sortOrder = 'desc';
  currentPage = 1;
  fetchRepositories(searchedUsername);
});

// Initial fetch for the first page
fetchUserDetails(searchedUsername);
fetchRepositories(searchedUsername);
fetchTotalPageCountAndPerPageOptions(searchedUsername);

// Event listener for per-page filter dropdown
const perPageSelect = document.getElementById('perPageSelect');
const paginationContainer = document.getElementById('paginationContainer');
perPageSelect.addEventListener('change', () => {
  // Update perPage value and reset current page
  perPage = parseInt(perPageSelect.value);
  currentPage = 1;
  // Clear pagination container
  paginationContainer.innerHTML = '';
  // Fetch repositories with updated perPage value
  fetchRepositories(searchedUsername);
  // Update per page options and pagination controls
  fetchTotalPageCountAndPerPageOptions(searchedUsername);
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Function to store search history
function storeSearchHistory(username) {
  // Retrieve existing search history from local storage or initialize an empty array
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Add the new search to the history
  if (!searchHistory.includes(username)) {
    searchHistory.push(username);

    // Store the updated search history back in local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }
}

// Function to fetch and display search history
function displaySearchHistory() {
  // Retrieve search history from local storage
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Display search history in a container (you can customize this part based on your HTML structure)
  const historyContainer = document.getElementById('searchHistoryContainer');
  historyContainer.innerHTML = '';

  searchHistory.forEach((search, index) => {
    const historyItem = document.createElement('div');
    historyItem.textContent = `${index + 1}. ${search}`;
    historyContainer.appendChild(historyItem);
  });
}

searchBtn.addEventListener('click', () => {
  // Update searched username and reset current page
  searchedUsername = searchInput.value;
  document.title = searchedUsername;

  currentPage = 1;
  // Clear pagination container
  paginationContainer.innerHTML = '';
  // Fetch user details, repositories, and update pagination controls
  fetchUserDetails(searchedUsername);
  fetchRepositories(searchedUsername);
  fetchTotalPageCountAndPerPageOptions(searchedUsername);
  // Update and display search history
  displaySearchHistory();
});

// Initial display of search history when the page loads
displaySearchHistory();
