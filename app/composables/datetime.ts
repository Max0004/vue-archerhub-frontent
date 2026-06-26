import { format } from 'date-fns';

export function compareDates(dateA,dateB) {
  return new Date(dateA) - new Date(dateB);
}

export function formatDateWithTime(date: string) {
  return new Date(date).toLocaleString();
}

export function formatDateWithoutTime(date: string) {
  return format(new Date(date), 'dd.MM.yyyy');
}

export function formatBirthday(birthday) {
  if(birthday) {
    return format(new Date(birthday),'yyyy-MM-dd')
  }

  return null
}

export function formatDateTime(date: any, time: any) {
  return format(
    new Date(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute,
    ),
    'yyyy-MM-dd HH:mm:ss',
  )
}