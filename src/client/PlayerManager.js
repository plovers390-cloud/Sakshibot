class PlayerManager {
  constructor() {
    this.queues = new Map(); // guildId -> queue array
    this.loopModes = new Map(); // guildId -> 'off' | 'track' | 'queue'
    this.currentTracks = new Map(); // guildId -> current track object
  }

  createQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  getQueue(guildId) {
    return this.queues.get(guildId) || [];
  }

  addTrack(guildId, track) {
    const queue = this.createQueue(guildId);
    queue.push(track);
    return queue;
  }

  removeTrack(guildId) {
    const queue = this.getQueue(guildId);
    return queue.shift();
  }

  clearQueue(guildId) {
    this.queues.delete(guildId);
  }

  getQueueLength(guildId) {
    return this.getQueue(guildId).length;
  }

  // === LOOP MODE ===
  setLoopMode(guildId, mode) {
    this.loopModes.set(guildId, mode); // 'off', 'track', 'queue'
  }

  getLoopMode(guildId) {
    return this.loopModes.get(guildId) || 'off';
  }

  // === CURRENT TRACK ===
  setCurrentTrack(guildId, track) {
    this.currentTracks.set(guildId, track);
  }

  getCurrentTrack(guildId) {
    return this.currentTracks.get(guildId) || null;
  }
}

module.exports = PlayerManager;