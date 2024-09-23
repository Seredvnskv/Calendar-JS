const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortDayNames = weekdays.map(day => day.slice(0, 3));

const calendarGrid = document.querySelector('.calendar-grid');
const monthYearDisplay = document.getElementById('month-year');
const eventList = document.querySelector('.all-events');
const overlay = document.querySelector('.overlay');
const eventModal = document.getElementById('event-all');
const addEventModal = document.getElementById('event-add');
const buttonColors = document.querySelectorAll('.button-colors button');
const submit = document.getElementById('submit');
const add = document.querySelector('.add');
const editEventModal = document.getElementById('event-edit');
const edit = document.getElementById('event-edit-button');

const events = loadEvents();

let currentDate = new Date();
let calendarDays = getAllDays();
let selectedDay = ''; 
let selectedColor = ''; 

function renderDayNames() {
    shortDayNames.forEach(dayName => {
        calendarGrid.insertAdjacentHTML('beforeend', `<div class="day-name">${dayName}</div>`);
    });
}

function clearCalendarGrid() {
    calendarGrid.innerHTML = '';
}

function getAllDays() {
    const calendarDays = document.querySelectorAll('.day, .current-day');
    return calendarDays; 
}

function addEventsHolder() {
    const calendarDays = getAllDays(); 
    calendarDays.forEach((day) => {
        const item = document.createElement('div');
        item.classList.add('event-holder');
        item.setAttribute('event-date', `${day.getAttribute('data-date')}`); 
        day.appendChild(item); 
    });
}

function renderDays(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === date.getFullYear() && today.getMonth() === date.getMonth();

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarGrid.insertAdjacentHTML('beforeend', `<div class="empty"></div>`);
    }

    for (let i = 1; i <= lastDayOfMonth; i++) {
        const isToday = isCurrentMonth && i === today.getDate();
        const dayClass = isToday ? 'current-day' : 'day';
        const fullDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; // Full date
        
        calendarGrid.insertAdjacentHTML('beforeend', `<div class="${dayClass}" data-date="${fullDate}">${i}</div>`);
    }
}

function loadEvents() {
    const storedEvents = localStorage.getItem('events');
    return storedEvents ? JSON.parse(storedEvents) : {};
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function addEvent(date, eventTitle, eventColor) {
    if (!events[date]) {
        events[date] = [];
    }

    events[date].push({ title: eventTitle, color: eventColor });
    saveEvents();
}

function viewAllEvents() {
    calendarDays = getAllDays();

    calendarDays.forEach((day) => {
        day.addEventListener('click', () => {
            const date = selectedDay.getAttribute('data-date');
            openEventModal(date);
        });
    });
}

function deleteEvent(date, index) {
    events[date].splice(index, 1);

    if (events[date].length === 0) {
        delete events[date];
    }

    saveEvents();
    closeAllModals();
    openEventModal(date);
    renderCalendar(currentDate);
}

function configureEvent(date, index) {
    const event = (events[date])[index];

    showModal(editEventModal);

    edit.addEventListener('click', () => {
        const title = document.getElementById('edit-event-title').value;
        const color = selectedColor;

        event.title = title;
        event.color = color;

        saveEvents();
        closeAllModals();
        renderCalendar(currentDate);
    });
}

function createEvents(dayEvents) {
    dayEvents.forEach((event, index) => {
        const eventItem = `<div class="event-list"><button class="event-settings" index="${index}">&#9881;</button>
        <div class="${event.color} event-title">${event.title}</div><button class="event-delete" index="${index}">&times;</button></div>`;
        eventList.insertAdjacentHTML("beforeend", eventItem);
    });

    document.querySelectorAll('.event-settings').forEach(button => {
        button.addEventListener('click', function () {
            const date = selectedDay.getAttribute('data-date');
            const index = button.getAttribute('index');
            configureEvent(date, index);
        });
    });

    document.querySelectorAll('.event-delete').forEach(button => {
        button.addEventListener('click', () => {
            const date = selectedDay.getAttribute('data-date');
            const index = button.getAttribute('index');
            deleteEvent(date, index);
        });
    });
}

function openEventModal(date) {
    const dayEvents = events[date] || []; 
    eventList.innerHTML = ''; 

    if (dayEvents.length === 0) {
        showModal(addEventModal); 
    } else {
        createEvents(dayEvents);
        showModal(eventModal);
    }
}

function showModal(modal) {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeAllModals() {
    [eventModal, addEventModal, editEventModal].forEach(modal => modal.classList.add('hidden'));
    overlay.classList.add('hidden');
}

function renderCalendar(date) {
    clearCalendarGrid();
    monthYearDisplay.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`.toUpperCase();
    renderDayNames();
    renderDays(date);
    addEventsHolder();
    const calendarDays = document.querySelectorAll('.day, .current-day');

    calendarDays.forEach((day) => {
        const dayDate = day.getAttribute('data-date');

        if (events[dayDate]) {
            const eventHolder = day.querySelector('.event-holder');
            const color = (events[dayDate])[events[dayDate].length - 1].color;
            const html = `<div class="events-number ${color}">${events[dayDate].length}</div>`;
            eventHolder.innerHTML = html;
        }

        day.addEventListener('click', function () {
            selectedDay = day;
            const date = selectedDay.getAttribute('data-date');
            openEventModal(date);
        });
    });
}

function updateEventCount() {
    const date = selectedDay.getAttribute('data-date');
    const color = selectedColor;
    const html = `<div class="events-number ${color}">${events[date].length}</div>`;
    const eventHolder = document.querySelector(`[event-date="${date}"]`);
    eventHolder.innerHTML = ''; 
    eventHolder.insertAdjacentHTML('beforeend', html);
}

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', closeAllModals);
});

submit.addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const date = selectedDay.getAttribute('data-date');
    const color = selectedColor;
    addEvent(date, title, color);
    updateEventCount();
    closeAllModals();

    document.getElementById('event-title').value = ''; 
    buttonColors.forEach(btn => btn.classList.remove('selected'));
});

buttonColors.forEach((button) => {
    button.addEventListener('click', function() {
        buttonColors.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedColor = button.id;
    });
});

overlay.addEventListener('click', closeAllModals());

add.addEventListener('click', () => {
    closeAllModals();
    showModal(addEventModal);
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

renderCalendar(currentDate);