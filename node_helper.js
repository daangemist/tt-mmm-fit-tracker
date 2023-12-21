const path = require('node:path');
const Log = require('logger');

let PushBullet;
import('pushbullet').then((module) => {
  PushBullet = module.default;
});

const NodeHelper = require('node_helper');
module.exports = NodeHelper.create({
  pusher: undefined,
  PushBullet: undefined,

  start: function () {
    this.expressApp.get('/fit-tracker', (req, res) => {
      res.sendFile(path.join(__dirname, 'magic-mirror/form.html'));
    });
  },

  initializePushbullet: function (apiKey) {
    if (this.pusher) {
      return;
    }
    this.pusher = new PushBullet(process.env['PUSHBULLET_API_KEY'] ?? apiKey);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification !== 'NOTIFY') {
      Log.info(`Unhandled notification: ${notification}`);
      return;
    }

    Log.info(`Received notification: ${notification}`);
    this.initializePushbullet(payload.pushBullet.apiKey);

    this.pusher.note(
      process.env['PUSHBULLET_DEVICE_PARAMS'] ?? payload.pushBullet.deviceParams,
      payload.title,
      payload.message
    );
  },
});
