'use strict';

module.exports = {
  config: {
    fields: [
      {
        label: 'Pushbullet API key',
        attribute: 'apiKey',
        required: false,
        type: 'text',
        secret: true,
        fillableFromEnv: 'PUSHBULLET_API_KEY',
      },
      {
        label: 'Pushbullet device params',
        attribute: 'deviceParams',
        required: false,
        type: 'text',
        secret: false,
        fillableFromEnv: 'PUSHBULLET_DEVICE_PARAMS',
      },
    ],
  },
  extension: async function (em) {
    const { default: PushBullet } = await import('pushbullet'); // Its an ESM Module

    const pusher = em.config.apiKey ? new PushBullet(em.config.apiKey) : undefined;
    em.http.post('/api/notify', (req, res) => {
      if (!pusher || !em.config.deviceParams) {
        res.status(500).send('Pushbullet not configured.');
        return;
      }

      pusher.note(em.config.deviceParams, req.body.title, req.body.message);
      res.status(204).send();
    });
  },
};
