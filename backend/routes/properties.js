const express = require('express');
const router = express.Router();
const { getCollection } = require('../utils/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const propertiesCollection = getCollection('properties');

// GET all properties with filtering and search
router.get('/', (req, res) => {
  const { search, location, minPrice, maxPrice, type, bedrooms, amenities } = req.query;

  let list = propertiesCollection.find();

  // Search by keyword (title/description)
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  // Location filter
  if (location) {
    const loc = location.toLowerCase();
    list = list.filter(p => p.location.toLowerCase().includes(loc) || p.address.toLowerCase().includes(loc));
  }

  // Price range filters
  if (minPrice) {
    list = list.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Property type filter
  if (type && type !== 'All') {
    list = list.filter(p => p.type.toLowerCase() === type.toLowerCase());
  }

  // Bedrooms filter
  if (bedrooms && bedrooms !== 'Any') {
    const beds = parseInt(bedrooms);
    if (beds === 4) {
      list = list.filter(p => p.bedrooms >= 4); // 4+ beds
    } else {
      list = list.filter(p => p.bedrooms === beds);
    }
  }

  // Amenities filter (comma-separated list of amenities)
  if (amenities) {
    const selectedAmenities = amenities.split(',').map(a => a.trim().toLowerCase());
    list = list.filter(p => {
      const propAmenities = p.amenities.map(a => a.toLowerCase());
      return selectedAmenities.every(a => propAmenities.includes(a));
    });
  }

  res.json(list);
});

// GET single property & increment view count
router.get('/:id', (req, res) => {
  const property = propertiesCollection.findById(req.id || req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  // Increment view count
  const updatedViews = (property.views || 0) + 1;
  const updatedProperty = propertiesCollection.update(property.id, { views: updatedViews });

  res.json(updatedProperty);
});

// POST create property (Landlord or Agent only)
router.post('/', authenticateToken, authorizeRoles('landlord', 'agent'), (req, res) => {
  const { title, description, price, location, address, type, bedrooms, bathrooms, area, amenities, image, virtualTourUrl, agentId } = req.body;

  if (!title || !price || !location || !address || !type || !bedrooms || !bathrooms || !area) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  const newProperty = propertiesCollection.insert({
    title,
    description: description || '',
    price: parseFloat(price),
    location,
    address,
    type,
    bedrooms: parseInt(bedrooms),
    bathrooms: parseFloat(bathrooms),
    area: parseInt(area),
    amenities: Array.isArray(amenities) ? amenities : [],
    image: image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    virtualTourUrl: virtualTourUrl || '',
    ownerId: req.user.role === 'landlord' ? req.user.id : '',
    agentId: req.user.role === 'agent' ? req.user.id : (agentId || ''),
    status: 'available',
    views: 0,
    inquiries: 0
  });

  res.status(201).json(newProperty);
});

// PUT update property
router.put('/:id', authenticateToken, (req, res) => {
  const property = propertiesCollection.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  // Authorization check: Only owner, assigned agent, or admin can edit
  if (req.user.role !== 'admin' && property.ownerId !== req.user.id && property.agentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You do not own this listing.' });
  }

  const updates = {};
  const fields = ['title', 'description', 'price', 'location', 'address', 'type', 'bedrooms', 'bathrooms', 'area', 'amenities', 'image', 'virtualTourUrl', 'agentId', 'status'];
  
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'price' || field === 'area') {
        updates[field] = parseFloat(req.body[field]);
      } else if (field === 'bedrooms' || field === 'bathrooms') {
        updates[field] = parseFloat(req.body[field]);
      } else {
        updates[field] = req.body[field];
      }
    }
  });

  const updatedProperty = propertiesCollection.update(property.id, updates);
  res.json(updatedProperty);
});

// DELETE property
router.delete('/:id', authenticateToken, (req, res) => {
  const property = propertiesCollection.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  // Authorization check: Only owner, assigned agent, or admin can delete
  if (req.user.role !== 'admin' && property.ownerId !== req.user.id && property.agentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You do not own this listing.' });
  }

  propertiesCollection.delete(property.id);
  res.json({ message: 'Property successfully deleted.' });
});

module.exports = router;
