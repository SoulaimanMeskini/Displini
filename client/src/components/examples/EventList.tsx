import { useState } from 'react'
import EventList from '../EventList'

export default function EventListExample() {
  const [events, setEvents] = useState([
    { id: '1', date: new Date(), title: 'Team Meeting', time: '10:00', addToTodo: false },
    { id: '2', date: new Date(), title: 'Gym Session', time: '18:00', addToTodo: true },
  ])

  return (
    <EventList
      events={events}
      selectedDate={new Date()}
      onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
      onToggleTodo={(id, addToTodo) => {
        setEvents(events.map(e => e.id === id ? { ...e, addToTodo } : e))
      }}
    />
  )
}
