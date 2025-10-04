import { useState } from 'react'
import MealLog from '../MealLog'

export default function MealLogExample() {
  const [meals, setMeals] = useState([
    { id: '1', time: '08:00', name: 'Oatmeal with protein powder', protein: 25 },
    { id: '2', time: '12:30', name: 'Grilled chicken salad', protein: 35 },
  ])

  return (
    <MealLog
      meals={meals}
      onAddMeal={(meal) => {
        setMeals([...meals, { ...meal, id: Date.now().toString() }])
      }}
      onDeleteMeal={(id) => {
        setMeals(meals.filter(m => m.id !== id))
      }}
    />
  )
}
