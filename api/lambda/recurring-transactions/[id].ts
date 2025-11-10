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

export async function get({
  params,
  headers,
}: {
  params: Promise<{ id: string }>;
  headers?: Record<string, string>;
}): Promise<unknown> {
  const { id } = await params;
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/recurring-transactions/${id}`, {
    method: 'GET',
    headers: requestHeaders,
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

export async function put(
  id: string,
  {
    data,
    params,
    headers,
  }: {
    data: Promise<unknown>;
    params: Promise<{ id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const transactionData = await data;
  const requestHeaders = getAuthHeaders(headers);

  // Transform frontend data to match backend DTO (same as POST)
  const { recurrenceType, recurrenceDay, startDate, endDate, ...rest } =
    transactionData;
  const frequency = recurrenceType || transactionData.recurrenceType;
  const effectiveStartDate = startDate || transactionData.startDate;

  // Calculate nextDueDate if frequency or startDate is provided, otherwise use existing
  let nextDueDate = transactionData.nextDueDate;
  if (frequency && effectiveStartDate) {
    // Calculate nextDueDate based on frequency and startDate (same logic as POST)
    const calculateNextDueDate = (
      freq: string,
      start: string,
      day?: number,
    ): string => {
      const startDateObj = dayjs(start);
      const today = dayjs().startOf('day');

      if (startDateObj.isAfter(today)) {
        return start;
      }

      let nextDate = dayjs();

      switch (freq) {
        case 'DAILY':
          nextDate = today.add(1, 'day');
          break;
        case 'WEEKLY':
          if (day) {
            const targetDay = day === 7 ? 0 : day;
            const currentDay = today.day();
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget <= 0) {
              daysUntilTarget += 7;
            }
            nextDate = today.add(daysUntilTarget, 'day');
          } else {
            const daysSinceStart = today.diff(startDateObj, 'day');
            const weeksSinceStart = Math.floor(daysSinceStart / 7);
            nextDate = startDateObj.add(weeksSinceStart + 1, 'week');
          }
          break;
        case 'MONTHLY':
          if (day) {
            nextDate = today.date(day);
            if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
              nextDate = today.add(1, 'month').date(day);
            }
          } else {
            const startDay = startDateObj.date();
            nextDate = today.date(startDay);
            if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
              nextDate = today.add(1, 'month').date(startDay);
            }
          }
          break;
        case 'YEARLY':
          nextDate = dayjs(today)
            .month(startDateObj.month())
            .date(startDateObj.date());
          if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
            nextDate = nextDate.add(1, 'year');
          }
          break;
        default:
          return start;
      }

      return nextDate.format('YYYY-MM-DD');
    };

    nextDueDate = calculateNextDueDate(
      frequency,
      effectiveStartDate,
      recurrenceDay,
    );
  }

  const dayOfMonth =
    frequency === 'MONTHLY' && recurrenceDay ? recurrenceDay : undefined;
  const dayOfWeek =
    frequency === 'WEEKLY' && recurrenceDay ? recurrenceDay : undefined;

  const backendDTO = {
    ...rest,
    frequency,
    nextDueDate,
    startDate: startDate || transactionData.startDate,
    endDate: endDate || transactionData.endDate || null,
    dayOfMonth,
    dayOfWeek,
  };

  const response = await fetch(`${BACKEND_URL}/recurring-transactions/${id}`, {
    method: 'PUT',
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
    const {
      frequency: respFrequency,
      dayOfMonth: respDayOfMonth,
      dayOfWeek: respDayOfWeek,
      ...respRest
    } = backendResponse.data;
    backendResponse.data = {
      ...respRest,
      recurrenceType: respFrequency,
      recurrenceDay:
        respFrequency === 'MONTHLY'
          ? respDayOfMonth
          : respFrequency === 'WEEKLY'
            ? respDayOfWeek
            : undefined,
    };
  }

  return backendResponse;
}

export async function del(
  id: string,
  {
    params,
    headers,
  }: {
    params: Promise<{ id: string }>;
    headers?: Record<string, string>;
  },
): Promise<unknown> {
  const requestHeaders = getAuthHeaders(headers);

  const response = await fetch(`${BACKEND_URL}/recurring-transactions/${id}`, {
    method: 'DELETE',
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
