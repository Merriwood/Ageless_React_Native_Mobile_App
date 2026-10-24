/**
 * Progress Summary — US Eastern time regression tests
 *
 * Bug: get52WeekSummary() built each week's Sunday key with toISOString(),
 * which converts to UTC. In Eastern time, from 8 pm EDT / 7 pm EST the key
 * rolled over to Monday, no server week matched, and every week showed 0.
 * It also swallowed request errors and returned 52 zero-filled weeks.
 *
 * The whole Jest run uses US Eastern time (set in __tests__/global-setup.js);
 * the first test below fails loudly if that ever stops being true.
 */

jest.mock('../../../api/client', () => ({
  client: { get: jest.fn() },
}));

import { client } from '../../../api/client';
import summaryAPI from '../../../api/summary';
import { toLocalDateKey } from '../../../lib/date-utils';

const mockGet = client.get as jest.Mock;

// What the server returns: weeks keyed by their (local) Sunday
const SERVER_ROWS = [
  // Week of Sun Oct 18, 2026 (EDT)
  { week_of_sunday: '2026-10-18', weight_avg: '178.50', totals: { bike: 30, abs: 4, 'chest press': 3 } },
  // Week of Sun Oct 11, 2026
  { week_of_sunday: '2026-10-11', weight_avg: '179.00', totals: { bike: 20, row: 2 } },
  // Week of Sun Nov 29, 2026 (EST, after clocks fall back)
  { week_of_sunday: '2026-11-29', weight_avg: '177.25', totals: { lat: 5, triceps: 3 } },
];

