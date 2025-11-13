const Alert = require('../models/Alert');

const cfg = {
  bpSys: parseInt(process.env.ALERT_THRESHOLD_BP_SYS || 140, 10),
  bpDia: parseInt(process.env.ALERT_THRESHOLD_BP_DIA || 90, 10),
  sugarHigh: parseInt(process.env.ALERT_THRESHOLD_SUGAR_HIGH || 200, 10),
  sugarLow: parseInt(process.env.ALERT_THRESHOLD_SUGAR_LOW || 70, 10),
  pulseHigh: parseInt(process.env.ALERT_THRESHOLD_PULSE_HIGH || 120, 10),
  pulseLow: parseInt(process.env.ALERT_THRESHOLD_PULSE_LOW || 40, 10)
};

function severityFor(value, highThresh, lowThresh) {
  if (value == null) return null;
  if (highThresh != null && value >= highThresh) return 'high';
  if (lowThresh != null && value <= lowThresh) return 'medium';
  return null;
}

function evaluateAlertsForVital(vital) {
  const alerts = [];
  const bp = vital.bloodPressure || {};
  // systolic
  if (bp.systolic != null) {
    if (bp.systolic >= cfg.bpSys) {
      alerts.push({ message: `High systolic blood pressure: ${bp.systolic} mmHg`, severity: 'high' });
    }
  }
  if (bp.diastolic != null) {
    if (bp.diastolic >= cfg.bpDia) {
      alerts.push({ message: `High diastolic blood pressure: ${bp.diastolic} mmHg`, severity: 'high' });
    }
  }
  if (vital.sugarMgDl != null) {
    if (vital.sugarMgDl >= cfg.sugarHigh) alerts.push({ message: `High blood sugar: ${vital.sugarMgDl} mg/dL`, severity: 'high' });
    if (vital.sugarMgDl <= cfg.sugarLow) alerts.push({ message: `Low blood sugar: ${vital.sugarMgDl} mg/dL`, severity: 'high' });
  }
  if (vital.pulse != null) {
    if (vital.pulse >= cfg.pulseHigh) alerts.push({ message: `High pulse: ${vital.pulse} bpm`, severity: 'medium' });
    if (vital.pulse <= cfg.pulseLow) alerts.push({ message: `Low pulse: ${vital.pulse} bpm`, severity: 'medium' });
  }
  return alerts;
}

module.exports = { evaluateAlertsForVital, cfg };
