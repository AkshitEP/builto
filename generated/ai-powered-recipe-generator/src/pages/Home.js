import React from 'react';
import RecipeGenerator from '@/components/RecipeGenerator';
import MealPlanner from '@/components/MealPlanner';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8">AI-Powered Recipe Generator</h1>
      <RecipeGenerator />
      <MealPlanner />
    </div>
  );
};

export default Home;