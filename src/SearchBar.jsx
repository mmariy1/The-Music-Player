import { useState } from 'react'
import SearchOutlined from '@mui/icons-material/SearchOutlined';

export default function SearchBar({ onSearch }){
    const [query, setQuery] = useState("")

    const handleSearch = () => {
        if (query.trim() !== "") {
            onSearch(query)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
    <div className="search">
        <input type="text" 
        placeholder="Pesquise por músicas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="input-search"
        ></input>
        <button onClick={handleSearch} className="search-btn"><SearchOutlined 
        style={{ 
            color: 'rgba(255, 255, 255, 0.24)'}}
        />
        </button>
    </div>
)
}