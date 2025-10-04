import { useState } from 'react'
import CalendarView from '../CalendarView'

export default function CalendarViewExample() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const events = [
    { id: '1', date: new Date(), title: 'Team Meeting', time: '10:00' },
    { id: '2', date: new Date(Date.now() + 86400000), title: 'Gym Session', time: '18:00' },
  ]

  return (
    <CalendarView
      events={events}
      onDateSelect={setSelectedDate}
      onAddEvent={() => console.log('Add event')}
      selectedDate={selectedDate}
    />
  )
}
