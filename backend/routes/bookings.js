const express = require('express');
const router = express.Router();
const { getCollection } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const bookingsCollection = getCollection('bookings');
const propertiesCollection = getCollection('properties');

// GET bookings based on user role
router.get('/', authenticateToken, (req, res) => {
  const { id, role } = req.user;
  
  if (role === 'admin') {
    return res.json(bookingsCollection.find());
  }

  if (role === 'renter') {
    // Show only my bookings, embed property info
    const bookings = bookingsCollection.find(b => b.userId === id);
    const bookingsWithProperty = bookings.map(b => {
      const property = propertiesCollection.findById(b.propertyId);
      return { ...b, property };
    });
    return res.json(bookingsWithProperty);
  }

  // Landlord or Agent: Show bookings for properties they own/manage
  const myProperties = propertiesCollection.find(p => p.ownerId === id || p.agentId === id);
  const myPropertyIds = myProperties.map(p => p.id);

  const bookings = bookingsCollection.find(b => myPropertyIds.includes(b.propertyId));
  const bookingsWithDetails = bookings.map(b => {
    const property = myProperties.find(p => p.id === b.propertyId);
    const renters = getCollection('users').findById(b.userId);
    const renterName = renters ? renters.name : 'Unknown User';
    const renterEmail = renters ? renters.email : 'Unknown Email';
    return { ...b, property, renter: { name: renterName, email: renterEmail } };
  });

  res.json(bookingsWithDetails);
});

// POST schedule a viewing booking (tour)
router.post('/', authenticateToken, (req, res) => {
  const { propertyId, tourType, date, time } = req.body;

  if (!propertyId || !tourType || !date || !time) {
    return res.status(400).json({ message: 'All fields (propertyId, tourType, date, time) are required.' });
  }

  const property = propertiesCollection.findById(propertyId);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  const newBooking = bookingsCollection.insert({
    propertyId,
    userId: req.user.id,
    tourType,
    date,
    time,
    status: 'pending' // pending, approved, declined, cancelled
  });

  // Increment inquiry counter on the property
  const updatedInquiries = (property.inquiries || 0) + 1;
  propertiesCollection.update(property.id, { inquiries: updatedInquiries });

  res.status(201).json(newBooking);
});

// PUT update booking status (Landlord or Agent or Admin)
router.put('/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  const booking = bookingsCollection.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const property = propertiesCollection.findById(booking.propertyId);
  
  // Authorization check
  const isAuthorized = 
    req.user.role === 'admin' ||
    booking.userId === req.user.id || // Renter can cancel
    (property && (property.ownerId === req.user.id || property.agentId === req.user.id)); // Landlord/Agent can approve/decline

  if (!isAuthorized) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const updatedBooking = bookingsCollection.update(booking.id, { status });
  res.json(updatedBooking);
});

module.exports = router;
