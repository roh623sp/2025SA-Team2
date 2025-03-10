import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

interface Exercise {
  id: number;
  name: string;
  description: string;
  equipment: { name: string }[];
}

const client = generateClient<Schema>();

function Workout() {
  const [loading, setLoading] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        const userID = currentUser.userId;

        const onboardingResult = await client.models.OnboardingData.list({
          filter: { userID: { eq: userID } }
        });

        if (!onboardingResult.data.length) {
          setError("No OnboardingData found for this user.");
          setLoading(false);
          return;
        }

        const userData = onboardingResult.data[0];
        console.log("Loaded Onboarding Data:", userData);

        const exercises = await fetchExercisesForUserPreferences(userData);
        setAllExercises(exercises);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch workout recommendation.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  async function fetchExercisesForUserPreferences(userData: Schema["OnboardingData"]["type"]): Promise<Exercise[]> {
    const categories = mapPreferencesToWgerCategories(userData);
    const equipment = mapEquipmentToWgerIds(userData.equipmentAvailable || 'none');

    const categoryParam = categories.join(',');
    const equipmentParam = equipment.length ? `&equipment=${equipment.join(',')}` : '';  // Only add if needed

    const url = `https://wger.de/api/v2/exercise/?language=2&category=${categoryParam}${equipmentParam}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed fetching exercises: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Filter out non-English exercises
    const englishOnly = data.results.filter((ex: Exercise) => isMostlyEnglish(ex.description));

    function isMostlyEnglish(text: string): boolean {
      const englishCharCount = text.replace(/[^a-zA-Z]/g, '').length;
      return englishCharCount / text.length > 0.5;
    }
    return englishOnly;
    
  }

  function mapPreferencesToWgerCategories(userData: Schema["OnboardingData"]["type"]): number[] {
    const goalCategories = (() => {
        switch (userData.fitnessGoalType) {
            case "weightLoss": return [15, 8, 9, 10, 12, 13];
            case "muscleGain": return [8, 9, 10, 12, 13];
            case "endurance": return [15];
            case "maintenance": return [8, 9, 10, 12, 13, 15];
            default: return [10];
        }
    })();

    switch (userData.fitnessType) {
        case "cardio": return goalCategories.filter(cat => cat === 15);   // Only cardio
        case "strength": return goalCategories.filter(cat => cat !== 15);  // No cardio
        case "flexibility": return [15];   // Flexibility = stretching (wger reuses category 15 here too)
        case "mixed": return goalCategories;  // Full mix
        default: return goalCategories;  // Fallback
    }
}


  function mapEquipmentToWgerIds(equipmentAvailable: string): number[] {
    const equipmentMap: Record<string, number[]> = {
      none: [0],  // Equipment ID 0 usually means bodyweight only
      basic: [3, 7, 8],  // Dumbbell, Resistance Band, Kettlebell
      full: []  // No filter applied for full gym access
    };

    return equipmentMap[equipmentAvailable] || [];
  }

  if (loading) return <div>Loading your recommended workout...</div>;

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  if (!allExercises.length) {
    return <div>No recommended exercises found. Try updating your quiz info!</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Recommended Workout</h2>
      <p>Based on your quiz answers, here are some exercises you might try:</p>

      <ul>
        {allExercises.slice(0, visibleCount).map((ex) => (
          <li key={ex.id}>
            <strong>{ex.name}</strong>
            <div dangerouslySetInnerHTML={{ __html: ex.description }} />
          </li>
        ))}
      </ul>

      {visibleCount < allExercises.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: '#194121',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
}

export default Workout;
