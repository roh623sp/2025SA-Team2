import React from 'react'
import { useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function Tracker() {
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false); // New state for workout options
  const [showChoices, setShowChoices] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [workoutType, setWorkoutType] = useState<"cardio" | "strength" | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<Array<Schema["Tracker"]["type"]>>([]);


  const handleButtonClick = () => {
    setShowWorkoutOptions(true); // Show workout options first
  };

  const deleteWorkout = async (id: string) => {
    try {
      console.log("Deleting workout with ID:", id); // Debugging
      await client.models.Tracker.delete({ id });
      console.log("Tracker deleted successfully!");
      // Refresh the workout history after deletion
      fetchWorkoutHistory();
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const handleWorkoutOptionSelection = async (option: "history" | "add") => {
    if (option === "history") {
      await fetchWorkoutHistory();
      setShowChoices(false);
      setShowForm(false);
    } else if (option === "add") {
      setShowChoices(true);
    }
    setShowWorkoutOptions(false);
  };
  
  const handleChoiceSelection = (type: "cardio" | "strength") => {
    setWorkoutType(type);
    setShowForm(true);
    setShowChoices(false);
  };

  const handleWorkoutSubmit = async (workout: string, calories: string, setsOrDuration: string) => {
    try {
      const newWorkout = {
        type: workoutType,
        workout: workout,
        duration: workoutType === "cardio" ? parseInt(setsOrDuration) : undefined,
        sets: workoutType === "strength" ? parseInt(setsOrDuration) : undefined,
        reps: workoutType === "strength" ? parseInt(setsOrDuration) : undefined,
        calories: parseInt(calories),
      };
      console.log("Saving workout:", newWorkout); // Debugging
      await client.models.Tracker.create(newWorkout);
      console.log("Tracker saved successfully!");
      setShowForm(false);
      setWorkoutType(null);
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      const response = await client.models.Tracker.list({
        authMode: "userPool", // Ensure the correct auth mode is used
        
      });
      console.log("Raw response from backend:", response); // Debugging
      if (response.data) {
        console.log("Tracker data:", response.data); // Debugging
        setWorkoutHistory(response.data);
      } else {
        console.log("No data found in the response.");
      }
    } catch (error) {
      console.error("Error fetching workout history:", error); // Debugging
    }
  };

  return (
    <main>

     
      {/* Main content */}

      {/* Tracker Tracker */}
      {!showWorkoutOptions && !showChoices && !showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button onClick={handleButtonClick}>Workout Tracker</button>
        </div>
      )}

      {/* Workout Options: History or Add Workout */}
      {showWorkoutOptions && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <button onClick={() => handleWorkoutOptionSelection("history")}>Workout History</button>
            <button onClick={() => handleWorkoutOptionSelection("add")}>Add a Workout</button>
          </div>
        </div>
      )}

{/* Workout History */}
{workoutHistory && workoutHistory.length > 0 ? (
  <div style={{ marginTop: '20px' }}>
    <h2>Workout History</h2>
    <ul>
      {workoutHistory
        .filter((workout) => workout !== null) // Filter out null values
        .map((workout) => (
          <li key={workout.id}>
            <strong>Type:</strong> {workout.type || "N/A"} <br />
            <strong>Workout:</strong> {workout.workout || "N/A"} <br />
            {workout.type === "cardio" && (
              <>
                <strong>Duration:</strong> {workout.duration || "N/A"} minutes <br />
              </>
            )}
            {workout.type === "strength" && (
              <>
                <strong>Sets:</strong> {workout.sets || "N/A"} <br />
                <strong>Reps:</strong> {workout.reps || "N/A"} <br />
              </>
            )}
            <strong>Calories Burned:</strong> {workout.calories || "N/A"} <br />
            <button onClick={() => deleteWorkout(workout.id)}>Delete</button>
            <hr />
          </li>
        ))}
    </ul>
  </div>
) : (
  <p></p>
)}

      {/* Cardio or Strength Choices */}
      {showChoices && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <button onClick={() => handleChoiceSelection("cardio")}>Cardio</button>
            <button onClick={() => handleChoiceSelection("strength")}>Strength</button>
          </div>
        </div>
      )}

      {/* Cardio Form */}
      {showForm && workoutType === "cardio" && (
        <CardioForm onSubmit={handleWorkoutSubmit} />
      )}

      {/* Strength Form */}
      {showForm && workoutType === "strength" && (
        <StrengthForm onSubmit={handleWorkoutSubmit} />
      )}
    </main>
  );
}

interface WorkoutFormProps {
  onSubmit: (workout: string, calories: string, sets: string) => void;
}

const CardioForm: React.FC<WorkoutFormProps> = ({ onSubmit }) => {
  const [workout, setWorkout] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workout, calories, duration);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Workout:
          <input
            type="text"
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            placeholder="e.g., Running, Cycling"
          />
        </label>
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Duration (minutes):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30"
          />
        </label>
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Calories Burned:
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 300"
          />
        </label>
        <h1></h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>  
      <button type="submit">Submit</button>
      </div>
    </form>
  );
};

const StrengthForm: React.FC<WorkoutFormProps> = ({ onSubmit }) => {
  const [workout, setWorkout] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workout, calories, sets);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Workout:
          <input
            type="text"
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            placeholder="e.g., Bench Press, Deadlift"
          />
        </label>
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Sets:
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="e.g., 3"
          />
        </label>
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Reps:
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="e.g., 10"
          />
        </label>
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
          Calories Burned:
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 200"
          />
        </label>
        <h1></h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default Tracker