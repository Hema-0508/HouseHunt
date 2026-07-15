import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Send, Signature, Trash2, ShieldCheck, CheckCircle } from 'lucide-react';

const LeaseSigner = ({ leaseId, onClose, onRefresh }) => {
  const { user, token } = useAuth();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counterRent, setCounterRent] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  // Canvas Drawing Signature Pad State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const fetchLeaseDetails = async () => {
    try {
      const res = await fetch(`/api/leases/${leaseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLease(data);
        setCounterRent(data.proposedRent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!leaseId) return;
    fetchLeaseDetails();
  }, [leaseId]);

  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'var(--text-primary)';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    setActionStatus('');
    try {
      const res = await fetch(`/api/leases/${leaseId}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rent: counterRent,
          notes: counterNotes
        })
      });
      if (res.ok) {
        setActionStatus('Counter-offer submitted successfully!');
        setCounterNotes('');
        fetchLeaseDetails();
        onRefresh();
      } else {
        const data = await res.json();
        setActionStatus(data.message || 'Counter-offer failed.');
      }
    } catch (err) {
      setActionStatus('Server error occurred.');
    }
  };

  const handleSignLease = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;
    
    setActionStatus('');
    const signatureDataUrl = canvas.toDataURL(); // Converts drawing to image string

    try {
      const res = await fetch(`/api/leases/${leaseId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          signature: signatureDataUrl
        })
      });
      if (res.ok) {
        setActionStatus('Lease signed successfully!');
        clearSignature();
        fetchLeaseDetails();
        onRefresh();
      } else {
        const data = await res.json();
        setActionStatus(data.message || 'Signing failed.');
      }
    } catch (err) {
      setActionStatus('Server error occurred.');
    }
  };

  if (loading) return <div>Loading lease workspace...</div>;
  if (!lease) return <div>Lease not found.</div>;

  const isRenter = user.id === lease.renterId;
  const isLandlord = user.id === lease.landlordId;
  const mySignature = isRenter ? lease.renterSignature : lease.landlordSignature;
  const otherSignature = isRenter ? lease.landlordSignature : lease.renterSignature;
  const otherPartyName = isRenter ? (lease.landlord?.name || 'Landlord') : (lease.renter?.name || 'Renter');

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--accent-color)' }} /> Lease Negotiation Workspace
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Property: {lease.property?.title}</span>
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 16px' }}>Close</button>
      </div>

      {actionStatus && (
        <div style={{ 
          backgroundColor: actionStatus.includes('successfully') ? 'var(--success-light)' : 'hsla(0, 84%, 60%, 0.1)', 
          color: actionStatus.includes('successfully') ? 'var(--success-color)' : 'var(--danger-color)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          {actionStatus}
        </div>
      )}

      {/* Grid: Left - Doc Viewer, Right - Negotiation & Sign */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Interactive Lease Document */}
        <div 
          className="glass" 
          style={{ 
            padding: '40px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'white', 
            color: '#1e293b', // Legal look (dark gray text on white background)
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '650px',
            overflowY: 'auto',
            fontFamily: 'serif',
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Residential Lease Agreement</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>HOUSEHUNT SECURED PAPERWORK PORTAL</span>
          </div>

          <p style={{ marginBottom: '16px' }}>
            This Agreement is made on <strong>{new Date(lease.createdAt).toLocaleDateString()}</strong>, by and between the Landlord and Renter listed below. Under the terms of this lease, the Landlord agrees to rent and lease the Property to the Renter under the covenants detailed herein.
          </p>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', margin: '20px 0 10px 0' }}>1. The Parties</h4>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li><strong>Landlord:</strong> {lease.landlord?.name || 'N/A'} (Owner)</li>
            <li><strong>Renter:</strong> {lease.renter?.name || 'N/A'} (Tenant)</li>
          </ul>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', margin: '20px 0 10px 0' }}>2. Property Address</h4>
          <p style={{ marginBottom: '16px' }}>
            The landlord agrees to lease the premises situated at: <strong>{lease.property?.address}</strong>.
          </p>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', margin: '20px 0 10px 0' }}>3. Lease Term and Rent</h4>
          <p style={{ marginBottom: '16px' }}>
            The lease duration starts on <strong>{lease.startDate}</strong> and terminates on <strong>{lease.endDate}</strong>. 
            The monthly rent agreed upon is: <strong>${lease.proposedRent.toLocaleString()} USD</strong>, payable on the first day of each calendar month.
          </p>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', margin: '20px 0 10px 0' }}>4. Rules and Conditions</h4>
          <p style={{ marginBottom: '16px' }}>
            The Tenant agrees to keep the premises in clean condition, report repair concerns, and adhere to local noise guidelines. Pets are permitted only if indicated in property features list: <strong>{lease.property?.amenities.includes('Pets Allowed') ? 'Yes' : 'No'}</strong>.
          </p>

          {/* Render signatures inside doc */}
          <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Renter Signature:</span>
              {lease.renterSignature ? (
                <img src={lease.renterSignature} alt="Renter Sign" style={{ maxHeight: '60px', marginTop: '6px' }} />
              ) : (
                <span style={{ fontSize: '0.9rem', color: '#ef4444', fontStyle: 'italic', display: 'block', marginTop: '10px' }}>Pending Signature</span>
              )}
              <strong style={{ display: 'block', borderTop: '1px solid #cbd5e1', marginTop: '10px', width: '80%', fontSize: '0.85rem' }}>{lease.renter?.name}</strong>
            </div>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Landlord Signature:</span>
              {lease.landlordSignature ? (
                <img src={lease.landlordSignature} alt="Landlord Sign" style={{ maxHeight: '60px', marginTop: '6px' }} />
              ) : (
                <span style={{ fontSize: '0.9rem', color: '#ef4444', fontStyle: 'italic', display: 'block', marginTop: '10px' }}>Pending Signature</span>
              )}
              <strong style={{ display: 'block', borderTop: '1px solid #cbd5e1', marginTop: '10px', width: '80%', fontSize: '0.85rem' }}>{lease.landlord?.name}</strong>
            </div>
          </div>
        </div>

        {/* Right: Negotiation counters and Signature input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Tracker */}
          <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lease Status</span>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginTop: '4px',
              textTransform: 'uppercase',
              color: lease.status === 'active' ? 'var(--success-color)' : 'var(--accent-color)'
            }}>
              {lease.status === 'active' ? '● Fully Signed & Active' : '● In Negotiation'}
            </div>
          </div>

          {/* Submit Counter Offer (only if negotiating) */}
          {lease.status === 'negotiating' && !mySignature && (
            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>Submit Counter Rent</h3>
              <form onSubmit={handleCounterOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Proposed Rent ($)</label>
                  <input 
                    type="number" 
                    value={counterRent} 
                    onChange={e => setCounterRent(e.target.value)} 
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }} 
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Can we meet in the middle?" 
                    value={counterNotes}
                    onChange={e => setCounterNotes(e.target.value)}
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }} 
                  />
                </div>
                <button type="submit" className="btn-secondary" style={{ padding: '10px', fontSize: '0.85rem' }}>
                  <Send size={14} /> Send Counter Offer
                </button>
              </form>
            </div>
          )}

          {/* Negotiation Log */}
          <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', maxHeight: '200px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Negotiation History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(lease.offers || []).map((o, idx) => {
                const isOfferMe = o.senderId === user.id;
                return (
                  <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{isOfferMe ? 'You' : otherPartyName}</span>
                      <span style={{ color: 'var(--accent-color)' }}>${o.rent}/mo</span>
                    </div>
                    {o.notes && <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{o.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Draw Signature Pad */}
          {lease.status === 'negotiating' && !mySignature && (
            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Signature size={18} style={{ color: 'var(--accent-color)' }} /> Sign Document
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Draw your signature on the pad below to execute the lease.
              </p>

              <canvas 
                ref={canvasRef}
                width="300"
                height="120"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'crosshair',
                  display: 'block',
                  margin: '0 auto 12px auto'
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={clearSignature}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Clear
                </button>
                <button 
                  onClick={handleSignLease}
                  disabled={!hasSigned}
                  className="btn-primary" 
                  style={{ flex: 2, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <ShieldCheck size={14} /> Confirm & Sign
                </button>
              </div>
            </div>
          )}

          {/* Signed Status Banner */}
          {mySignature && (
            <div style={{ 
              backgroundColor: 'var(--success-light)', 
              color: 'var(--success-color)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle size={20} />
              {lease.status === 'active' 
                ? "This lease has been signed by both parties and is fully executed." 
                : "You have signed this agreement. Waiting for other party to sign."
              }
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LeaseSigner;
