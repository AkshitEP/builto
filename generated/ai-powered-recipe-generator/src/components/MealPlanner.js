import React from 'react';
import { useDispatch } from 'react-redux';
import { createMealPlan } from '@/redux/actions/mealPlanActions';

const MealPlanner = () => {
  const dispatch = useDispatch();

  const handleCreatePlan = () => {
    dispatch(createMealPlan());
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4">Meal Planner</h2>
      <button
        onClick={handleCreatePlan}
        className="bg-green-500 text-white rounded p-2 hover:bg-green-600 transition duration-300"
      >
        Create Meal Plan
      </button>
    </div>
  );
};

export default MealPlanner;