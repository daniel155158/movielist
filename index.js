const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []
let displayMode = 'card' //default為card, 可以切換為list
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeIcon = document.querySelector('#mode-icon')

const MOVIES_PER_PAGE = 12

function renderMovieList(data) {
  let rawHTML = ''
  if (displayMode === 'card') {
    //渲染成card模式
    rawHTML += renderToCardMode(data)
  } else if (displayMode === 'list') {
    //渲染成list模式
    rawHTML += renderToListMode(data)
  }
  dataPanel.innerHTML = rawHTML
}

//渲染成card模式
function renderToCardMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer d-flex justify-content-around">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
        </div>
      </div>
    </div > 
    `
  })
  return rawHTML
}

//渲染成list模式
function renderToListMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
      <p class="d-flex align-items-center m-0">
      ${item.title}
      </p>
      <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
        data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>
    `
  })
  return rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((error) => console.log(error))

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 監聽data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage))
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    searchInput.value = ''
    return alert('Keyword is invalid')
  }
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  ////錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    searchInput.value = ''
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

//監聽表單模式切換事件
modeIcon.addEventListener('click', function onModeClicked(event) {
  const mode = event.target.dataset.id
  console.log(event.target)
  if (mode === 'card-mode') {
    displayMode = 'card'
  } else if (mode === 'list-mode') {
    displayMode = 'list'
  }
  renderMovieList(getMoviesByPage(currentPage))
})
