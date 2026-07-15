import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Home, ArrowRight, TrendingUp, Key, Percent } from 'lucide-react';

const Landing = ({ onViewChange, setSelectionSearch }) => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [rentInput, setRentInput] = useState(2000);
  const [homeValue, setHomeValue] = useState(350000);
  const [calcResult, setCalcResult] = useState('');

  // Fetch featured properties
  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        // Take top 3 as featured
        setProperties(data.slice(0, 3));
      })
      .catch(err => console.error('Error fetching properties:', err));
  }, []);

  // Rent vs Buy Calculation
  useEffect(() => {
    const monthlyMortgage = Math.round((homeValue * 0.005) + (homeValue * 0.001)); // simplified estimation (interest + taxes)
    if (rentInput < monthlyMortgage) {
      setCalcResult(`Renting is estimated to save you $${monthlyMortgage - rentInput}/mo compared to buying this property.`);
    } else {
      setCalcResult(`Buying is estimated to be more cost-effective. Your mortgage would be around $${monthlyMortgage}/mo.`);
    }
  }, [rentInput, homeValue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectionSearch({
      search: searchQuery,
      location: searchLocation,
      type: searchType
    });
    onViewChange('search');
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '120px 0 80px 0',
        background: 'radial-gradient(circle at 80% 20%, hsla(250, 89%, 65%, 0.15) 0%, transparent 60%)',
        overflow: 'hidden'
      }}>
        <div className="page-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{
            background: 'var(--accent-light)',
            color: 'var(--accent-color)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            Revolutionizing Real Estate
          </span>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '20px',
            maxWidth: '900px',
            margin: '0 auto 20px auto'
          }}>
            Discover Your Perfect Space With <span className="gradient-text">HouseHunt</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            Detailed listings, interactive virtual tours, automated lease builder, and real-time market data—all in one streamlined platform.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearchSubmit}
            className="glass" 
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              padding: '16px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by keywords..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} 
              />
            </div>
            
            <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Location..." 
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} 
              />
            </div>

            <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Home size={18} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="House">House</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 28px', borderRadius: 'var(--radius-md)' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Properties</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Explore top-rated listings managed by verified professionals.</p>
            </div>
            <button onClick={() => onViewChange('search')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-cards">
            {properties.map(p => (
              <div key={p.id} className="hover-card" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
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
                  {p.virtualTourUrl && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      3D Virtual Tour
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{p.type}</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 8px 0', lineBreak: 'strict' }}>{p.title}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <MapPin size={14} /> {p.address}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '16px' }}>
                      <span><strong>{p.bedrooms}</strong> Beds</span>
                      <span><strong>{p.bathrooms}</strong> Baths</span>
                      <span><strong>{p.area}</strong> sqft</span>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectionSearch(prev => ({ ...prev, selectedPropertyId: p.id }));
                        onViewChange('property-details');
                      }}
                      className="btn-primary" 
                      style={{ width: '100%', padding: '10px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights & Calculator Section */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* Market Insights Visualizer */}
          <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <TrendingUp size={24} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Real-Time Insights</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Average rental trends in key neighborhoods showing a steady growth pattern of 4.2% year-over-year.
            </p>

            {/* Custom SVG Bar Chart */}
            <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>$1.8K</span>
                <div className="gradient-bg" style={{ width: '32px', height: '60px', borderRadius: '6px 6px 0 0' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Studio</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>$2.4K</span>
                <div className="gradient-bg" style={{ width: '32px', height: '90px', borderRadius: '6px 6px 0 0', opacity: 0.8 }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>1 Bed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>$3.2K</span>
                <div className="gradient-bg" style={{ width: '32px', height: '130px', borderRadius: '6px 6px 0 0', opacity: 0.9 }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>2 Bed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>$4.1K</span>
                <div className="gradient-bg" style={{ width: '32px', height: '160px', borderRadius: '6px 6px 0 0' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Penthouse</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'center', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>▲ High demand in Downtown</span>
              <span style={{ color: 'var(--text-secondary)' }}>● Stabilizing in suburbs</span>
            </div>
          </div>

          {/* Rent vs Buy Interactive Tool */}
          <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Percent size={24} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rent vs. Buy Calculator</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Estimate if buying or renting is better based on current price indexes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Target Monthly Rent</span>
                  <strong>${rentInput}</strong>
                </label>
                <input 
                  type="range" 
                  min="800" 
                  max="6000" 
                  step="100" 
                  value={rentInput} 
                  onChange={e => setRentInput(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Target Purchase Home Value</span>
                  <strong>${homeValue.toLocaleString()}</strong>
                </label>
                <input 
                  type="range" 
                  min="100000" 
                  max="1000000" 
                  step="10000" 
                  value={homeValue} 
                  onChange={e => setHomeValue(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--accent-light)', 
              border: '1px dashed var(--accent-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {calcResult}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
