const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// GET all devices
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single device by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  try {
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching device' });
  }
});

// POST add a device
router.post('/', async (req, res) => {
  const { name, type, status, ipAddress, location } = req.body;

  if (!name || !type || !ipAddress) {
    return res.status(400).json({ error: 'Name, type, and IP address are required' });
  }

  try {
    const newDevice = new Device({ name, type, status: status || 'Online', ipAddress, location });
    const savedDevice = await newDevice.save();
    res.status(201).json(savedDevice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add device' });
  }
});

// PATCH update a device (for autoSchedule)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  try {
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const { autoSchedule, status } = req.body;

    // Update status if present
    if (typeof status === 'string') {
      device.status = status;
    }

    // Update autoSchedule if present
    if (autoSchedule) {
      if (
        typeof autoSchedule.enabled !== 'boolean' ||
        !autoSchedule.onTime ||
        !autoSchedule.offTime
      ) {
        return res.status(400).json({ error: 'Invalid autoSchedule data' });
      }

      device.autoSchedule = {
        enabled: autoSchedule.enabled,
        onTime: autoSchedule.onTime,
        offTime: autoSchedule.offTime,
      };
    }

    device.updatedAt = new Date();
    await device.save();

    res.status(200).json(device);
  } catch (err) {
    console.error('Error updating device:', err);
    res.status(500).json({ error: 'Failed to update device' });
  }
});


module.exports = router;