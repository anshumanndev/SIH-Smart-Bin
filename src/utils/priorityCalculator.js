// Priority Score Calculator for Smart Bins and Hospital Waste (SIH PS-14)
// Priority = Base Fill Weight + Waste Stream Priority + Hazard Sensor Penalties

import { getWasteTypeConfig } from '../data/wasteTypes';

export function calculateBinPriority(bin) {
  if (!bin) return { score: 0, level: 'NORMAL', color: '#22c55e', factors: [] };

  let score = 0;
  const factors = [];

  // 1. Fill Level Contribution (0 - 50 points)
  const fillPoints = Math.round((bin.fillLevel || 0) * 0.5);
  score += fillPoints;
  if (bin.fillLevel >= 70) {
    factors.push(`Fill critical (${bin.fillLevel}%)`);
  }

  // 2. Waste Type Priority Weight (15 - 45 points)
  const wasteConfig = getWasteTypeConfig(bin.wasteType);
  const wastePoints = wasteConfig.priorityWeight || 15;
  score += wastePoints;
  if (wastePoints >= 35) {
    factors.push(`Hazardous/Bio-Waste stream (${wasteConfig.label})`);
  }

  // 3. Hospital Category Bonus (+15 points for priority healthcare compliance)
  if (bin.binCategory === 'HOSPITAL' || bin.hospitalName) {
    score += 15;
    factors.push('Healthcare facility regulatory priority');
  }

  // 4. Sensor Hazard Anomalies
  // High Temperature (fire risk)
  if (bin.temperature && bin.temperature > 38) {
    const tempBonus = Math.min(30, Math.round((bin.temperature - 38) * 3));
    score += tempBonus;
    factors.push(`Elevated temperature (${bin.temperature}°C)`);
  }

  // Gas / Methane Threshold Breach
  if (bin.gasLevelPpm && bin.gasLevelPpm > 100) {
    const gasBonus = Math.min(25, Math.round((bin.gasLevelPpm - 100) * 0.15));
    score += gasBonus;
    factors.push(`High gas concentration (${bin.gasLevelPpm} ppm)`);
  }

  // Tamper / Tilt Alert
  if (bin.tiltAngle && bin.tiltAngle > 15) {
    score += 20;
    factors.push(`Tilt/Tamper anomaly (${bin.tiltAngle}°)`);
  }

  // Lid Open Anomaly
  if (bin.lidOpen) {
    score += 10;
    factors.push('Lid open / unsealed');
  }

  // Low Battery Warning
  if (bin.batteryLevel && bin.batteryLevel < 20) {
    score += 8;
    factors.push('Sensor battery critically low');
  }

  // Determine Level & Color
  let level = 'NORMAL';
  let color = '#22c55e'; // Green
  let badgeBg = 'bg-emerald-500/20';
  let badgeText = 'text-emerald-300';
  let badgeBorder = 'border-emerald-500/40';

  if (score >= 85 || bin.fillLevel >= 85 || (bin.binCategory === 'HOSPITAL' && bin.fillLevel >= 70)) {
    level = 'CRITICAL';
    color = '#ef4444'; // Red
    badgeBg = 'bg-rose-500/20';
    badgeText = 'text-rose-300';
    badgeBorder = 'border-rose-500/40';
  } else if (score >= 60 || bin.fillLevel >= 60) {
    level = 'HIGH';
    color = '#f59e0b'; // Amber
    badgeBg = 'bg-amber-500/20';
    badgeText = 'text-amber-300';
    badgeBorder = 'border-amber-500/40';
  } else if (score >= 40) {
    level = 'MEDIUM';
    color = '#38bdf8'; // Sky
    badgeBg = 'bg-sky-500/20';
    badgeText = 'text-sky-300';
    badgeBorder = 'border-sky-500/40';
  }

  return {
    score: Math.min(100, score),
    level,
    color,
    badgeBg,
    badgeText,
    badgeBorder,
    factors: factors.slice(0, 3)
  };
}
