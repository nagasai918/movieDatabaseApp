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

const API_KEY = '2928dc0b8f5060e3654c7e5538ebd78c'
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'
const NO_IMAGE = 'https://via.placeholder.com/500x750?text=No+Image'

const getMovies = async url => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  return response.json()
}

const MovieCard = ({movie}) => {
  const image = movie.poster_path
    ? `${IMAGE_URL}${movie.poster_path}`
    : NO_IMAGE

  return (
    <div className="movie-card">
      <img src={image} alt={movie.title} className="movie-image" />

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>Rating: {movie.vote_average}</p>

        <Link to={`/movie/${movie.id}`}>
          <button type="button">View Details</button>
        </Link>
      </div>
    </div>
  )
}

const MoviesGrid = ({movies}) => {
  if (movies.length === 0) {
    return <p className="message">No movies found.</p>
  }

  return (
    <div className="movies-grid">
      {movies.map(movie => (
        <MovieCard movie={movie} key={movie.id} />
      ))}
    </div>
  )
}

const Pagination = ({page, onPageChange}) => (
  <div className="pagination">
    <button
      type="button"
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
    >
      Prev
    </button>

    <span>{page}</span>

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

    const value = searchText.trim()

    if (value !== '') {
      history.push(`/search/${encodeURIComponent(value)}`)
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
        <Link to="/" aria-label="Home">
          Home
        </Link>

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
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError(false)

      let url = ''

      if (type === 'popular') {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      } else if (type === 'top-rated') {
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
      } else {
        url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`
      }

      try {
        const data = await getMovies(url)
        setMovies(data.results || [])
      } catch (err) {
        setError(true)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [type, page])

  useEffect(() => {
    setPage(1)
  }, [type])

  return (
    <div className="page-container">
      <h1>{title}</h1>

      {loading && <p className="message">Loading...</p>}

      {error && (
        <p className="message">Something went wrong. Please try again.</p>
      )}

      {!loading && !error && (
        <>
          <MoviesGrid movies={movies} />

          <Pagination page={page} onPageChange={setPage} />
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
  const [error, setError] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    const fetchSearchMovies = async () => {
      setLoading(true)
      setError(false)

      const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query,
      )}&page=${page}`

      try {
        const data = await getMovies(url)
        setMovies(data.results || [])
      } catch (err) {
        setError(true)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchMovies()
  }, [query, page])

  return (
    <div className="page-container">
      <h1>Search Results</h1>

      {loading && <p className="message">Loading...</p>}

      {error && (
        <p className="message">Something went wrong. Please try again.</p>
      )}

      {!loading && !error && (
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
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(false)

      const movieUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`

      const castUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=en-US`

      try {
        const [movieData, castData] = await Promise.all([
          getMovies(movieUrl),
          getMovies(castUrl),
        ])

        setMovie(movieData)
        setCast(castData.cast || [])
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  if (loading) {
    return <p className="message">Loading...</p>
  }

  if (error || !movie) {
    return <p className="message">Something went wrong. Please try again.</p>
  }

  const image = movie.poster_path
    ? `${IMAGE_URL}${movie.poster_path}`
    : NO_IMAGE

  const genres =
    movie.genres && movie.genres.length > 0
      ? movie.genres.map(genre => genre.name).join(', ')
      : 'N/A'

  return (
    <div className="details-page">
      <div className="movie-details">
        <img src={image} alt={movie.title} className="details-image" />

        <div className="details-content">
          <h1>{movie.title}</h1>

          <p>Rating: {movie.vote_average}</p>

          <p>Duration: {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>

          <p>Genre: {genres}</p>

          <p>Release Date: {movie.release_date || 'N/A'}</p>

          <h2>Overview</h2>

          <p>{movie.overview || 'No overview available.'}</p>
        </div>
      </div>

      <div className="cast-section">
        <h2>Cast</h2>

        <div className="cast-grid">
          {cast.slice(0, 20).map(actor => {
            const castImage = actor.profile_path
              ? `${IMAGE_URL}${actor.profile_path}`
              : NO_IMAGE

            return (
              <div className="cast-card" key={actor.credit_id}>
                <img src={castImage} alt={actor.original_name} />

                <h3>{actor.original_name}</h3>

                <p>{actor.character}</p>
              </div>
            )
          })}
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
