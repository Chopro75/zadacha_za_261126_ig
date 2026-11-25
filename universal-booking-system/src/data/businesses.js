export const BUSINESSES = [
  {
    id: 'happy',
    name: 'Верига Happy',
    category: 'Ресторантьорство',
    description: 'Резервация на маси по часови интервали с проверка на капацитет.',
    openHour: 10,
    closeHour: 23,
    slotMinutes: 60,
    defaultDurationMinutes: 120,
    resourceLabel: 'Маса / Зона',
    resources: [
      { id: 'h-1', name: 'Маса 1 (До прозорец)', capacity: 4 },
      { id: 'h-2', name: 'Маса 2 (Централна зала)', capacity: 6 },
      { id: 'h-3', name: 'Маса 3 (Сепаре)', capacity: 8 },
      { id: 'h-4', name: 'Маса 4 (Лятна градина)', capacity: 4 }
    ],
    initialBookings: [
      {
        id: 'b-h-1',
        resourceId: 'h-1',
        customerName: 'Иван Петров',
        guests: 4,
        startMinutes: 12 * 60,
        endMinutes: 14 * 60
      },
      {
        id: 'b-h-2',
        resourceId: 'h-3',
        customerName: 'Мария Георгиева',
        guests: 6,
        startMinutes: 19 * 60,
        endMinutes: 21 * 60
      }
    ]
  },
  {
    id: 'velingrad',
    name: 'Grand Hotel Velingrad',
    category: 'Хотелиерство и SPA',
    description: 'Резервация на стаи, апартаменти и SPA процедури в рамките на деня.',
    openHour: 8,
    closeHour: 22,
    slotMinutes: 60,
    defaultDurationMinutes: 180,
    resourceLabel: 'Помещение / Стая',
    resources: [
      { id: 'v-1', name: 'Апартамент Панорама 101', capacity: 4 },
      { id: 'v-2', name: 'Двойна стая Релакс 204', capacity: 2 },
      { id: 'v-3', name: 'SPA Кабинет Термал', capacity: 2 },
      { id: 'v-4', name: 'Конферентна зала Родопи', capacity: 20 }
    ],
    initialBookings: [
      {
        id: 'b-v-1',
        resourceId: 'v-1',
        customerName: 'Елена Димитрова',
        guests: 3,
        startMinutes: 10 * 60,
        endMinutes: 13 * 60
      },
      {
        id: 'b-v-2',
        resourceId: 'v-3',
        customerName: 'Георги Николов',
        guests: 2,
        startMinutes: 15 * 60,
        endMinutes: 17 * 60
      }
    ]
  },
  {
    id: 'atletik',
    name: 'Fitness Atletik',
    category: 'Фитнес и тренировки',
    description: 'Запазване на тренировки с инструктор и специализирани зони.',
    openHour: 7,
    closeHour: 22,
    slotMinutes: 60,
    defaultDurationMinutes: 60,
    resourceLabel: 'Зона / Треньор',
    resources: [
      { id: 'a-1', name: 'Силова зона + Треньор А', capacity: 1 },
      { id: 'a-2', name: 'Функционален ринг', capacity: 6 },
      { id: 'a-3', name: 'Кардио студио', capacity: 8 },
      { id: 'a-4', name: 'Боксов салон', capacity: 2 }
    ],
    initialBookings: [
      {
        id: 'b-a-1',
        resourceId: 'a-1',
        customerName: 'Димитър Христов',
        guests: 1,
        startMinutes: 9 * 60,
        endMinutes: 10 * 60
      },
      {
        id: 'b-a-2',
        resourceId: 'a-2',
        customerName: 'София Тодорова',
        guests: 4,
        startMinutes: 18 * 60,
        endMinutes: 19 * 60
      }
    ]
  },
  {
    id: 'opera-sz',
    name: 'Опера Стара Загора',
    category: 'Култура и сценични репетиции',
    description: 'Резервация на сцени, репетиционни зали и VIP ложи.',
    openHour: 9,
    closeHour: 23,
    slotMinutes: 60,
    defaultDurationMinutes: 120,
    resourceLabel: 'Сцена / Зала',
    resources: [
      { id: 'o-1', name: 'Голяма сцена', capacity: 50 },
      { id: 'o-2', name: 'Камерна зала', capacity: 80 },
      { id: 'o-3', name: 'Балетна зала 1', capacity: 25 },
      { id: 'o-4', name: 'VIP Ложа Централна', capacity: 6 }
    ],
    initialBookings: [
      {
        id: 'b-o-1',
        resourceId: 'o-1',
        customerName: 'Репетиция „Травиата“',
        guests: 35,
        startMinutes: 11 * 60,
        endMinutes: 14 * 60
      },
      {
        id: 'b-o-2',
        resourceId: 'o-3',
        customerName: 'Балетен състав',
        guests: 20,
        startMinutes: 16 * 60,
        endMinutes: 18 * 60
      }
    ]
  }
];