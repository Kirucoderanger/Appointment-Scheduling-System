const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const auth = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');
const providerController = require('../controllers/providerController');
const { body, validationResult } = require('express-validator');
const validate = require('../middlewares/validate');
const { createProvider } = require('../validators/provider.validator');

// Create provider (only provider/admin can create themselves or others)
router.post('/', auth(['provider', 'admin']), validate(createProvider), providerController.createProvider);
router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProviderById);
router.put('/:id', auth(['provider', 'admin']), validate(createProvider), providerController.updateProvider);
router.put('/:id/availability', auth(['provider', 'admin']), validate(createProvider), providerController.updateAvailability);
router.delete('/:id', auth(['admin']), providerController.deleteProvider);

module.exports = router;
/*
// simple providers list
router.get('/', asyncHandler(async (req, res) => {
  const list = await Provider.find().populate('userId', 'name email');
  res.json(list);
}));

// provider sets availability
router.put('/:id/availability', auth(['provider']), asyncHandler(async (req, res) => {
  const { slots } = req.body; // expected [{start,end}]
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Not found' });
  // authorization: user must be owner or admin
  if (req.user.role !== 'admin' && provider.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  provider.availableSlots = slots.map(s => ({ start: new Date(s.start), end: new Date(s.end) }));
  await provider.save();
  res.json(provider);
}));

// get provider by id
router.get('/:id', asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate('userId', 'name email');
  if (!provider) return res.status(404).json({ message: 'Not found' });
  res.json(provider);
}));
// update provider details
router.put('/:id', auth(['provider', 'admin']), asyncHandler(async (req, res) => {
  const { specialty } = req.body;
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Not found' });
  provider.specialty = specialty;
  await provider.save();
  res.json(provider);
}));
// delete provider (admin only)
router.delete('/:id', auth(['admin']), asyncHandler(async (req, res) => {
  const provider = await Provider.findByIdAndDelete(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Provider deleted' });
}));

module.exports = router;
*/
/*
const express = require('express');
const router = express.Router();
const { createProvider, getProviders } = require('../controllers/providerController');
const auth = require('../middleware/auth');

// Create provider (only provider/admin can create themselves or others)
router.post('/', auth(['provider', 'admin']), createProvider);

// Get all providers (open or protected depending on your rules)
router.get('/', getProviders);

module.exports = router;
*/


/*const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const auth = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');


router.get('/', asyncHandler(async (req, res) => {
const list = await Provider.find();
res.json(list);
}));

router.post('/', auth(['admin']), asyncHandler(async (req, res) => {
const newProvider = new Provider(req.body);
const savedProvider = await newProvider.save();
res.status(201).json(savedProvider);
}));
router.get('/:id', asyncHandler(async (req, res) => {
const provider = await Provider.findById(req.params.id);
if (!provider) return res.status(404).json({ message: 'Provider not found' });
res.json(provider);
}));

router.put('/:id', auth(['admin']), asyncHandler(async (req, res) => {
const updatedProvider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
if (!updatedProvider) return res.status(404).json({ message: 'Provider not found' });
res.json(updatedProvider);
}));

router.delete('/:id', auth(['admin']), asyncHandler(async (req, res) => {
const deletedProvider = await Provider.findByIdAndDelete(req.params.id);
if (!deletedProvider) return res.status(404).json({ message: 'Provider not found' });
res.json({ message: 'Provider deleted' });
}));
module.exports = router;*/
