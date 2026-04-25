/**
 * AI-based Rule-NLP Complaint Classifier
 * Classifies complaint text into predefined categories using keyword matching.
 */

const CATEGORIES = {
  Electricity: [
    'light', 'bulb', 'fan', 'electricity', 'power', 'current', 'switch',
    'socket', 'plug', 'wire', 'circuit', 'electric', 'voltage', 'inverter',
    'generator', 'blackout', 'outage', 'shock', 'fuse', 'mcb', 'ac',
    'air condition', 'heater', 'geyser',
  ],
  Water: [
    'water', 'tap', 'pipe', 'leak', 'leaking', 'drain', 'flush', 'toilet',
    'washroom', 'bathroom', 'shower', 'tank', 'pump', 'overflow', 'clog',
    'blockage', 'moisture', 'damp', 'wet', 'flood', 'sewage', 'borewell',
    'drinking water', 'cold water', 'hot water',
  ],
  WiFi: [
    'wifi', 'wi-fi', 'internet', 'network', 'connection', 'bandwidth',
    'speed', 'router', 'modem', 'signal', 'online', 'disconnected',
    'slow internet', 'no internet', 'broadband', 'lan', 'cable',
  ],
  Maintenance: [
    'door', 'window', 'lock', 'key', 'bed', 'furniture', 'chair', 'table',
    'cupboard', 'almirah', 'wall', 'ceiling', 'floor', 'crack', 'broken',
    'repair', 'fix', 'paint', 'plaster', 'termite', 'pest', 'insect',
    'cockroach', 'rat', 'mouse', 'ant', 'mold', 'fungus', 'roof', 'balcony',
    'staircase', 'lift', 'elevator',
  ],
  Cleanliness: [
    'clean', 'dirty', 'hygiene', 'garbage', 'waste', 'trash', 'dustbin',
    'smell', 'odor', 'odour', 'sweeping', 'mop', 'dust', 'mess', 'untidy',
    'washroom dirty', 'bathroom dirty', 'toilet dirty',
  ],
  Security: [
    'security', 'guard', 'cctv', 'camera', 'safe', 'theft', 'stolen',
    'missing', 'trespassing', 'stranger', 'suspicious', 'danger', 'unsafe',
    'gate', 'entry', 'access',
  ],
};

/**
 * Classify complaint text into a category
 * @param {string} text - complaint title + description
 * @returns {string} category name
 */
const classifyComplaint = (text) => {
  if (!text || typeof text !== 'string') return 'Other';

  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[category] += 1;
      }
    }
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Other';

  const topCategory = Object.entries(scores).find(([, score]) => score === maxScore);
  return topCategory ? topCategory[0] : 'Other';
};

module.exports = { classifyComplaint };
