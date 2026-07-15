const express = require('express');
const router = express.Router();
const { getCollection } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const leasesCollection = getCollection('leases');
const propertiesCollection = getCollection('properties');
const usersCollection = getCollection('users');

// GET all lease negotiations for user
router.get('/', authenticateToken, (req, res) => {
  const { id, role } = req.user;
  let list = [];

  if (role === 'admin') {
    list = leasesCollection.find();
  } else if (role === 'renter') {
    list = leasesCollection.find(l => l.renterId === id);
  } else if (role === 'landlord') {
    list = leasesCollection.find(l => l.landlordId === id);
  } else if (role === 'agent') {
    list = leasesCollection.find(l => l.agentId === id);
  }

  // Populate references
  const populated = list.map(l => {
    const property = propertiesCollection.findById(l.propertyId);
    const renter = usersCollection.findById(l.renterId);
    const landlord = usersCollection.findById(l.landlordId);
    return {
      ...l,
      property,
      renter: renter ? { name: renter.name, email: renter.email } : null,
      landlord: landlord ? { name: landlord.name, email: landlord.email } : null
    };
  });

  res.json(populated);
});

// GET single lease
router.get('/:id', authenticateToken, (req, res) => {
  const lease = leasesCollection.findById(req.params.id);
  if (!lease) {
    return res.status(404).json({ message: 'Lease agreement not found.' });
  }

  // Authorization check
  const isAuthorized =
    req.user.role === 'admin' ||
    lease.renterId === req.user.id ||
    lease.landlordId === req.user.id ||
    lease.agentId === req.user.id;

  if (!isAuthorized) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const property = propertiesCollection.findById(lease.propertyId);
  const renter = usersCollection.findById(lease.renterId);
  const landlord = usersCollection.findById(lease.landlordId);

  res.json({
    ...lease,
    property,
    renter: renter ? { name: renter.name, email: renter.email } : null,
    landlord: landlord ? { name: landlord.name, email: landlord.email } : null
  });
});

// POST start a lease negotiation
router.post('/', authenticateToken, (req, res) => {
  const { propertyId, rent, startDate, endDate, notes } = req.body;

  if (!propertyId || !rent || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  const property = propertiesCollection.findById(propertyId);
  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  // Check if negotiation already exists for this property and renter
  const existing = leasesCollection.findOne(l => l.propertyId === propertyId && l.renterId === req.user.id && l.status !== 'rejected');
  if (existing) {
    return res.status(400).json({ message: 'A negotiation for this property is already active.' });
  }

  const newLease = leasesCollection.insert({
    propertyId,
    renterId: req.user.id,
    landlordId: property.ownerId,
    agentId: property.agentId || '',
    proposedRent: parseFloat(rent),
    startDate,
    endDate,
    status: 'negotiating', // negotiating, active, rejected
    offers: [
      {
        senderId: req.user.id,
        rent: parseFloat(rent),
        notes: notes || 'Initial rental application and lease offer.',
        timestamp: new Date().toISOString()
      }
    ],
    renterSignature: '',
    landlordSignature: '',
    signedAt: ''
  });

  res.status(201).json(newLease);
});

// POST submit a counter-offer
router.post('/:id/offer', authenticateToken, (req, res) => {
  const { rent, notes } = req.body;
  const lease = leasesCollection.findById(req.params.id);

  if (!lease) {
    return res.status(404).json({ message: 'Lease agreement not found.' });
  }

  if (lease.status !== 'negotiating') {
    return res.status(400).json({ message: 'Negotiation has closed for this lease.' });
  }

  const offers = [...(lease.offers || [])];
  offers.push({
    senderId: req.user.id,
    rent: parseFloat(rent),
    notes: notes || '',
    timestamp: new Date().toISOString()
  });

  const updatedLease = leasesCollection.update(lease.id, {
    offers,
    proposedRent: parseFloat(rent) // update the main proposed rent
  });

  res.json(updatedLease);
});

// POST sign the lease (digital signature)
router.post('/:id/sign', authenticateToken, (req, res) => {
  const { signature } = req.body; // base64 string or simple name signature representation
  const lease = leasesCollection.findById(req.params.id);

  if (!lease) {
    return res.status(404).json({ message: 'Lease agreement not found.' });
  }

  if (!signature) {
    return res.status(400).json({ message: 'Signature is required.' });
  }

  const updates = {};
  const isRenter = req.user.id === lease.renterId;
  const isLandlord = req.user.id === lease.landlordId;

  if (!isRenter && !isLandlord) {
    return res.status(403).json({ message: 'Only renter or landlord can sign this lease.' });
  }

  if (isRenter) {
    updates.renterSignature = signature;
  }
  if (isLandlord) {
    updates.landlordSignature = signature;
  }

  // Check if both have signed
  const updatedLeaseTemp = { ...lease, ...updates };
  if (updatedLeaseTemp.renterSignature && updatedLeaseTemp.landlordSignature) {
    updates.status = 'active';
    updates.signedAt = new Date().toISOString();

    // Mark the property as rented/sold (unavailable)
    propertiesCollection.update(lease.propertyId, { status: 'rented' });
  }

  const updatedLease = leasesCollection.update(lease.id, updates);
  res.json(updatedLease);
});

// PUT update status (accept/reject entire negotiation)
router.put('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body; // active, rejected
  const lease = leasesCollection.findById(req.params.id);

  if (!lease) {
    return res.status(404).json({ message: 'Lease agreement not found.' });
  }

  if (req.user.id !== lease.landlordId && req.user.id !== lease.renterId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const updatedLease = leasesCollection.update(lease.id, { status });
  res.json(updatedLease);
});

module.exports = router;
