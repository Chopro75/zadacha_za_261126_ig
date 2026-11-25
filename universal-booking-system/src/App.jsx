import React from 'react';
import { useMemo, useState } from 'react';
import { BUSINESSES } from './data/businesses';
import {
  generateTimeSlots,
  groupBookingsByResource,
  isSlotFree,
  minutesToTime,
  timeToMinutes,
  validateBooking
} from './utils/bookingEngine';

function createInitialBookingsState(businesses) {
  const state = {};
  for (const biz of businesses) {
    state[biz.id] = biz.initialBookings;
  }
  return state;
}

export default function App() {
  const [selectedBusinessId, setSelectedBusinessId] = useState(BUSINESSES[0].id);
  const [bookingsByBusiness, setBookingsByBusiness] = useState(() =>
    createInitialBookingsState(BUSINESSES)
  );
  const [selectedResourceId, setSelectedResourceId] = useState(BUSINESSES[0].resources[0].id);
  const [minCapacityFilter, setMinCapacityFilter] = useState(1);
  const [onlyFreeSlotsFilter, setOnlyFreeSlotsFilter] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [guests, setGuests] = useState(2);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const currentBusiness = useMemo(
    () => BUSINESSES.find((b) => b.id === selectedBusinessId) || BUSINESSES[0],
    [selectedBusinessId]
  );

  const currentBookings = useMemo(
    () => bookingsByBusiness[currentBusiness.id] || [],
    [bookingsByBusiness, currentBusiness.id]
  );

  const groupedBookings = useMemo(
    () => groupBookingsByResource(currentBookings),
    [currentBookings]
  );

  const slots = useMemo(
    () =>
      generateTimeSlots(
        currentBusiness.openHour,
        currentBusiness.closeHour,
        currentBusiness.slotMinutes
      ),
    [currentBusiness.openHour, currentBusiness.closeHour, currentBusiness.slotMinutes]
  );

  const filteredResources = useMemo(
    () => currentBusiness.resources.filter((r) => r.capacity >= minCapacityFilter),
    [currentBusiness.resources, minCapacityFilter]
  );

  const activeResource = useMemo(
    () =>
      currentBusiness.resources.find((r) => r.id === selectedResourceId) ||
      filteredResources[0] ||
      currentBusiness.resources[0],
    [currentBusiness.resources, selectedResourceId, filteredResources]
  );

  const activeResourceBookings = useMemo(
    () => groupedBookings.get(activeResource?.id) || [],
    [groupedBookings, activeResource?.id]
  );

  const visibleSlots = useMemo(() => {
    if (!onlyFreeSlotsFilter) {
      return slots;
    }
    return slots.filter((slot) =>
      isSlotFree(activeResourceBookings, slot.startMinutes, slot.endMinutes)
    );
  }, [slots, onlyFreeSlotsFilter, activeResourceBookings]);

  function handleSelectBusiness(businessId) {
    const nextBiz = BUSINESSES.find((b) => b.id === businessId);
    setSelectedBusinessId(businessId);
    setSelectedResourceId(nextBiz.resources[0].id);
    setMinCapacityFilter(1);
    setOnlyFreeSlotsFilter(false);
    resetForm(nextBiz);
    setErrorMsg('');
    setStatusMsg('');
  }

  function resetForm(biz = currentBusiness) {
    const openStr = minutesToTime(biz.openHour * 60);
    const defaultEndStr = minutesToTime(
      Math.min(biz.closeHour * 60, biz.openHour * 60 + biz.defaultDurationMinutes)
    );
    setEditingId(null);
    setCustomerName('');
    setGuests(1);
    setStartTime(openStr);
    setEndTime(defaultEndStr);
  }

  function handleSlotClick(slot) {
    if (!isSlotFree(activeResourceBookings, slot.startMinutes, slot.endMinutes)) {
      return;
    }
    setEditingId(null);
    setStartTime(minutesToTime(slot.startMinutes));
    setEndTime(minutesToTime(slot.endMinutes));
    setErrorMsg('');
    setStatusMsg('');
  }

  function handleEditBooking(booking) {
    setEditingId(booking.id);
    setSelectedResourceId(booking.resourceId);
    setCustomerName(booking.customerName);
    setGuests(booking.guests);
    setStartTime(minutesToTime(booking.startMinutes));
    setEndTime(minutesToTime(booking.endMinutes));
    setErrorMsg('');
    setStatusMsg('');
  }

  function handleCancelBooking(bookingId) {
    setBookingsByBusiness((prev) => ({
      ...prev,
      [currentBusiness.id]: (prev[currentBusiness.id] || []).filter((b) => b.id !== bookingId)
    }));
    if (editingId === bookingId) {
      resetForm();
    }
    setErrorMsg('');
    setStatusMsg('Резервацията е отказана.');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const targetResourceBookings = groupedBookings.get(activeResource.id) || [];

    const validationError = validateBooking({
      business: currentBusiness,
      resource: activeResource,
      bookingsForResource: targetResourceBookings,
      customerName,
      guests,
      startMinutes: startMin,
      endMinutes: endMin,
      editingId
    });

    if (validationError) {
      setErrorMsg(validationError);
      setStatusMsg('');
      return;
    }

    setErrorMsg('');

    if (editingId) {
      setBookingsByBusiness((prev) => ({
        ...prev,
        [currentBusiness.id]: (prev[currentBusiness.id] || []).map((b) =>
          b.id === editingId
            ? {
                ...b,
                resourceId: activeResource.id,
                customerName: customerName.trim(),
                guests: Number(guests),
                startMinutes: startMin,
                endMinutes: endMin
              }
            : b
        )
      }));
      setStatusMsg('Резервацията е обновена успешно.');
      resetForm();
    } else {
      const newBooking = {
        id: `b-${Date.now()}`,
        resourceId: activeResource.id,
        customerName: customerName.trim(),
        guests: Number(guests),
        startMinutes: startMin,
        endMinutes: endMin
      };
      setBookingsByBusiness((prev) => ({
        ...prev,
        [currentBusiness.id]: [...(prev[currentBusiness.id] || []), newBooking]
      }));
      setStatusMsg('Резервацията е създадена успешно.');
      setCustomerName('');
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Универсална система за резервации</h1>
          <p className="subtitle">
            Конфигуруем модел за различни бизнеси на React + Vite
          </p>
        </div>
        <div className="stats-box">
          <span>Обекти: {BUSINESSES.length}</span>
          <span>Активни резервации: {currentBookings.length}</span>
        </div>
      </header>

      <section className="panel">
        <h2>1. Избор на бизнес конфигурация</h2>
        <div className="business-tabs">
          {BUSINESSES.map((biz) => (
            <button
              key={biz.id}
              type="button"
              className={`tab-btn ${biz.id === currentBusiness.id ? 'active' : ''}`}
              onClick={() => handleSelectBusiness(biz.id)}
            >
              <strong>{biz.name}</strong>
              <small>{biz.category}</small>
            </button>
          ))}
        </div>
        <div className="biz-meta">
          <p>{currentBusiness.description}</p>
          <p>
            Работно време: <strong>{minutesToTime(currentBusiness.openHour * 60)}</strong> –{' '}
            <strong>{minutesToTime(currentBusiness.closeHour * 60)}</strong> | Слот:{' '}
            <strong>{currentBusiness.slotMinutes} мин</strong>
          </p>
        </div>
      </section>

      <div className="main-grid">
        <section className="panel">
          <h2>2. Ресурси и филтри за наличност</h2>

          <div className="filters">
            <label>
              Мин. капацитет:
              <input
                type="number"
                min="1"
                value={minCapacityFilter}
                onChange={(e) => setMinCapacityFilter(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={onlyFreeSlotsFilter}
                onChange={(e) => setOnlyFreeSlotsFilter(e.target.checked)}
              />
              Само свободни слотове
            </label>
          </div>

          <div className="resource-list">
            {filteredResources.map((res) => {
              const resCount = (groupedBookings.get(res.id) || []).length;
              const isSelected = activeResource?.id === res.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  className={`resource-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedResourceId(res.id)}
                >
                  <div>
                    <strong>{res.name}</strong>
                    <div className="muted">
                      Капацитет: {res.capacity} | Резервации: {resCount}
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredResources.length === 0 && (
              <p className="muted">Няма ресурси с избрания минимален капацитет.</p>
            )}
          </div>

          {activeResource && (
            <div className="slots-section">
              <h3>
                Слотове за: {activeResource.name}
              </h3>
              <div className="slots-grid">
                {visibleSlots.map((slot) => {
                  const free = isSlotFree(
                    activeResourceBookings,
                    slot.startMinutes,
                    slot.endMinutes
                  );
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={!free}
                      onClick={() => handleSlotClick(slot)}
                      className={`slot-btn ${free ? 'free' : 'busy'}`}
                    >
                      {slot.label} ({free ? 'Свободен' : 'Зает'})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>3. {editingId ? 'Редакция на резервация' : 'Нова резервация'}</h2>

          <form onSubmit={handleSubmit} className="booking-form">
            <label>
              {currentBusiness.resourceLabel}:
              <select
                value={activeResource?.id || ''}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                {currentBusiness.resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (макс. {r.capacity})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Клиент / Събитие:
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Напр. Иван Иванов"
              />
            </label>

            <label>
              Брой хора / участници:
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </label>

            <div className="time-row">
              <label>
                Начало:
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>

              <label>
                Край:
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            {errorMsg && <div className="alert error">{errorMsg}</div>}
            {statusMsg && <div className="alert success">{statusMsg}</div>}

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? 'Запази промените' : 'Създай резервация'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => resetForm()}
                >
                  Отказ от редакция
                </button>
              )}
            </div>
          </form>

          <div className="bookings-list">
            <h3>Списък резервации ({currentBusiness.name})</h3>
            {currentBookings.length === 0 ? (
              <p className="muted">Няма активни резервации.</p>
            ) : (
              <ul>
                {currentBookings.map((b) => {
                  const resObj = currentBusiness.resources.find((r) => r.id === b.resourceId);
                  return (
                    <li key={b.id} className="booking-item">
                      <div>
                        <strong>{b.customerName}</strong> — {resObj?.name || b.resourceId}
                        <div className="muted">
                          {minutesToTime(b.startMinutes)} – {minutesToTime(b.endMinutes)} | Хора:{' '}
                          {b.guests}
                        </div>
                      </div>
                      <div className="item-actions">
                        <button
                          type="button"
                          className="small-btn"
                          onClick={() => handleEditBooking(b)}
                        >
                          Промени
                        </button>
                        <button
                          type="button"
                          className="small-btn danger"
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          Откажи
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}