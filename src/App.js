import {useEffect, useState} from 'react'
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useHistory,
  useParams,
} from 'react-router-dom'
import './App.css'

const API_KEY = 'a30116b45fdadceac6af62622e247a83'
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'

const getMovies = async url => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const MovieCard = ({movie}) => (
  <div className="movie-card">
    <img
      src={`${IMAGE_URL}${movie.poster_path}`}
      alt={movie.title}
      className="movie-image"
    />

    <div className="movie-info">
      <h3>{movie.title}</h3>

      <p>Rating: {movie.vote_average}</p>

      <Link to={`/movie/${movie.id}`}>
        <button type="button">View Details</button>
      </Link>
    </div>
  </div>
)

const MoviesGrid = ({movies}) => (
  <div className="movies-grid">
    {movies.map(movie => (
      <MovieCard movie={movie} key={movie.id} />
    ))}
  </div>
)

const Pagination = ({page, onPageChange}) => (
  <div className="pagination">
    <button
      type="button"
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
    >
      Prev
    </button>

    <p>{page}</p>

    <button type="button" onClick={() => onPageChange(page + 1)}>
      Next
    </button>
  </div>
)

const Navbar = () => {
  const [searchText, setSearchText] = useState('')
  const history = useHistory()

  const onSearch = event => {
    event.preventDefault()

    const searchValue = searchText.trim()

    if (searchValue !== '') {
      history.push(`/search/${encodeURIComponent(searchValue)}`)
    }
  }

  return (
    <nav className="navbar">
      <h1>
        <Link to="/" className="logo">
          movieDB
        </Link>
      </h1>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/top-rated">Top Rated</Link>

        <Link to="/upcoming">Upcoming</Link>
      </div>

      <form className="search-form" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>
    </nav>
  )
}

const MoviesPage = ({type, title}) => {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)

      let url = ''

      if (type === 'popular') {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      } else if (type === 'top-rated') {
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
      } else if (type === 'upcoming') {
        url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`
      }

      const data = await getMovies(url)

      setMovies(data.results || [])
      setLoading(false)

      window.scrollTo(0, 0)
    }

    fetchMovies()
  }, [type, page])

  const changePage = newPage => {
    if (newPage >= 1) {
      setPage(newPage)
    }
  }

  return (
    <div className="page-container">
      <h1>{title}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <MoviesGrid movies={movies} />

          <Pagination page={page} onPageChange={changePage} />
        </>
      )}
    </div>
  )
}

const SearchPage = () => {
  const {query} = useParams()

  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true)

      const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query,
      )}&page=${page}`

      const data = await getMovies(url)

      setMovies(data.results || [])
      setLoading(false)

      window.scrollTo(0, 0)
    }

    fetchSearchResults()
  }, [query, page])

  return (
    <div className="page-container">
      <h1>Search Results</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <MoviesGrid movies={movies} />

          <Pagination page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

const MovieDetails = () => {
  const {id} = useParams()

  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true)

      const movieUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`

      const castUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=en-US`

      const movieData = await getMovies(movieUrl)
      const castData = await getMovies(castUrl)

      setMovie(movieData)
      setCast(castData.cast || [])
      setLoading(false)

      window.scrollTo(0, 0)
    }

    fetchMovieDetails()
  }, [id])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="details-page">
      <div className="movie-details">
        <img
          src={`${IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
          className="details-image"
        />

        <div className="details-content">
          <h1>{movie.title}</h1>

          <p>Rating: {movie.vote_average}</p>

          <p>Duration: {movie.runtime} minutes</p>

          <p>
            Genre:{' '}
            {movie.genres
              ? movie.genres.map(genre => genre.name).join(', ')
              : 'N/A'}
          </p>

          <p>Release Date: {movie.release_date}</p>

          <h2>Overview</h2>

          <p>{movie.overview}</p>
        </div>
      </div>

      <div className="cast-section">
        <h2>Cast</h2>

        <div className="cast-grid">
          {cast.slice(0, 20).map(actor => (
            <div className="cast-card" key={actor.credit_id}>
              <img
                src={
                  actor.profile_path
                    ? `${IMAGE_URL}${actor.profile_path}`
                    : 'https://via.placeholder.com/300x450?text=No+Image'
                }
                alt={actor.original_name}
              />

              <h3>{actor.original_name}</h3>

              <p>{actor.character}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <Navbar />

    <Switch>
      <Route exact path="/">
        <MoviesPage type="popular" title="Popular" />
      </Route>

      <Route exact path="/top-rated">
        <MoviesPage type="top-rated" title="Top Rated" />
      </Route>

      <Route exact path="/upcoming">
        <MoviesPage type="upcoming" title="Upcoming" />
      </Route>

      <Route exact path="/search/:query">
        <SearchPage />
      </Route>

      <Route exact path="/movie/:id">
        <MovieDetails />
      </Route>
    </Switch>
  </BrowserRouter>
)

export default App
