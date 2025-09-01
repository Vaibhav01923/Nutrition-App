export function bmr({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);
  return Math.round(base);
}

export function tdee({ bmr: bmrValue, activity = 1.5 }) {
  return Math.round(bmrValue * activity);
}

export function goalCalories(maintenance, weeklyChangeKg) {
  const dailyAdj = (weeklyChangeKg * 7700) / 7;
  return Math.round(maintenance + dailyAdj);
}
