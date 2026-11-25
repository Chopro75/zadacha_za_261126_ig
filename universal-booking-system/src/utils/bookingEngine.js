export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function generateTimeSlots(openHour, closeHour, slotMinutes) {
  const slots = [];
  const start = openHour * 60;
  const end = closeHour * 60;
  for (let current = start; current + slotMinutes <= end; current += slotMinutes) {
    slots.push({
      startMinutes: current,
      endMinutes: current + slotMinutes,
      label: `${minutesToTime(current)} - ${minutesToTime(current + slotMinutes)}`
    });
  }
  return slots;
}

export function groupBookingsByResource(bookings) {
  const map = new Map();
  for (const booking of bookings) {
    const list = map.get(booking.resourceId) || [];
    list.push(booking);
    map.set(booking.resourceId, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.startMinutes - b.startMinutes);
  }
  return map;
}

export function hasOverlap(existingList, startMinutes, endMinutes, ignoreBookingId = null) {
  for (const item of existingList) {
    if (ignoreBookingId && item.id === ignoreBookingId) {
      continue;
    }
    const overlaps = startMinutes < item.endMinutes && endMinutes > item.startMinutes;
    if (overlaps) {
      return item;
    }
  }
  return null;
}

export function isSlotFree(existingList, slotStart, slotEnd) {
  return hasOverlap(existingList, slotStart, slotEnd) === null;
}

export function validateBooking({
  business,
  resource,
  bookingsForResource,
  customerName,
  guests,
  startMinutes,
  endMinutes,
  editingId = null
}) {
  if (!customerName || customerName.trim().length < 2) {
    return 'Въведете име или повод за резервация (поне 2 символа).';
  }
  if (!resource) {
    return 'Изберете валиден ресурс.';
  }
  const numericGuests = Number(guests);
  if (!Number.isInteger(numericGuests) || numericGuests < 1) {
    return 'Броят гости/участници трябва да е поне 1.';
  }
  if (numericGuests > resource.capacity) {
    return `Надвишен капацитет: максимум ${resource.capacity} за "${resource.name}".`;
  }
  const openMin = business.openHour * 60;
  const closeMin = business.closeHour * 60;
  if (startMinutes < openMin || endMinutes > closeMin || startMinutes >= endMinutes) {
    return `Часът трябва да е в работното време (${minutesToTime(openMin)} - ${minutesToTime(closeMin)}).`;
  }
  const conflict = hasOverlap(bookingsForResource, startMinutes, endMinutes, editingId);
  if (conflict) {
    return `Конфликт с резервация на "${conflict.customerName}" (${minutesToTime(conflict.startMinutes)} - ${minutesToTime(conflict.endMinutes)}).`;
  }
  return null;
}