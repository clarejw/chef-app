import React, { useState, FormEvent } from 'react';

interface Recipe {
  name: string;
  ingredients: string[];
  steps: string[];
  time: string;
  additional_ingredients: Record<string, string>;
}

function App() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecipe(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/recipe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'An error occurred');
        return;
      }
      
      setRecipe(data);
    } catch (error) {
      setError('Failed to connect to the server');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Chef App</h1>
      <p>Welcome to the Chef App</p>
      <form onSubmit={generateRecipe}>
        <input 
          type="text" 
          placeholder="What ingredients do you have?" 
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {recipe && (
        <div>
          <h2>{recipe.name}</h2>
          <p><strong>Time:</strong> {recipe.time}</p>
          
          <h3>Ingredients:</h3>
          <ul>
            {recipe.ingredients.map((ing: string, index: number) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
          
          <h3>Steps:</h3>
          <ol>
            {recipe.steps.map((step: string, index: number) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          
          <h3>Possible Additions:</h3>
          <ul>
            {Object.entries(recipe.additional_ingredients).map(([ingredient, price]: [string, string]) => (
              <li key={ingredient}>{ingredient} → ${price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;