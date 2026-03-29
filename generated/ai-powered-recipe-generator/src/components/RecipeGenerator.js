import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { generateRecipe } from '@/redux/actions/recipeActions';

const RecipeGenerator = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();

  const handleGenerate = () => {
    dispatch(generateRecipe(input));
  };

  return (
    <div className="bg-white shadow-md rounded p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Generate a Recipe</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border rounded p-2 w-full mb-4"
        placeholder="Enter ingredients..."
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition duration-300"
      >
        Generate Recipe
      </button>
    </div>
  );
};

export default RecipeGenerator;