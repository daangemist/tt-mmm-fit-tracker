Module.register('tt-mmm-fit-tracker', {
  domWrapper: undefined,
  fitTracker: undefined,

  getScripts: function () {
    return ['modules/tt-mmm-fit-tracker/magic-mirror/dist/mmm-fit-tracker.js'];
  },

  start: function () {
    const style = document.createElement('link');
    style.href = 'modules/tt-mmm-fit-tracker/magic-mirror/dist/mmm-fit-tracker.css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);

    this.domWrapper = document.createElement('div');

    this.fitTracker = window.mmmFitTracker.initialize(this.domWrapper, this.config);
  },

  // Override dom generator.
  getDom: function () {
    return this.domWrapper;
  },
});
