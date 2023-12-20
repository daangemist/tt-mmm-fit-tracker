const path = require('node:path');

const NodeHelper = require('node_helper');
module.exports = NodeHelper.create({
  start: function () {
    this.expressApp.get('/fit-tracker', (req, res) => {
      res.sendFile(path.join(__dirname, 'magic-mirror/form.html'));
    });
  },
});