beforeEach(() => {
  mockGet.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

describe('test environment', () => {
  test('is running in US Eastern time', () => {
    // Oct 23, 2026 is EDT (UTC-4); Dec 4, 2026 is EST (UTC-5)
    expect(new Date(2026, 9, 23, 12).getTimezoneOffset()).toBe(240);
    expect(new Date(2026, 11, 4, 12).getTimezoneOffset()).toBe(300);
  });
});

describe('toLocalDateKey', () => {
  test('keeps the local calendar date late in the evening (EDT)', () => {
    const ninePm = new Date(2026, 9, 23, 21, 0); // Fri Oct 23, 9:00 pm EDT
    expect(toLocalDateKey(ninePm)).toBe('2026-10-23');
    // Documents the old behaviour this replaces
    expect(ninePm.toISOString().split('T')[0]).toBe('2026-10-24');
  });

  test('keeps the local calendar date late in the evening (EST)', () => {
    const sevenThirtyPm = new Date(2026, 11, 4, 19, 30); // Fri Dec 4, 7:30 pm EST
    expect(toLocalDateKey(sevenThirtyPm)).toBe('2026-12-04');
    expect(sevenThirtyPm.toISOString().split('T')[0]).toBe('2026-12-05');
  });
});

describe('get52WeekSummary in Eastern time', () => {
  // [label, local time] — every one of these must find this week's data
  const EDT_TIMES: Array<[string, Date]> = [
    ['9:00 am EDT', new Date(2026, 9, 23, 9, 0)],
    ['7:59 pm EDT', new Date(2026, 9, 23, 19, 59)],
    ['8:00 pm EDT (old bug started here)', new Date(2026, 9, 23, 20, 0)],
    ['11:30 pm EDT', new Date(2026, 9, 23, 23, 30)],
    ['11:59 pm Saturday EDT', new Date(2026, 9, 24, 23, 59)],
    ['12:30 am Sunday EDT', new Date(2026, 9, 18, 0, 30)],
  ];

  test.each(EDT_TIMES)('finds the current week at %s', async (_label, now) => {
    mockGet.mockResolvedValue(SERVER_ROWS);
    const weeks = await summaryAPI.get52WeekSummary(now);

    expect(weeks).toHaveLength(52);
    expect(weeks[0].dateRange).toBe('Oct 18 - Oct 24, 2026');
    expect(weeks[0].bike).toBe(30);
    expect(weeks[0].abs).toBe(4);
    expect(weeks[0].chestPress).toBe(3);
    expect(weeks[0].avgWeight).toBe(178.5);
    expect(weeks[0].totalSets).toBe(37);

    // Previous week also lines up
    expect(weeks[1].dateRange).toBe('Oct 11 - Oct 17, 2026');
    expect(weeks[1].bike).toBe(20);
    expect(weeks[1].row).toBe(2);
  });

  test.each<[string, Date]>([
    ['7:00 pm EST (old bug started here in winter)', new Date(2026, 11, 4, 19, 0)],
    ['11:30 pm EST', new Date(2026, 11, 4, 23, 30)],
  ])('finds the current week at %s', async (_label, now) => {
    mockGet.mockResolvedValue(SERVER_ROWS);
    const weeks = await summaryAPI.get52WeekSummary(now);

    expect(weeks[0].dateRange).toBe('Nov 29 - Dec 5, 2026');
    expect(weeks[0].lat).toBe(5);
    expect(weeks[0].triceps).toBe(3);
    expect(weeks[0].avgWeight).toBe(177.25);
  });

  test('weeks across the November clock change still match', async () => {
    mockGet.mockResolvedValue(SERVER_ROWS);
    // Dec 4 at 10 pm EST; Oct 18 week is 6 weeks back, on the EDT side
    const weeks = await summaryAPI.get52WeekSummary(new Date(2026, 11, 4, 22, 0));
    const oct18 = weeks.find(w => w.dateRange === 'Oct 18 - Oct 24, 2026');
    expect(oct18?.bike).toBe(30);
  });

  test('weeks with no entries are zero (genuinely empty, not an error)', async () => {
    mockGet.mockResolvedValue(SERVER_ROWS);
    const weeks = await summaryAPI.get52WeekSummary(new Date(2026, 9, 23, 21, 0));
    expect(weeks[2].dateRange).toBe('Oct 4 - Oct 10, 2026');
    expect(weeks[2].totalSets).toBe(0);
    expect(weeks[2].avgWeight).toBeNull();
  });
});

describe('get52WeekSummary error handling', () => {
  test('a failed request throws instead of returning zero-filled weeks', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));
    await expect(summaryAPI.get52WeekSummary(new Date(2026, 9, 23, 21, 0)))
      .rejects.toThrow('Network Error');
  });

  test('a non-list response throws instead of returning zero-filled weeks', async () => {
    mockGet.mockResolvedValue({ error: 'something went wrong' });
    await expect(summaryAPI.get52WeekSummary(new Date(2026, 9, 23, 21, 0)))
      .rejects.toThrow('Unexpected progress summary response');
  });

  test('an empty list (new user) still returns 52 empty weeks', async () => {
    mockGet.mockResolvedValue([]);
    const weeks = await summaryAPI.get52WeekSummary(new Date(2026, 9, 23, 21, 0));
    expect(weeks).toHaveLength(52);
    expect(weeks.every(w => w.totalSets === 0)).toBe(true);
  });
});

describe('getWeekSummary / getMonthSummary date ranges', () => {
  test('getWeekSummary sends local Sunday–Saturday at 9 pm EDT and does not mutate the input', async () => {
    mockGet.mockResolvedValue({ data: {} });
    const now = new Date(2026, 9, 23, 21, 0);
    const before = now.getTime();
    await summaryAPI.getWeekSummary(now);
    expect(mockGet).toHaveBeenCalledWith('/api/summary', {
      params: { startDate: '2026-10-18', endDate: '2026-10-24' },
    });
    expect(now.getTime()).toBe(before);
  });

  test('getMonthSummary sends the local month range', async () => {
    summaryAPI.clearCache();
    mockGet.mockResolvedValue({ data: {} });
    await summaryAPI.getMonthSummary(new Date(2026, 9, 23, 21, 0));
    expect(mockGet).toHaveBeenCalledWith('/api/summary', {
      params: { startDate: '2026-10-01', endDate: '2026-10-31' },
    });
  });
});
