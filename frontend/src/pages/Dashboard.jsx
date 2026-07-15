import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, Calendar, FileText, BarChart, 
  Plus, Users, Eye, HelpCircle, Check, X, 
  MessageSquare, TrendingUp, DollarSign, Percent, AlertCircle 
} from 'lucide-react';
import LeaseSigner from '../components/LeaseSigner';

const Dashboard = ({ onViewChange, setSelectionSearch }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('first');
  const [activeLeaseId, setActiveLeaseId] = useState(null); // for opening LeaseSigner

  // Lists states
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [leases, setLeases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [newType, setNewType] = useState('Apartment');
  const [newBeds, setNewBeds] = useState('2');
  const [newBaths, setNewBaths] = useState('1.5');
  const [newArea, setNewArea] = useState('1000');
  const [newImg, setNewImg] = useState('');
  const [newTour, setNewTour] = useState('');
  const [newAmenities, setNewAmenities] = useState([]);

  const amenitiesList = ['Gym', 'Pool', 'Parking', 'Pets Allowed', 'Garden', 'Smart Home', 'Security', 'High-speed Wifi', 'Fireplace'];

  // Global loading
  const [loading, setLoading] = useState(true);

  // Fetch role-specific data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.role === 'renter') {
        // Bookings
        const bookRes = await fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
        if (bookRes.ok) setBookings(await bookRes.json());

        // Leases
        const leaseRes = await fetch('/api/leases', { headers: { 'Authorization': `Bearer ${token}` } });
        if (leaseRes.ok) setLeases(await leaseRes.json());

        // Favorites (fetch all properties, filter locally)
        const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        const propRes = await fetch('/api/properties');
        if (propRes.ok) {
          const allProps = await propRes.json();
          setProperties(allProps.filter(p => favIds.includes(p.id)));
        }
      } 
      else if (user.role === 'landlord') {
        // Listings
        const propRes = await fetch('/api/properties');
        if (propRes.ok) {
          const allProps = await propRes.json();
          setProperties(allProps.filter(p => p.ownerId === user.id));
        }

        // Tour requests
        const bookRes = await fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
        if (bookRes.ok) setBookings(await bookRes.json());

        // Leases
        const leaseRes = await fetch('/api/leases', { headers: { 'Authorization': `Bearer ${token}` } });
        if (leaseRes.ok) setLeases(await leaseRes.json());

        // Analytics
        const analyticsRes = await fetch('/api/analytics/landlord', { headers: { 'Authorization': `Bearer ${token}` } });
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      } 
      else if (user.role === 'agent') {
        // Marketing & Client Lead Analytics
        const analyticsRes = await fetch('/api/analytics/agent', { headers: { 'Authorization': `Bearer ${token}` } });
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
          setProperties(data.propertiesList || []);
        }
      } 
      else if (user.role === 'admin') {
        // Overview Stats
        const analyticsRes = await fetch('/api/analytics/overview', { headers: { 'Authorization': `Bearer ${token}` } });
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());

        // All Users
        // Admin gets custom user fetching mockup from API
        const userRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }); // just placeholder
        // Fallback seed list
        
        // All Listings
        const propRes = await fetch('/api/properties');
        if (propRes.ok) setProperties(await propRes.json());
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    fetchData();
  }, [token, user]);

  const handleUpdateBookingStatus = async (bookingId, nextStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          price: newPrice,
          location: newLoc,
          address: newAddr,
          type: newType,
          bedrooms: newBeds,
          bathrooms: newBaths,
          area: newArea,
          image: newImg,
          virtualTourUrl: newTour,
          amenities: newAmenities
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        // Reset form
        setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewLoc(''); setNewAddr('');
        setNewAmenities([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFormAmenity = (amenity) => {
    if (newAmenities.includes(amenity)) {
      setNewAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setNewAmenities(prev => [...prev, amenity]);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        Loading dashboard...
      </div>
    );
  }

  // RENDER RENTER DASHBOARD
  const renderRenterDashboard = () => {
    return (
      <div>
        <div className="tabs-container">
          <button onClick={() => { setActiveTab('first'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'first' ? 'active' : ''}`}>Favorites ({properties.length})</button>
          <button onClick={() => { setActiveTab('second'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'second' ? 'active' : ''}`}>Tour Bookings ({bookings.length})</button>
          <button onClick={() => { setActiveTab('third'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'third' ? 'active' : ''}`}>Lease Agreements ({leases.length})</button>
        </div>

        {activeLeaseId ? (
          <LeaseSigner leaseId={activeLeaseId} onClose={() => setActiveLeaseId(null)} onRefresh={fetchData} />
        ) : (
          <>
            {activeTab === 'first' && (
              <div>
                {properties.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any listings yet. Browse home listings and click the heart icon!</p>
                ) : (
                  <div className="grid-cards">
                    {properties.map(p => (
                      <div 
                        key={p.id} 
                        className="hover-card" 
                        onClick={() => {
                          setSelectionSearch(prev => ({ ...prev, selectedPropertyId: p.id }));
                          onViewChange('property-details');
                        }}
                        style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }}
                      >
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                        <div style={{ padding: '16px' }}>
                          <h4 style={{ fontWeight: 700 }}>{p.title}</h4>
                          <span style={{ color: 'var(--accent-color)', fontWeight: 600, display: 'block', marginTop: '4px' }}>${p.price}/mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'second' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No scheduled tours.</p>
                ) : (
                  bookings.map(b => (
                    <div key={b.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{b.property?.title}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Date: {b.date} at {b.time} ({b.tourType === 'virtual' ? 'Virtual Tour' : 'In-Person'})
                        </span>
                      </div>
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: b.status === 'approved' ? 'var(--success-light)' : b.status === 'pending' ? 'var(--accent-light)' : 'hsla(0, 84%, 60%, 0.1)',
                        color: b.status === 'approved' ? 'var(--success-color)' : b.status === 'pending' ? 'var(--accent-color)' : 'var(--danger-color)'
                      }}>
                        {b.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'third' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leases.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No lease negotiations active.</p>
                ) : (
                  leases.map(l => (
                    <div key={l.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{l.property?.title}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Rent: ${l.proposedRent}/mo • Term: {l.startDate} to {l.endDate}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: l.status === 'active' ? 'var(--success-light)' : 'var(--accent-light)',
                          color: l.status === 'active' ? 'var(--success-color)' : 'var(--accent-color)'
                        }}>
                          {l.status}
                        </span>
                        <button onClick={() => setActiveLeaseId(l.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Open Contract
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // RENDER LANDLORD DASHBOARD
  const renderLandlordDashboard = () => {
    return (
      <div>
        <div className="tabs-container">
          <button onClick={() => { setActiveTab('first'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'first' ? 'active' : ''}`}>My Listings ({properties.length})</button>
          <button onClick={() => { setActiveTab('second'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'second' ? 'active' : ''}`}>Tours Approvals ({bookings.length})</button>
          <button onClick={() => { setActiveTab('third'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'third' ? 'active' : ''}`}>Active Contracts ({leases.length})</button>
          <button onClick={() => { setActiveTab('fourth'); setActiveLeaseId(null); }} className={`tab-btn ${activeTab === 'fourth' ? 'active' : ''}`}>Listing Analytics</button>
        </div>

        {activeLeaseId ? (
          <LeaseSigner leaseId={activeLeaseId} onClose={() => setActiveLeaseId(null)} onRefresh={fetchData} />
        ) : (
          <>
            {activeTab === 'first' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Managed Listings</h3>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add New Listing
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={handleAddProperty} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create Property Listing</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Property Title</label>
                        <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Modern Glass Villa" className="form-input" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Monthly Rent ($)</label>
                        <input type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 2500" className="form-input" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Location (Region/City)</label>
                        <input type="text" required value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="e.g. Beverly Suburbs" className="form-input" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Full Street Address</label>
                        <input type="text" required value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="e.g. 12 Pine Street, Beverly Suburbs" className="form-input" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Property Type</label>
                        <select value={newType} onChange={e => setNewType(e.target.value)} className="form-input">
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Studio">Studio</option>
                          <option value="House">House</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Bedrooms</label>
                          <input type="number" required value={newBeds} onChange={e => setNewBeds(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Bathrooms</label>
                          <input type="number" step="0.5" required value={newBaths} onChange={e => setNewBaths(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Area (sqft)</label>
                          <input type="number" required value={newArea} onChange={e => setNewArea(e.target.value)} className="form-input" />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Image URL (Optional)</label>
                        <input type="text" value={newImg} onChange={e => setNewImg(e.target.value)} placeholder="Paste photo link" className="form-input" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Matterport / Virtual Tour URL (Optional)</label>
                        <input type="text" value={newTour} onChange={e => setNewTour(e.target.value)} placeholder="Paste tour link" className="form-input" />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Amenities</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {amenitiesList.map(item => (
                          <button
                            type="button"
                            key={item}
                            onClick={() => toggleFormAmenity(item)}
                            className={newAmenities.includes(item) ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary">Publish Listing</button>
                    </div>
                  </form>
                )}

                <div className="grid-cards">
                  {properties.map(p => (
                    <div key={p.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      <div style={{ padding: '20px' }}>
                        <h4 style={{ fontWeight: 700 }}>{p.title}</h4>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 600, display: 'block', marginTop: '4px' }}>${p.price}/mo</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '10px' }}>
                          <span>👁 {p.views} views</span>
                          <span>📩 {p.inquiries} inquiries</span>
                          <span style={{ color: p.status === 'available' ? 'var(--success-color)' : 'var(--text-muted)', fontWeight: 600 }}>{p.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'second' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No tour requests received.</p>
                ) : (
                  bookings.map(b => (
                    <div key={b.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{b.property?.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Requested by <strong>{b.renter?.name}</strong> ({b.renter?.email})
                        </p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          Slot: {b.date} at {b.time} ({b.tourType})
                        </span>
                      </div>
                      
                      {b.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'approved')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--success-color)' }}>
                            <Check size={14} /> Approve
                          </button>
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'declined')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger-color)' }}>
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: b.status === 'approved' ? 'var(--success-light)' : 'hsla(0, 84%, 60%, 0.1)',
                          color: b.status === 'approved' ? 'var(--success-color)' : 'var(--danger-color)'
                        }}>
                          {b.status}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'third' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leases.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No active contracts.</p>
                ) : (
                  leases.map(l => (
                    <div key={l.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 700 }}>{l.property?.title}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Tenant: {l.renter?.name} • Rent: ${l.proposedRent}/mo
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: l.status === 'active' ? 'var(--success-light)' : 'var(--accent-light)',
                          color: l.status === 'active' ? 'var(--success-color)' : 'var(--accent-color)'
                        }}>
                          {l.status}
                        </span>
                        <button onClick={() => setActiveLeaseId(l.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Review/Sign
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'fourth' && analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Projected Monthly Rent</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-color)' }}>
                    ${analytics.monthlyRevenue?.toLocaleString()}
                  </div>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Portfolio Occupancy</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
                    {analytics.occupancyRate}%
                  </div>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Listing Views</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
                    {analytics.totalViews}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // RENDER AGENT DASHBOARD
  const renderAgentDashboard = () => {
    return (
      <div>
        <div className="tabs-container">
          <button onClick={() => setActiveTab('first')} className={`tab-btn ${activeTab === 'first' ? 'active' : ''}`}>Client Outreach Tracker</button>
          <button onClick={() => setActiveTab('second')} className={`tab-btn ${activeTab === 'second' ? 'active' : ''}`}>Marketing Analytics</button>
        </div>

        {activeTab === 'first' && analytics && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Assigned Lead Contacts</h3>
            {(!analytics.clients || analytics.clients.length === 0) ? (
              <p style={{ color: 'var(--text-secondary)' }}>No active client leads at the moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.clients.map(c => (
                  <div key={c.id} className="glass" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{c.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.email}</span>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Tours Booked: {c.toursBooked}</span>
                        <span>Offers Submitted: {c.leasesStarted}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '10px',
                        backgroundColor: c.status === 'Rented' ? 'var(--success-light)' : 'var(--accent-light)',
                        color: c.status === 'Rented' ? 'var(--success-color)' : 'var(--accent-color)'
                      }}>
                        {c.status}
                      </span>
                      <button onClick={() => onViewChange('chat')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={14} /> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'second' && analytics && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Managed Listings</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{analytics.totalListings}</div>
              </div>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Reach Views</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{analytics.totalViews}</div>
              </div>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Inquiries</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-color)' }}>{analytics.totalInquiries}</div>
              </div>
            </div>

            {/* Custom SVG Performance Graph */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Listing Visual Reach Analytics</h4>
              <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px' }}>
                {(properties || []).map(p => {
                  const maxView = Math.max(...properties.map(item => item.views || 1), 100);
                  const barHeight = Math.max(10, Math.round(((p.views || 0) / maxView) * 160));
                  return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>{p.views}</span>
                      <div className="gradient-bg" style={{ width: '40px', height: `${barHeight}px`, borderRadius: '6px 6px 0 0' }}></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // RENDER ADMIN DASHBOARD
  const renderAdminDashboard = () => {
    return (
      <div>
        <div className="tabs-container">
          <button onClick={() => setActiveTab('first')} className={`tab-btn ${activeTab === 'first' ? 'active' : ''}`}>System Overview</button>
          <button onClick={() => setActiveTab('second')} className={`tab-btn ${activeTab === 'second' ? 'active' : ''}`}>Platform Listings ({properties.length})</button>
        </div>

        {activeTab === 'first' && analytics && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Accounts</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{analytics.totalUsers}</div>
              </div>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Listings</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{analytics.totalProperties}</div>
              </div>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Leases Active</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--success-color)' }}>{analytics.activeLeases}</div>
              </div>
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Platform Average Rent</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>${analytics.avgRent}/mo</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Accounts Roles Split */}
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>User Roles Allocation</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(analytics.roles || {}).map(([role, count]) => {
                    const total = Object.values(analytics.roles).reduce((sum, c) => sum + c, 0);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={role} style={{ fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize', fontWeight: 500, marginBottom: '4px' }}>
                          <span>{role}s</span>
                          <strong>{count} ({pct}%)</strong>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="gradient-bg" style={{ width: `${pct}%`, height: '100%' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Property types distribution */}
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Listings by Property Type</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(analytics.propertyTypes || {}).map(([type, count]) => {
                    const total = Object.values(analytics.propertyTypes).reduce((sum, c) => sum + c, 0);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={type} style={{ fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, marginBottom: '4px' }}>
                          <span>{type}s</span>
                          <strong>{count} ({pct}%)</strong>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="gradient-bg" style={{ width: `${pct}%`, height: '100%', opacity: 0.85 }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'second' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {properties.map(p => (
              <div key={p.id} className="glass" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700 }}>{p.title}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.address} • Rent: ${p.price}/mo</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setSelectionSearch(prev => ({ ...prev, selectedPropertyId: p.id }));
                      onViewChange('property-details');
                    }}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container fade-in" style={{ padding: '24px 16px' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Workspace Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Welcome back, <strong>{user.name}</strong>. Managing your real estate portfolio as an active <span style={{ textTransform: 'capitalize', color: 'var(--accent-color)', fontWeight: 600 }}>{user.role}</span>.
          </p>
        </div>
      </div>

      {/* Render role specific panels */}
      {user.role === 'renter' && renderRenterDashboard()}
      {user.role === 'landlord' && renderLandlordDashboard()}
      {user.role === 'agent' && renderAgentDashboard()}
      {user.role === 'admin' && renderAdminDashboard()}

    </div>
  );
};

export default Dashboard;
