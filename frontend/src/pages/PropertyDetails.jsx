import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Video, 
  User, Send, DollarSign, Home, Percent, 
  HelpCircle, Compass, Sparkles 
} from 'lucide-react';
import VirtualTour from '../components/VirtualTour';

const PropertyDetails = ({ onViewChange, selectionSearch, setSelectionSearch }) => {
  const { user, token } = useAuth();
  const propertyId = selectionSearch.selectedPropertyId;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [tourType, setTourType] = useState('virtual');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  // Inquiry Form State
  const [messageText, setMessageText] = useState('Hi! I am interested in renting this property and would like to coordinate a walkthrough. Thank you!');
  const [messageStatus, setMessageStatus] = useState('');

  // Mortgage Calculator State
  const [downPayment, setDownPayment] = useState(20); // 20%
  const [interestRate, setInterestRate] = useState(5.5); // 5.5%
  const [loanTerm, setLoanTerm] = useState(30); // 30 years
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Virtual Tour View State
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    fetch(`/api/properties/${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching property details:', err);
        setLoading(false);
      });
  }, [propertyId]);

  // Run mortgage calculator whenever inputs change
  useEffect(() => {
    if (!property) return;
    // Estimate buy value of property as 120 * monthly rent
    const estimatedValue = property.price * 120;
    const loanAmount = estimatedValue * (1 - downPayment / 100);
    const monthlyRate = interestRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;

    let payment = 0;
    if (monthlyRate === 0) {
      payment = loanAmount / numberOfPayments;
    } else {
      payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    setMonthlyPayment(Math.round(payment));
  }, [property, downPayment, interestRate, loanTerm]);

  const handleBookTour = async (e) => {
    e.preventDefault();
    if (!token) {
      onViewChange('login');
      return;
    }
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property.id,
          tourType,
          date: bookingDate,
          time: bookingTime
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBookingStatus('success');
      } else {
        setBookingStatus(data.message || 'Booking failed');
      }
    } catch (err) {
      setBookingStatus('Server error occurred.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!token) {
      onViewChange('login');
      return;
    }
    const receiverId = property.agentId || property.ownerId;
    if (!receiverId) {
      setMessageStatus('No agent/owner assigned to this listing.');
      return;
    }
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          content: messageText
        })
      });
      if (res.ok) {
        setMessageStatus('success');
        setMessageText('');
        // Wait 1 second and redirect to chat
        setTimeout(() => {
          onViewChange('chat');
        }, 1200);
      } else {
        const data = await res.json();
        setMessageStatus(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setMessageStatus('Server error occurred.');
    }
  };

  const handleStartNegotiation = async () => {
    if (!token) {
      onViewChange('login');
      return;
    }
    try {
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: property.id,
          rent: property.price,
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days out
          endDate: new Date(Date.now() + 380 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year out
          notes: 'Applying for rental lease and starting rent negotiation.'
        })
      });
      const data = await res.json();
      if (res.ok) {
        onViewChange('dashboard');
      } else {
        alert(data.message || 'Failed to start negotiation.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <p>Property not found.</p>
        <button onClick={() => onViewChange('search')} className="btn-secondary" style={{ marginTop: '20px' }}>
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="page-container fade-in" style={{ padding: '24px 16px' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => onViewChange('search')} 
        className="btn-secondary" 
        style={{ marginBottom: '20px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Back to Search
      </button>

      {/* Main Grid: Details left, widgets right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Header Image / Virtual Tour Slider */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '400px', border: '1px solid var(--border-color)' }}>
            {showVirtualTour ? (
              <VirtualTour onClose={() => setShowVirtualTour(false)} propertyTitle={property.title} />
            ) : (
              <>
                <img src={property.image} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {property.virtualTourUrl && (
                  <button 
                    onClick={() => setShowVirtualTour(true)}
                    className="btn-primary" 
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <Compass className="animate-spin" size={18} /> Launch 3D Virtual Tour
                  </button>
                )}
              </>
            )}
          </div>

          {/* Title & Core Meta */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--accent-color)',
                  backgroundColor: 'var(--accent-light)',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  {property.type}
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0' }}>{property.title}</h1>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <MapPin size={18} /> {property.address}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>${property.price}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>/mo</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{property.views} views recorded</div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bedrooms</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{property.bedrooms}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bathrooms</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{property.bathrooms}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Living Area</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{property.area} sqft</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pricing Type</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>Rent</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>About This Space</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>{property.description}</p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Property Amenities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {property.amenities.map(item => (
                <div 
                  key={item} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Buy Equivalence / Mortgage Calculator */}
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginTop: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Percent size={20} style={{ color: 'var(--accent-color)' }} /> 
              Buy Equivalence Estimator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Compare renting this property against purchase metrics based on an estimated asset value of <strong>${(property.price * 120).toLocaleString()}</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Down Payment (%)</label>
                <input 
                  type="number" 
                  value={downPayment} 
                  onChange={e => setDownPayment(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="form-input" 
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Interest Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={interestRate} 
                  onChange={e => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="form-input" 
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Loan Term (Yrs)</label>
                <input 
                  type="number" 
                  value={loanTerm} 
                  onChange={e => setLoanTerm(Math.max(1, parseInt(e.target.value) || 30))}
                  className="form-input" 
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Monthly Mortgage</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${monthlyPayment.toLocaleString()}
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Renting Saves You:</span>
                <div style={{ 
                  color: (property.price < monthlyPayment) ? 'var(--success-color)' : 'var(--danger-color)', 
                  fontWeight: 700, 
                  fontSize: '1.2rem',
                  marginTop: '2px'
                }}>
                  {property.price < monthlyPayment 
                    ? `+$${(monthlyPayment - property.price).toLocaleString()}/mo` 
                    : `-$${(property.price - monthlyPayment).toLocaleString()}/mo`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Action Card: Rent now / Start lease */}
          <div className="glass gradient-glow" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-color)' }} /> Ready to Move In?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Lock in this home today. Start a direct lease negotiation contract and lock in the rental application.
            </p>
            <button 
              onClick={handleStartNegotiation} 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)' }}
            >
              Apply / Negotiate Rent
            </button>
          </div>

          {/* Schedule Viewing Widget */}
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: 'var(--accent-color)' }} />
              Schedule Viewing
            </h3>

            {bookingStatus === 'success' ? (
              <div style={{ 
                backgroundColor: 'var(--success-light)', 
                color: 'var(--success-color)', 
                padding: '16px', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Tour requested! The landlord/agent has been notified to confirm your time slot. Check status in dashboard.
              </div>
            ) : (
              <form onSubmit={handleBookTour} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookingStatus && bookingStatus !== 'success' && (
                  <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{bookingStatus}</div>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setTourType('virtual')}
                    className={tourType === 'virtual' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Video size={14} /> Virtual Tour
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTourType('in-person')}
                    className={tourType === 'in-person' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <User size={14} /> In Person
                  </button>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Date</label>
                  <input 
                    type="date" 
                    value={bookingDate} 
                    onChange={e => setBookingDate(e.target.value)}
                    required
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Time Slot</label>
                  <input 
                    type="time" 
                    value={bookingTime} 
                    onChange={e => setBookingTime(e.target.value)}
                    required
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Book Viewing Slot
                </button>
              </form>
            )}
          </div>

          {/* Contact Agent Box */}
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} style={{ color: 'var(--accent-color)' }} />
              Inquire About Listing
            </h3>

            {messageStatus === 'success' ? (
              <div style={{ 
                backgroundColor: 'var(--success-light)', 
                color: 'var(--success-color)', 
                padding: '16px', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Message sent successfully! Redirecting to chat history...
              </div>
            ) : (
              <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messageStatus && messageStatus !== 'success' && (
                  <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{messageStatus}</div>
                )}
                
                <textarea 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Ask a question..."
                  required
                  rows="4"
                  className="form-input"
                  style={{ resize: 'none', fontSize: '0.9rem', padding: '12px' }}
                />

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
