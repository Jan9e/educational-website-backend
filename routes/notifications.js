const router = require('express').Router();
const Notification = require('../models/Notification');
const {verifyTokenAndAdmin, verifytoken} = require('../middleware/auth');

router.post('/', verifyTokenAndAdmin, async (req, res) => {
  const newNotification = new Notification({
    title: req.body.title,
    message: req.body.message
  });

  try {
    const savedNotification = await newNotification.save();
    res.status(200).json(savedNotification);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all notifications
router.get('/', verifytoken, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', verifytoken, async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.status(200).json(notification);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
      const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
      if (!deletedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
