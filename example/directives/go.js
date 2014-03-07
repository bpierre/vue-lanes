module.exports = {
  update: function(value) {
    var self = this;
    this.reset();

    // Send the path to the current vm
    this.el.addEventListener('click', this.onclick = function() {
      self.vm.$dispatch('lanes:path', value);
    });
  },
  unbind: function() {
    this.reset();
  },
  reset: function() {
    if (!this.onclick) return;
    this.el.removeEventListener('click', this.onclick);
  }
};
