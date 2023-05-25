//Variables
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGES = 12
let currentMode = 'card'
let currentPage = 1
const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const switchPanel = document.querySelector("#switch-panel")
const listButton = document.querySelector('#list-mode-button').parentElement
const cardButton = document.querySelector('#card-mode-button').parentElement


// Functions

//新增一個mode參數，讓函式可以根據不同預覽模式呈現資料
function renderMovieList(data,mode) {
  let rawHTML = ''
  //processing
  if (mode.toLowerCase() === 'card') {
    data.forEach(item => {
      rawHTML += `
    <div class="col-sm-3" style="width:250px;">
      <div class="mb-2">
        <div class="card h-100"> 
          <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie " data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite " data-id ='${item.id}'>+</button>
          </div>
        </div>
      </div>
    </div>`
    })
  } else if (mode.toLowerCase() === 'list') {
    data.forEach(item => {
      rawHTML += `
    <div class="row list-container my-1  border-top  pt-2" >
      <div class="col-8">
        <h5 class="card-title">${item.title}</h5>
      </div>
      <div class="col card-button">
        <button class="btn btn-primary btn-show-movie " data-bs-toggle="modal"
            data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite " data-id ='${item.id}'>+</button>
      </div>
    </div>`
  })
  }
  dataPanel.innerHTML = rawHTML
}

function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGES)
  let rawHTML = '<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>'

  for (let page = 2; page <= numberOfPages; page ++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    ` 
  }
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  
  const data = filteredMovies.length ? filteredMovies : movies 
  const startIndex = (page-1) * MOVIES_PER_PAGES
  return data.slice(startIndex,startIndex + MOVIES_PER_PAGES)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie Poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)){
    return alert('電影已經在清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}

//顯示當前預覽模式
function showCurrentMode (button) {
  if (button.matches('.btn-secondary')) return
  listButton.classList.toggle('btn-secondary')
  listButton.classList.toggle('bg-white')
  cardButton.classList.toggle('btn-secondary')
  cardButton.classList.toggle('bg-white')
}




//Event Listeners

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click',function onPaginatorClicked (event) {
  if (event.target.tagName !== "A") return
  if (currentPage !== Number(event.target.dataset.page)) {
    //讓原先頁面的active狀態取消掉
    paginator.children[currentPage - 1].classList.toggle('active')
    //將當前的頁碼重新賦值按下的頁碼
    currentPage = Number(event.target.dataset.page)
    //顯示當前的頁碼
    event.target.parentElement.classList.toggle("active")
    //重新渲染
    renderMovieList(getMoviesByPage(currentPage), currentMode)
  }
})



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  currentPage = 1

  // if (!keyword.length) {
  //   return alert('Please enter a valid string.')
  // }

  // 利用迴圈過濾電影，並加入清單
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 不使用迴圈的方法
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (filteredMovies.length === 0) {
    searchInput.value = ''
    filteredMovies = movies
    renderPaginator(filteredMovies.length);
    renderMovieList(getMoviesByPage(currentPage), currentMode);
    return alert('Cannot find movies with keyword:' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage),currentMode)
})

// 切換資料預覽方式
switchPanel.addEventListener('click', function onSwitchPanelClicked (event) {
  //清單模式
  if (event.target.matches('#list-mode-button')) {
    showCurrentMode(listButton)
    currentMode = 'list'
    renderMovieList(getMoviesByPage(currentPage),currentMode)
  } else {
  //卡片模式
    const parent = event.target.parentElement
    showCurrentMode(cardButton)
    currentMode = 'card'
    renderMovieList(getMoviesByPage(currentPage), currentMode)
  }
}
)

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(currentPage),currentMode)
})
