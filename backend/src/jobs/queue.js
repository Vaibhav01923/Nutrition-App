import cron from "node-cron";
import { recalcForLastWeek } from "./weeklyRecalc.job.js";

export function startSchedulers() {
  // Every Monday at 00:05
  cron.schedule("5 0 * * 1", async () => {
    try {
      await recalcForLastWeek();
      // eslint-disable-next-line no-console
      console.log("Weekly maintenance recalculation completed");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Weekly maintenance recalculation failed", e);
    }
  });
}
