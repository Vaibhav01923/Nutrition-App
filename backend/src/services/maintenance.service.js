export function impliedMaintenance(avgIntake, deltaKg) {
  const dailyDeltaFromWeight = (deltaKg * 7700) / 7;
  return Math.round(avgIntake - dailyDeltaFromWeight);
}
