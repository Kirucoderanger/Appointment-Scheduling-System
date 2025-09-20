const Provider = require('../models/Provider');

// Create new provider
exports.createProvider = async (req, res) => {
  try {
    const { userId, specialty, availableSlots } = req.body;

    // Basic validation
    if (!userId || !specialty) {
      return res.status(400).json({ message: "userId and specialty are required." });
    }

    const provider = new Provider({
      userId,
      specialty,
      availableSlots: availableSlots || []
    });

    await provider.save();

    res.status(201).json({
      message: "Provider created successfully",
      provider
    });
  } catch (err) {
    console.error("Error creating provider:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find().populate("userId", "email role");
    res.json(providers);
  } catch (err) {
    console.error("Error fetching providers:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate("userId", "email role");
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (err) {
    console.error("Error fetching provider:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Update provider by ID
exports.updateProvider = async (req, res) => {
  try {
    const { specialty, availableSlots } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { specialty, availableSlots },
      { new: true }
    ).populate("userId", "email role");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({
      message: "Provider updated successfully",
      provider
    });
  } catch (err) {
    console.error("Error updating provider:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Delete provider by ID
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json({ message: "Provider deleted successfully" });
  } catch (err) {
    console.error("Error deleting provider:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Set provider availability
exports.setAvailability = async (req, res) => {
  try {
    const { slots } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { availableSlots: slots },
      { new: true }
    ).populate("userId", "email role");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({
      message: "Provider availability updated successfully",
      provider
    });
  } catch (err) {
    console.error("Error updating provider availability:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

