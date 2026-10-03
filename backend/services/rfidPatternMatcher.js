const RFIDTag = require('../models/RFIDTag');
const Product = require('../models/Product');
const RFIDScan = require('../models/RFIDScan');

/**
 * Calculates string similarity / match confidence (0 - 100%)
 */
const calculateConfidence = (scanned, epc) => {
  if (scanned === epc) return 98.5; // High confidence exact match
  if (!scanned || !epc) return 0;
  
  // Check pattern prefix match
  const prefixMatchLen = 8;
  if (scanned.substring(0, prefixMatchLen) === epc.substring(0, prefixMatchLen)) {
    // Count matching hex characters
    let matches = 0;
    const len = Math.min(scanned.length, epc.length);
    for (let i = 0; i < len; i++) {
      if (scanned[i] === epc[i]) matches++;
    }
    const score = (matches / Math.max(scanned.length, epc.length)) * 100;
    return Math.round(score * 10) / 10;
  }
  return 0;
};

/**
 * Normalizes RFID EPC string
 */
const normalizeEPC = (epc) => {
  if (!epc) return '';
  return epc.toString().trim().toUpperCase().replace(/[^A-F0-9]/g, '');
};

/**
 * Pattern Matcher Engine Function
 */
const matchRFIDPattern = async (rawScannedValue, readerId = 'READER-GATEWAY-01') => {
  const normalizedScan = normalizeEPC(rawScannedValue);
  
  if (!normalizedScan) {
    return {
      status: 'UNKNOWN',
      confidence: 0,
      scannedValue: rawScannedValue,
      matchedProduct: null,
      message: 'Invalid or empty RFID signal'
    };
  }

  // 1. Try Exact match first
  let tag = await RFIDTag.findOne({ epc: normalizedScan }).populate('product');

  if (tag && tag.product) {
    const scanLog = await RFIDScan.create({
      rfidTag: tag._id,
      scannedValue: normalizedScan,
      matchedProduct: tag.product._id,
      confidence: 98.5,
      readerId,
      status: 'MATCHED'
    });

    return {
      status: 'MATCHED',
      confidence: 98.5,
      scannedValue: normalizedScan,
      rfidTag: tag,
      matchedProduct: tag.product,
      scanId: scanLog._id,
      message: `Product Identified: ${tag.product.productName}`
    };
  }

  // 2. Pattern Search if exact tag entry not found or product reference not populated
  const allTags = await RFIDTag.find({ status: 'Active' }).populate('product');
  let bestMatch = null;
  let maxConfidence = 0;

  for (const candidateTag of allTags) {
    const confidence = calculateConfidence(normalizedScan, candidateTag.epc);
    if (confidence > maxConfidence && confidence >= 70) {
      maxConfidence = confidence;
      bestMatch = candidateTag;
    }
  }

  if (bestMatch && bestMatch.product && maxConfidence >= 70) {
    const scanLog = await RFIDScan.create({
      rfidTag: bestMatch._id,
      scannedValue: normalizedScan,
      matchedProduct: bestMatch.product._id,
      confidence: maxConfidence,
      readerId,
      status: 'MATCHED'
    });

    return {
      status: 'MATCHED',
      confidence: maxConfidence,
      scannedValue: normalizedScan,
      rfidTag: bestMatch,
      matchedProduct: bestMatch.product,
      scanId: scanLog._id,
      message: `Pattern Matched: ${bestMatch.product.productName} (${maxConfidence}% match)`
    };
  }

  // 3. Unknown Tag case
  const unknownScan = await RFIDScan.create({
    scannedValue: normalizedScan,
    confidence: 0,
    readerId,
    status: 'UNKNOWN'
  });

  return {
    status: 'UNKNOWN',
    confidence: 0,
    scannedValue: normalizedScan,
    matchedProduct: null,
    scanId: unknownScan._id,
    message: 'Unknown RFID tag pattern detected. No matching product in registry.'
  };
};

module.exports = {
  matchRFIDPattern,
  normalizeEPC,
  calculateConfidence
};
