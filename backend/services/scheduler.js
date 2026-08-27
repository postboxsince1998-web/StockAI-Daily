import cron from 'node-cron';
import { runDailyAnalysisPipeline } from '../scripts/runDailyAnalysis.js';
import db from '../database/db.js';
import { getTodayDateString } from './dataCollector.js';

export function startScheduler() {
  console.log('⏰ Initializing IST Market Scheduler for StockAI Daily...');

  // Target times in IST (16:30, 17:00, 17:30, 18:00)
  // node-cron runs in local server time. We adjust or check IST hour/minute inside cron callback.

  // Run cron check every 15 minutes Monday through Friday
  cron.schedule('*/15 * * * 1-5', async () => {
    const now = new Date();
    // Convert current UTC time to Asia/Kolkata hours and minutes
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
    const istTimeStr = new Intl.DateTimeFormat([], options).format(now);
    const [istHour, istMinute] = istTimeStr.split(':').map(Number);

    const isTargetSlot = (
      (istHour === 16 && istMinute >= 30 && istMinute <= 35) ||
      (istHour === 17 && istMinute >= 0 && istMinute <= 5) ||
      (istHour === 17 && istMinute >= 30 && istMinute <= 35) ||
      (istHour === 18 && istMinute >= 0 && istMinute <= 5)
    );

    if (!isTargetSlot) return;

    const todayStr = getTodayDateString();

    // Check if daily analysis was already successfully completed today
    const existingReport = db.prepare('SELECT id FROM market_reports WHERE date = ?').get(todayStr);
    if (existingReport) {
      console.log(`[Scheduler] Daily analysis for ${todayStr} already completed. No redundant run needed.`);
      return;
    }

    console.log(`[Scheduler] IST Time matches target slot (${istTimeStr} IST). Executing Daily Market Analysis...`);
    try {
      await runDailyAnalysisPipeline(false);
    } catch (err) {
      console.error('[Scheduler] Pipeline execution error:', err.message);
    }
  });

  console.log('✅ IST Market Scheduler running (Configured slots: 16:30, 17:00, 17:30, 18:00 IST on trading days).');
}
