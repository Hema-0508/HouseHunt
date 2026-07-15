import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Grid, List, Check, Heart, Shield } from 'lucide-react';

const SearchPage = ({ onViewChange, selectionSearch, setSelectionSearch }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites') || '[]'));
  
  // Filter States initialized from global selectionSearch
  const [search, setSearch] = useState(selectionSearch.search || '');
  const [location, setLocation] = useState(selectionSearch.location || '');
  const [type, setType] = useState(selectionSearch.type || 'All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(6000);
  const [bedrooms, setBedrooms] = useState('Any');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [activeMapPin, setActiveMapPin] = useState(null);

  const amenitiesList = ['Gym', 'Pool', 'Parking', 'Pets Allowed', 'Garden', 'Smart Home', 'Security', 'High-speed Wifi', 'Fireplace'];

  // Toggle favorite
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Fetch properties whenever filters change
  useEffect(() => {
    setLoading(true);
    let url = `/api/properties?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}&type=${type}&minPrice=${minPrice}&maxPrice=${maxPrice}&bedrooms=${bedrooms}`;
    
    if (selectedAmenities.length > 0) {
      url += `&amenities=${encodeURIComponent(selectedAmenities.join(','))}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching filtered properties:', err);
        setLoading(false);
      });
  }, [search, location, type, minPrice, maxPrice, bedrooms, selectedAmenities]);

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleSelectProperty = (id) => {
    setSelectionSearch(prev => ({ ...prev, selectedPropertyId: id }));
    onViewChange('property-details');
  };

  return (
    <div className="page-container fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', padding: '24px 16px' }}>
      
      {/* Sidebar Filters */}
      <aside className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Filter Listings</h2>
        
        {/* Search */}
        <div className="form-group">
          <label className="form-label">Keyword</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <SearchIcon size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="e.g. Skyline, Studio" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label">Location</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="e.g. Downtown" 
              value={location} 
              onChange={e => setLocation(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="form-group">
          <label className="form-label">Property Type</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="form-input" 
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          >
            <option value="All">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="House">House</option>
          </select>
        </div>

        {/* Price Slider */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Max Price</span>
            <strong>${maxPrice}/mo</strong>
          </label>
          <input 
            type="range" 
            min="1000" 
            max="6000" 
            step="100" 
            value={maxPrice} 
            onChange={e => setMaxPrice(parseInt(e.target.value))}
            style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
        </div>

        {/* Bedrooms */}
        <div className="form-group">
          <label className="form-label">Bedrooms</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Any', '1', '2', '3', '4+'].map(val => (
              <button
                key={val}
                onClick={() => setBedrooms(val === '4+' ? '4' : val)}
                className={((bedrooms === 'Any' && val === 'Any') || (bedrooms === val) || (bedrooms === '4' && val === '4+')) ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '8px 0', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Checkbox list */}
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>Amenities</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {amenitiesList.map(item => (
              <label 
                key={item} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  color: selectedAmenities.includes(item) ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <div 
                  onClick={() => toggleAmenity(item)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedAmenities.includes(item) ? 'var(--accent-color)' : 'var(--bg-secondary)',
                    color: 'white',
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  {selectedAmenities.includes(item) && <Check size={12} strokeWidth={3} />}
                </div>
                {item}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Results Workspace */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Found <strong>{properties.length}</strong> matching properties
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px' }}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px' }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Map Mockup Integration */}
        {properties.length > 0 && (
          <div 
            className="glass" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              height: '180px', 
              position: 'relative',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Draw a gorgeous stylized vector map */}
            <svg width="100%" height="100%" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              {/* Landmass/road styling paths */}
              <path d="M 0,40 Q 200,80 400,20 T 900,100" stroke="var(--border-color)" strokeWidth="12" fill="none" opacity="0.4" />
              <path d="M 120,0 Q 250,150 200,200 T 500,300" stroke="var(--border-color)" strokeWidth="8" fill="none" opacity="0.4" />
              <path d="M 0,130 L 900,150" stroke="var(--border-color)" strokeWidth="6" fill="none" opacity="0.3" />
              
              {/* Dynamic Property Pins on the map */}
              {properties.map((p, idx) => {
                // Calculate pseudo-coordinates based on index
                const x = 50 + (idx * 160) % 700;
                const y = 40 + (idx * 45) % 110;
                const isSelected = activeMapPin === p.id;

                return (
                  <g 
                    key={p.id} 
                    transform={`translate(${x}, ${y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveMapPin(p.id === activeMapPin ? null : p.id)}
                  >
                    {/* Glow ring */}
                    <circle r={isSelected ? 16 : 8} fill={isSelected ? 'var(--accent-color)' : 'hsla(250, 89%, 65%, 0.3)'} opacity={isSelected ? 0.3 : 0.6} />
                    {/* Pin body */}
                    <path d="M0,0 C-4,-4 -8,-8 -8,-14 C-8,-19 -4,-23 0,-23 C4,-23 8,-19 8,-14 C8,-8 4,-4 0,0 Z" fill="var(--accent-color)" />
                    {/* Pin dot */}
                    <circle cy="-14" r="3.5" fill="white" />

                    {/* Pop-up bubble on hover/click */}
                    {isSelected && (
                      <foreignObject x="-70" y="-72" width="140" height="45">
                        <div style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid var(--accent-color)',
                          boxShadow: 'var(--shadow-md)',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {p.title}
                          <div style={{ color: 'var(--accent-color)', fontSize: '0.7rem' }}>${p.price}/mo</div>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              Interactive Area Map (Click markers to select properties)
            </div>
          </div>
        )}

        {/* Listings Display Grid / List */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No properties found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid-cards' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '20px' } : {}}>
            {properties.map(p => (
              <div 
                key={p.id} 
                className="hover-card" 
                onClick={() => handleSelectProperty(p.id)}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: viewMode === 'list' ? 'row' : 'column',
                  maxHeight: viewMode === 'list' ? '220px' : 'none',
                  cursor: 'pointer',
                  border: activeMapPin === p.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  boxShadow: activeMapPin === p.id ? 'var(--shadow-glow)' : 'none'
                }}
              >
                {/* Image */}
                <div style={{ 
                  position: 'relative', 
                  height: viewMode === 'list' ? '100%' : '200px', 
                  width: viewMode === 'list' ? '300px' : '100%',
                  flexShrink: 0
                }}>
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    ${p.price}/mo
                  </div>

                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => toggleFavorite(p.id, e)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: favorites.includes(p.id) ? 'var(--danger-color)' : 'var(--text-secondary)'
                    }}
                  >
                    <Heart size={16} fill={favorites.includes(p.id) ? 'var(--danger-color)' : 'none'} />
                  </button>
                </div>
                
                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{p.type}</span>
                      {p.views > 200 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--warning-color)', backgroundColor: 'hsla(38, 92%, 58%, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Shield size={10} /> Popular
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 8px 0' }}>{p.title}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <MapPin size={14} /> {p.address}
                    </p>
                    {viewMode === 'list' && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '8px' }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span><strong>{p.bedrooms}</strong> Beds</span>
                      <span><strong>{p.bathrooms}</strong> Baths</span>
                      <span><strong>{p.area}</strong> sqft</span>
                    </div>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.views} views • {p.inquiries} inquiries
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
