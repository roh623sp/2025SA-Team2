
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string | null;
}

const client = generateClient<Schema>();

const RAPIDAPI_KEY = "1356ab160amsh9b6bfc5a92343aap16935ajsn3ccbef0df5fa";
const BASE_URL = "https://exercisedb.p.rapidapi.com";

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

        const equipment = mapEquipmentToName(userData.equipmentAvailable ?? 'none');
        const targetMuscles = mapGoalToMuscles(userData.fitnessGoalType ?? 'maintenance');
        const additionalMuscles = mapFitnessTypeToMuscles(userData.fitnessType ?? 'mixed');

        const allMuscles = Array.from(new Set([...targetMuscles, ...additionalMuscles]));
        const allFetchedExercises: Exercise[] = [];

        for (const muscle of allMuscles) {
          const url = `${BASE_URL}/exercises/target/${encodeURIComponent(muscle)}`;
          console.log("Fetching from:", url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': "exercisedb.p.rapidapi.com"
            }
          });

          const data = await response.json();

          const filtered = data.filter((exercise: any) =>
            equipment.includes(exercise.equipment.toLowerCase())
          );

          if (filtered.length === 0) continue;

          const selected = filtered.length > 3 ? filtered.slice(0, 3) : filtered;

          allFetchedExercises.push(
            ...selected.map((ex: any) => ({
              id: ex.id,
              name: ex.name,
              description: `${ex.name} targets your ${ex.target} using ${ex.equipment}. ${ex.instructions?.[0] ?? 'Perform with control and proper form.'}`,
              videoUrl: ex.gifUrl || null
            }))
          );
        }

        const shuffled = allFetchedExercises.sort(() => 0.5 - Math.random()).slice(0, 15);
        setAllExercises(shuffled);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch workout recommendations.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  function mapEquipmentToName(equipment: string): string[] {
    switch (equipment) {
      case 'none': 
        return ['body weight'];
      case 'basic': 
        return ['dumbbell', 'body weight'];
      case 'full': 
        return ['barbell', 'dumbbell', 'body weight'];
      default: 
        return ['body weight'];
    }
  }

  function mapGoalToMuscles(goal: string): string[] {
    switch (goal) {
      case 'weightLoss':
        return ['cardiovascular system', 'abs', 'quads', 'glutes', 'calves'];
      case 'muscleGain':
        return ['biceps', 'triceps', 'pectorals', 'lats', 'quads', 'glutes', 'delts'];
      case 'endurance':
        return ['calves', 'quads', 'glutes', 'abs', 'traps'];
      case 'maintenance':
        return ['abs', 'glutes', 'quads', 'biceps', 'delts'];
      default:
        return ['quads', 'abs', 'glutes'];
    }
  }

  function mapFitnessTypeToMuscles(fitnessType: string): string[] {
    switch (fitnessType) {
      case 'cardio':
        return ['cardiovascular system'];
      case 'strength':
        return ['quads', 'biceps', 'triceps', 'pectorals', 'lats'];
      case 'flexibility':
        return ['lower back', 'spine'];
      case 'mixed':
        return ['abs', 'quads', 'glutes', 'triceps'];
      default:
        return ['abs', 'quads'];
    }
  }

  if (loading) return <div>Loading your recommended workout...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!allExercises.length) return <div>No recommended exercises found.</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Recommended Workout</h2>
      <p>Based on your quiz answers, here are some exercises you might try:</p>
      <ul>
        {allExercises.slice(0, visibleCount).map((ex) => (
          <li key={ex.id} style={{ marginBottom: "20px" }}>
            <strong>{ex.name}</strong>
            <p>{ex.description}</p>
            {ex.videoUrl ? (
              <img
                src={ex.videoUrl}
                alt={ex.name}
                width="360"
                height="200"
                style={{ objectFit: 'cover', borderRadius: '10px' }}
              />
            ) : (
              <p>No visual found</p>
            )}
          </li>
        ))}
      </ul>

      {visibleCount < allExercises.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: '#194121',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
}

export default Workout;
