const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

let NotificationModel;
try {
  NotificationModel = mongoose.model('Notification', notificationSchema);
} catch (e) {
  NotificationModel = mongoose.model('Notification');
}

const jsonNotificationModel = new JsonModel('Notification');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonNotificationModel : NotificationModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
