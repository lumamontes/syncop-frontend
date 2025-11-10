import dayjs from 'dayjs';

const BACKEND_URL = 'http://localhost:8081/api';

function getAuthHeaders(headers?: Record<string, string>): HeadersInit {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (headers?.authorization || headers?.Authorization) {
    defaultHeaders.Authorization =
      headers.authorization || headers.Authorization;
  }
  return defaultHeaders;
}

export async function post({
  data,
  headers,
}: {
  data: Promise<unknown>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const transactionData = await data;
  const requestHeaders = getAuthHeaders(headers);

  const { recurrenceType, recurrenceDay, startDate, endDate, ...rest } =
    transactionData;

  const frequency = recurrenceType;

  // Calculate nextDueDate based on frequency and startDate
  const calculateNextDueDate = (
    freq: string,
    start: string,
    day?: number,
  ): string => {
    const startDateObj = dayjs(start);
    const today = dayjs().startOf('day');

    // If startDate is in the future, use it as nextDueDate
    if (startDateObj.isAfter(today)) {
      return start;
    }

    let nextDate = dayjs();

    switch (freq) {
      case 'DAILY':
        // Next day from today
        nextDate = today.add(1, 'day');
        break;

      case 'WEEKLY':
        if (day) {
          // day is 1-7 (Monday-Sunday)
          // dayjs uses 0=Sunday, 1=Monday, etc.
          const targetDay = day === 7 ? 0 : day; // Convert 7 (Sunday) to 0
          const currentDay = today.day();
          let daysUntilTarget = targetDay - currentDay;
          if (daysUntilTarget <= 0) {
            daysUntilTarget += 7; // Next week
          }
          nextDate = today.add(daysUntilTarget, 'day');
        } else {
          // If no day specified, use startDate's day of week, next occurrence
          const daysSinceStart = today.diff(startDateObj, 'day');
          const weeksSinceStart = Math.floor(daysSinceStart / 7);
          nextDate = startDateObj.add(weeksSinceStart + 1, 'week');
        }
        break;

      case 'MONTHLY':
        if (day) {
          // Use the specified day of month
          nextDate = today.date(day);
          // If that day has passed this month, go to next month
          if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
            nextDate = today.add(1, 'month').date(day);
          }
        } else {
          // Use startDate's day of month, next occurrence
          const startDay = startDateObj.date();
          nextDate = today.date(startDay);
          // If that day has passed this month, go to next month
          if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
            nextDate = today.add(1, 'month').date(startDay);
          }
        }
        break;

      case 'YEARLY':
        // Next year from startDate
        nextDate = dayjs(today)
          .month(startDateObj.month())
          .date(startDateObj.date());
        // If this year's date has passed, go to next year
        if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
          nextDate = nextDate.add(1, 'year');
        }
        break;

      default:
        return start;
    }

    return nextDate.format('YYYY-MM-DD');
  };

  const nextDueDate = calculateNextDueDate(frequency, startDate, recurrenceDay);

  const dayOfMonth =
    frequency === 'MONTHLY' && recurrenceDay ? recurrenceDay : undefined;
  const dayOfWeek =
    frequency === 'WEEKLY' && recurrenceDay ? recurrenceDay : undefined;

  const backendDTO = {
    ...rest,
    frequency,
    nextDueDate,
    startDate,
    endDate: endDate || null,
    dayOfMonth,
    dayOfWeek,
  };

  const response = await fetch(`${BACKEND_URL}/recurring-transactions`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(backendDTO),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const backendResponse = await response.json();

  // Transform backend response to frontend format
  if (backendResponse.data) {
    const { frequency, dayOfMonth, dayOfWeek, ...rest } = backendResponse.data;
    backendResponse.data = {
      ...rest,
      recurrenceType: frequency,
      recurrenceDay:
        frequency === 'MONTHLY'
          ? dayOfMonth
          : frequency === 'WEEKLY'
            ? dayOfWeek
            : undefined,
    };
  }

  return backendResponse;
}

export async function get({
  query,
  headers,
}: {
  query?: { activeOnly?: string };
  headers?: Record<string, string>;
}): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);
  const activeOnly = query?.activeOnly;

  let url = `${BACKEND_URL}/recurring-transactions`;
  if (activeOnly) {
    url += `?activeOnly=${activeOnly}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const backendResponse = await response.json();

  // Transform backend response to frontend format
  // Backend returns: { success: boolean, data: RecurringTransactionResponseDTO[] }
  // Frontend expects: { success: boolean, data: RecurringTransaction[] }
  if (backendResponse.data && Array.isArray(backendResponse.data)) {
    backendResponse.data = backendResponse.data.map((item: unknown) => {
      const { frequency, dayOfMonth, dayOfWeek, ...rest } = item as {
        frequency?: string;
        dayOfMonth?: number;
        dayOfWeek?: number;
        [key: string]: unknown;
      };
      return {
        ...rest,
        recurrenceType: frequency, // Map frequency → recurrenceType
        recurrenceDay:
          frequency === 'MONTHLY'
            ? dayOfMonth
            : frequency === 'WEEKLY'
              ? dayOfWeek
              : undefined,
      };
    });
  } else if (backendResponse.data && !Array.isArray(backendResponse.data)) {
    // Handle single item response
    const { frequency, dayOfMonth, dayOfWeek, ...rest } =
      backendResponse.data as {
        frequency?: string;
        dayOfMonth?: number;
        dayOfWeek?: number;
        [key: string]: unknown;
      };
    backendResponse.data = {
      ...rest,
      recurrenceType: frequency,
      recurrenceDay:
        frequency === 'MONTHLY'
          ? dayOfMonth
          : frequency === 'WEEKLY'
            ? dayOfWeek
            : undefined,
    };
  }

  return backendResponse;
}
