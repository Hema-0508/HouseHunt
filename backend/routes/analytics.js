const express = require('express');
const router = express.Router();
const { getCollection } = require('../utils/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const usersCollection = getCollection('users');
const propertiesCollection = getCollection('properties');
const bookingsCollection = getCollection('bookings');
const leasesCollection = getCollection('leases');

// GET global system analytics (Admin only)
router.get('/overview', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const users = usersCollection.find();
  const properties = propertiesCollection.find();
  const bookings = bookingsCollection.find();
  const leases = leasesCollection.find();

  const totalUsers = users.length;
  const totalProperties = properties.length;
  const activeListings = properties.filter(p => p.status === 'available').length;
  const rentedListings = properties.filter(p => p.status === 'rented').length;
  const totalBookings = bookings.length;
  const activeLeases = leases.filter(l => l.status === 'active').length;

  // Calculate some insights: average rent, distribution of properties by type
  const totalPrice = properties.reduce((sum, p) => sum + p.price, 0);
  const avgRent = totalProperties > 0 ? Math.round(totalPrice / totalProperties) : 0;

  const propertyTypes = {};
  properties.forEach(p => {
    propertyTypes[p.type] = (propertyTypes[p.type] || 0) + 1;
  });

  // Role distribution
  const roles = { renter: 0, landlord: 0, agent: 0, admin: 0 };
  users.forEach(u => {
    roles[u.role] = (roles[u.role] || 0) + 1;
  });

  res.json({
    totalUsers,
    totalProperties,
    activeListings,
    rentedListings,
    totalBookings,
    activeLeases,
    avgRent,
    propertyTypes,
    roles
  });
});

// GET agent-specific listing & marketing analytics
router.get('/agent', authenticateToken, authorizeRoles('agent', 'admin'), (req, res) => {
  const agentId = req.user.role === 'agent' ? req.user.id : req.query.agentId;
  if (!agentId) {
    return res.status(400).json({ message: 'Agent ID is required.' });
  }

  const properties = propertiesCollection.find(p => p.agentId === agentId);
  const totalListings = properties.length;

  let totalViews = 0;
  let totalInquiries = 0;
  properties.forEach(p => {
    totalViews += p.views || 0;
    totalInquiries += p.inquiries || 0;
  });

  // Fetch client leads (renters who have booked tours or are negotiating leases on agent properties)
  const propIds = properties.map(p => p.id);
  const bookings = bookingsCollection.find(b => propIds.includes(b.propertyId));
  const leases = leasesCollection.find(l => propIds.includes(l.propertyId));

  const clientIds = new Set();
  bookings.forEach(b => clientIds.add(b.userId));
  leases.forEach(l => clientIds.add(l.renterId));

  const clients = Array.from(clientIds).map(id => {
    const user = usersCollection.findById(id);
    if (!user) return null;
    
    // Find what property they are interested in
    const clientBookings = bookings.filter(b => b.userId === id);
    const clientLeases = leases.filter(l => l.renterId === id);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      toursBooked: clientBookings.length,
      leasesStarted: clientLeases.length,
      status: clientLeases.some(l => l.status === 'active') ? 'Rented' : 'Lead'
    };
  }).filter(Boolean);

  res.json({
    totalListings,
    totalViews,
    totalInquiries,
    clients,
    propertiesList: properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      views: p.views || 0,
      inquiries: p.inquiries || 0,
      status: p.status
    }))
  });
});

// GET landlord-specific analytics
router.get('/landlord', authenticateToken, authorizeRoles('landlord', 'admin'), (req, res) => {
  const landlordId = req.user.role === 'landlord' ? req.user.id : req.query.landlordId;
  if (!landlordId) {
    return res.status(400).json({ message: 'Landlord ID is required.' });
  }

  const properties = propertiesCollection.find(p => p.ownerId === landlordId);
  const totalListings = properties.length;
  const rentedCount = properties.filter(p => p.status === 'rented').length;

  const occupancyRate = totalListings > 0 ? Math.round((rentedCount / totalListings) * 100) : 0;

  // Revenue projection from active signed leases
  const leases = leasesCollection.find(l => l.landlordId === landlordId && l.status === 'active');
  const monthlyRevenue = leases.reduce((sum, l) => sum + (l.proposedRent || 0), 0);

  let totalViews = 0;
  properties.forEach(p => {
    totalViews += p.views || 0;
  });

  res.json({
    totalListings,
    rentedCount,
    occupancyRate,
    monthlyRevenue,
    totalViews,
    properties: properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      status: p.status,
      views: p.views || 0
    }))
  });
});

module.exports = router;
