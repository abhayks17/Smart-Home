const express = require('express');
const router = express.Router();
const DeviceData = require('../models/DeviceData');
const Device = require('../models/Device');

// POST usage data for a specific device
router.post('/:deviceId/data', async (req, res) => {
  const { deviceId } = req.params;
  const {
    unitReading,
    unitType,
    powerUsageWatts,
    status,
    startTime,      // NEW
    endTime         // NEW
  } = req.body;

  try {
    const device = await Device.findById(deviceId);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const dataEntry = new DeviceData({
      deviceId,
      unitReading,
      unitType,
      powerUsageWatts,
      status,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined
    });

    await dataEntry.save();
    res.status(201).json(dataEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save device data' });
  }
});

// GET usage data for a specific device
router.get('/:deviceId/data', async (req, res) => {
  try {
    const data = await DeviceData.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch device data' });
  }
});

// PUT to update a device data entry (e.g., add endTime)
router.put('/:entryId', async (req, res) => {
  try {
    const updatedEntry = await DeviceData.findByIdAndUpdate(
      req.params.entryId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ error: 'Entry not found' });

    res.json(updatedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update device data entry' });
  }
});

module.exports = router;
