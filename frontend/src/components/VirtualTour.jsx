import React, { useState, useRef } from 'react';
import { X, RotateCcw, Compass, Info, Hand } from 'lucide-react';

const VirtualTour = ({ onClose, propertyTitle }) => {
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentPanRef = useRef(0);

  // Panorama interior room URL (luxury living space)
  const roomImage = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80';

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentPanRef.current = panOffset;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    // Map drag speed
    let nextOffset = currentPanRef.current + deltaX * 1.5;
    
    // Loop the panorama (simulate 360)
    if (nextOffset > 2000) nextOffset -= 2000;
    if (nextOffset < 0) nextOffset += 2000;
    
    setPanOffset(nextOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setPanOffset(0);
  };

  // Hotspots list (x positions mapped to pan coordinates)
  const hotspots = [
    { id: 1, label: 'Custom Marble Countertop', x: 250, y: '60%', info: 'Imported Calacatta marble with undermount waterfall sink and smart faucet.' },
    { id: 2, label: 'Floor-To-Ceiling Triple Pane Glass', x: 850, y: '45%', info: 'UV-shielded double-glazing window offering high insulation and city skyline panoramas.' },
    { id: 3, label: 'Solid White Oak Flooring', x: 1450, y: '85%', info: 'Premium 8-inch wide plank European oak with matte protective finish.' }
  ];

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#000',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Panorama Container */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${roomImage})`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: `${panOffset}px center`,
          transition: isDragging ? 'none' : 'background-position 0.1s ease-out',
          position: 'relative'
        }}
      >
        {/* Render Hotspots based on current pan offset */}
        {hotspots.map(h => {
          // Calculate relative position based on panorama width estimation (say 2000px wide)
          // Scale it to container coordinate
          const containerWidth = 800; // estimated width
          let relativeX = (h.x + panOffset) % 2000;
          if (relativeX < 0) relativeX += 2000;

          // Only display hotspot if it's within the active viewing window (e.g. 0 to 800px)
          if (relativeX > 800) return null;

          return (
            <div 
              key={h.id}
              style={{
                position: 'absolute',
                left: `${relativeX}px`,
                top: h.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 5
              }}
              onClick={(e) => e.stopPropagation()} // Prevent drag trigger
            >
              {/* Pulsing Hotspot Marker */}
              <div 
                className="gradient-bg" 
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'help',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}
                title={h.label}
              >
                <Info size={14} />
                
                {/* Glow ring */}
                <div style={{
                  position: 'absolute',
                  top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                  border: '2px solid white',
                  borderRadius: '50%',
                  opacity: 0.6,
                  animation: 'pulse 1.5s infinite'
                }} />
              </div>

              {/* Tooltip Hover Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15,23,42,0.9)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '200px',
                fontSize: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)',
                pointerEvents: 'none',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                display: 'none',
                textAlign: 'center'
              }} className="hotspot-tooltip">
                <strong style={{ display: 'block', marginBottom: '4px' }}>{h.label}</strong>
                {h.info}
              </div>
              
              {/* CSS Tooltip Hover Injector via inline style hack */}
              <style dangerouslySetInnerHTML={{__html: `
                div[key="${h.id}"]:hover .hotspot-tooltip { display: block !important; }
                @keyframes pulse {
                  0% { transform: scale(0.9); opacity: 0.8; }
                  50% { transform: scale(1.15); opacity: 0.3; }
                  100% { transform: scale(0.9); opacity: 0.8; }
                }
              `}} />
            </div>
          );
        })}
      </div>

      {/* Control Overlay UI */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, 
          padding: '16px 20px', 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        <div style={{ color: 'white' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>3D Panoramic Tour</h4>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{propertyTitle}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button 
            onClick={handleReset} 
            className="btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            title="Close Tour"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Guidance Overlay */}
      <div 
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        <Hand size={14} /> Drag to explore 360° space
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', height: '14px', marginLeft: '4px' }}></div>
        <Compass 
          size={14} 
          style={{ 
            color: 'var(--accent-color)', 
            transform: `rotate(${panOffset * 0.5}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }} 
        /> Compass
      </div>
    </div>
  );
};

export default VirtualTour;
