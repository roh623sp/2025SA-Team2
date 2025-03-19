import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

interface Exercise {
  id: number;
  name: string;
  description: string;
  videoUrl: string | null;
}

const client = generateClient<Schema>();

// 🔑 Use your single YouTube API key here
const YOUTUBE_API_KEY = "AIzaSyAKwgma38x1HQzkgWbLs2XpdW6hii2Mktc";

// 🎥 Hardcoded Backup Videos for Common Exercises
const backupVideos: Record<string, string> = {
  "Squats": "https://www.youtube.com/embed/aclHkVaku9U",
  "Push Ups": "https://www.youtube.com/embed/IODxDxX7oi4",
  "Pull Ups": "https://www.youtube.com/embed/eGo4IYlbE5g",
  "Deadlifts": "https://www.youtube.com/embed/r4MzxtBKyNE",
  "Cycling": "https://www.youtube.com/embed/pmB6R67-_CM",
  "Jump Rope": "https://www.youtube.com/embed/YFhIPQ_xlJo",
  "Lunges": "https://www.youtube.com/embed/7m7bP2M9p6o",
};

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
        const exercisesWithVideos = await fetchYouTubeVideos(exercises);

        setAllExercises(exercisesWithVideos);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch workout recommendations.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  async function fetchExercisesForUserPreferences(userData: Schema["OnboardingData"]["type"]): Promise<Exercise[]> {
    const categories = mapPreferencesToWgerCategories(userData);
    const categoryParam = categories.join(',');

    const url = "https://wger.de/api/v2/exercise/?language=2&category=${categoryParam}";
    console.log("Fetching from: ${url}");

    const response = await fetch(url);
    const data = await response.json();
    
    return data.results.map((exercise: any) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      videoUrl: null,
    }));
  }

  async function fetchYouTubeVideos(exercises: Exercise[]): Promise<Exercise[]> {
    return Promise.all(
      exercises.map(async (exercise) => {
        const cachedVideo = localStorage.getItem("video_${exercise.name}");
        if (cachedVideo) {
          console.log("Using cached video for ${exercise.name}");
          return { ...exercise, videoUrl: JSON.parse(cachedVideo) };
        }

        let videoUrl = null;
        const query = encodeURIComponent("${exercise.name} workout tutorial exercise");
        
        try {
          console.log("Fetching YouTube video for: ${exercise.name}");
          const response = await fetch(
            "https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&maxResults=1&type=video"
          );

          if (!response.ok) throw new Error("YouTube API request failed: ${response.statusText}");

          const data = await response.json();
          console.log("YouTube Response for ${exercise.name}:", data);

          const videoId = data.items?.[0]?.id?.videoId;
          if (videoId) {
            videoUrl = "https://www.youtube.com/embed/${videoId}";
            localStorage.setItem(`video_${exercise.name}`, JSON.stringify(videoUrl)); // Save to cache
          }
        } catch (error) {
          console.error("Failed to fetch video for ${exercise.name}, using backup", error);
        }

        return { ...exercise, videoUrl: videoUrl || backupVideos[exercise.name] || null };
      })
    );
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
        case "cardio": return goalCategories.filter(cat => cat === 15);
        case "strength": return goalCategories.filter(cat => cat !== 15);
        case "flexibility": return [15];
        case "mixed": return goalCategories;
        default: return goalCategories;
    }
  }

  if (loading) return <div>Loading your recommended workout...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  if (!allExercises.length) {
    return <div>No recommended exercises found. Try updating your quiz info!</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Recommended Workout</h2>
      <p>Based on your quiz answers, here are some exercises you might try:</p>

      <ul>
        {allExercises.slice(0, visibleCount).map((ex) => (
          <li key={ex.id} style={{ marginBottom: "20px" }}>
            <strong>{ex.name}</strong>
            <p dangerouslySetInnerHTML={{ __html: ex.description }} />
            
            {/* 🎥 Embed YouTube video or backup */}
            {ex.videoUrl ? (
              <iframe
                width="360"
                height="200"
                src={ex.videoUrl}
                title={ex.name}
                allowFullScreen
              ></iframe>
            ) : (
              <p>No tutorial found</p>
            )}
          </li>
        ))}
      </ul>

      {visibleCount < allExercises.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#194121",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
}

export default Workout;
