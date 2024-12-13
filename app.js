// Lokale Speicherung - Funktionen
function saveExercisesToLocalStorage(exercises) {
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

function loadExercisesFromLocalStorage() {
    const savedExercises = localStorage.getItem("exercises");
    return savedExercises ? JSON.parse(savedExercises) : [];
}

function saveWorkoutsToLocalStorage(workouts) {
    localStorage.setItem("workouts", JSON.stringify(workouts));
}

function loadWorkoutsFromLocalStorage() {
    const savedWorkouts = localStorage.getItem("workouts");
    return savedWorkouts ? JSON.parse(savedWorkouts) : [];
}

// Aktuelle Seite erkennen
const currentPage = document.body.querySelector("header nav a.active").textContent;

// Globale Variablen
let exercises = loadExercisesFromLocalStorage();
let workouts = loadWorkoutsFromLocalStorage();
let currentWorkout = null;

// --- Exercises-Seite ---
if (currentPage === "Exercises") {
    const addExerciseBtn = document.getElementById("addExerciseBtn");
    const exerciseForm = document.getElementById("exerciseForm");
    const addExerciseForm = document.getElementById("addExerciseForm");
    const exerciseList = document.getElementById("exerciseList");
    const cancelBtn = document.getElementById("cancelBtn");

    // Funktion: Übungen anzeigen
    function displayExercises() {
        exerciseList.innerHTML = "";
        if (exercises.length === 0) {
            exerciseList.innerHTML = "<p>No exercises added yet. Click the 'Add Exercise' button to get started.</p>";
        } else {
            exercises.forEach((exercise, index) => {
                const exerciseItem = document.createElement("li");
                exerciseItem.innerHTML = `
                    <strong>${exercise.name}</strong> (${exercise.muscleGroup})
                    <p>${exercise.notes}</p>
                    <button class="delete-button" data-index="${index}">Delete</button>
                `;
                exerciseList.appendChild(exerciseItem);
            });
        }
    }

    // Event: Übung hinzufügen
    addExerciseForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Werte aus dem Formular holen
        const name = document.getElementById("exerciseName").value;
        const muscleGroup = document.getElementById("muscleGroup").value;
        const notes = document.getElementById("exerciseNotes").value;

        // Neue Übung hinzufügen
        const newExercise = { name, muscleGroup, notes };
        exercises.push(newExercise);

        // Übungen speichern und anzeigen
        saveExercisesToLocalStorage(exercises);
        displayExercises();

        // Formular zurücksetzen und ausblenden
        addExerciseForm.reset();
        exerciseForm.classList.add("hidden");
    });

    // Event: Formular anzeigen
    addExerciseBtn.addEventListener("click", () => {
        exerciseForm.classList.remove("hidden");
    });

    // Event: Formular ausblenden
    cancelBtn.addEventListener("click", () => {
        exerciseForm.classList.add("hidden");
        addExerciseForm.reset();
    });

    // Event: Übung löschen
    exerciseList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-button")) {
            const index = event.target.getAttribute("data-index");
            exercises.splice(index, 1);
            saveExercisesToLocalStorage(exercises);
            displayExercises();
        }
    });

    // Initial: Übungen anzeigen
    displayExercises();
}

// --- Workouts-Seite ---
if (currentPage === "Workouts") {
    const startWorkoutBtn = document.getElementById("startWorkoutBtn");
    const workoutForm = document.getElementById("workoutForm");
    const workoutDate = document.getElementById("workoutDate");
    const exerciseSelect = document.getElementById("exerciseSelect");
    const addExerciseBtn = document.getElementById("addExerciseBtn");
    const workoutExercises = document.getElementById("workoutExercises");
    const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");

    // Funktion: Gespeicherte Übungen in Dropdown laden
    function loadExercisesIntoDropdown() {
        exerciseSelect.innerHTML = "<option value=''>Select an exercise</option>";
        exercises.forEach((exercise, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${exercise.name} (${exercise.muscleGroup})`;
            exerciseSelect.appendChild(option);
        });
    }

    // Event: Workout starten
    startWorkoutBtn.addEventListener("click", () => {
        currentWorkout = {
            date: new Date().toLocaleDateString(),
            exercises: [],
            notes: ""
        };
        workoutForm.classList.remove("hidden");
        workoutDate.textContent = currentWorkout.date;
        loadExercisesIntoDropdown();
    });

    // Event: Übung zum Workout hinzufügen
    addExerciseBtn.addEventListener("click", () => {
        const selectedExerciseIndex = exerciseSelect.value;
        if (selectedExerciseIndex === "") return;

        const selectedExercise = exercises[selectedExerciseIndex];
        const exerciseDiv = document.createElement("div");
        exerciseDiv.classList.add("exercise-entry");
        exerciseDiv.innerHTML = `
            <h4>${selectedExercise.name}</h4>
            <p>${selectedExercise.muscleGroup}</p>
            <div class="sets"></div>
            <button class="add-set-btn add-button">+ Add Set</button>
        `;
        workoutExercises.appendChild(exerciseDiv);

        const setsDiv = exerciseDiv.querySelector(".sets");
        const addSetBtn = exerciseDiv.querySelector(".add-set-btn");

        // Event: Set hinzufügen
        addSetBtn.addEventListener("click", () => {
            const setDiv = document.createElement("div");
            setDiv.innerHTML = `
                <input type="number" placeholder="Weight (kg)" class="set-weight">
                <input type="number" placeholder="Reps" class="set-reps">
            `;
            setsDiv.appendChild(setDiv);
        });

        // Speichere die Übung im aktuellen Workout
        currentWorkout.exercises.push({
            name: selectedExercise.name,
            muscleGroup: selectedExercise.muscleGroup,
            sets: []
        });
    });

    // Event: Workout speichern
    saveWorkoutBtn.addEventListener("click", () => {
        const notes = document.getElementById("workoutNotes").value;
        currentWorkout.notes = notes;

        // Sets sammeln
        const exerciseDivs = workoutExercises.querySelectorAll(".exercise-entry");
        exerciseDivs.forEach((exerciseDiv, index) => {
            const sets = [];
            const setDivs = exerciseDiv.querySelectorAll(".sets div");
            setDivs.forEach((setDiv) => {
                const weight = setDiv.querySelector(".set-weight").value;
                const reps = setDiv.querySelector(".set-reps").value;
                if (weight && reps) {
                    sets.push({ weight, reps });
                }
            });
            currentWorkout.exercises[index].sets = sets;
        });

        // Workout speichern
        workouts.push(currentWorkout);
        saveWorkoutsToLocalStorage(workouts);

        // Reset
        workoutForm.classList.add("hidden");
        workoutExercises.innerHTML = "";
        document.getElementById("workoutNotes").value = "";
        alert("Workout saved successfully!");
    });
}
if (currentPage === "History") {
    const workoutHistory = document.getElementById("workoutHistory");

    // Funktion: Workouts anzeigen
    function displayWorkoutHistory() {
        workoutHistory.innerHTML = "";
        if (workouts.length === 0) {
            workoutHistory.innerHTML = "<p>No workouts recorded yet.</p>";
        } else {
            workouts.forEach((workout, index) => {
                const workoutItem = document.createElement("div");
                workoutItem.classList.add("workout-item");
                workoutItem.innerHTML = `
                    <div>
                        <p><strong>${workout.date}</strong></p>
                        <p>${workout.exercises.map(ex => ex.name).join(", ")}</p>
                        <p>${workout.exercises.length} ${workout.exercises.length > 1 ? "exercises" : "exercise"}</p>
                        <a href="#" class="view-details" data-index="${index}">View Details</a>
                    </div>
                    <button class="edit-button" data-index="${index}">&#9998;</button>
                `;
                workoutHistory.appendChild(workoutItem);
            });
        }
    }

    // Event: Workout-Details anzeigen
    workoutHistory.addEventListener("click", (event) => {
        if (event.target.classList.contains("view-details")) {
            const index = event.target.getAttribute("data-index");
            const workout = workouts[index];
            alert(`Details for ${workout.date}:\n\n${workout.exercises.map((exercise, i) => {
                const sets = exercise.sets.map(set => `${set.weight}kg x ${set.reps} reps`).join("\n");
                return `${i + 1}. ${exercise.name}:\n${sets}`;
            }).join("\n\n")}\n\nNotes: ${workout.notes}`);
        }
    });

    // Event: Workout bearbeiten
    workoutHistory.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-button")) {
            const index = event.target.getAttribute("data-index");
            const workout = workouts[index];
            // Bearbeitungslogik (du kannst hier eine Funktion aufrufen, um es zu bearbeiten)
            alert("Edit functionality is under construction!");
        }
    });

    // Initial: Workouts anzeigen
    displayWorkoutHistory();
}

// Prüfen, ob die Progress-Seite geladen ist
if (document.body.querySelector("main.progress")) {
    // Elemente abrufen
    const exerciseSelect = document.getElementById("exerciseSelect");
    const timeRange = document.getElementById("timeRange");
    const volumeChartCanvas = document.getElementById("volumeChart");
    const maxWeightChartCanvas = document.getElementById("maxWeightChart");

    // Workouts und Übungen aus localStorage laden
    const workouts = loadWorkoutsFromLocalStorage();
    const exercises = loadExercisesFromLocalStorage();

    // Dropdown für Übungen befüllen
    function populateExerciseDropdown() {
        exerciseSelect.innerHTML = "<option value=''>Select an exercise</option>";
        if (exercises && exercises.length > 0) {
            exercises.forEach(exercise => {
                const option = document.createElement("option");
                option.value = exercise.name;
                option.textContent = `${exercise.name} (${exercise.muscleGroup})`;
                exerciseSelect.appendChild(option);
            });
        } else {
            console.error("No exercises found in localStorage.");
        }
    }

    populateExerciseDropdown();

    // Daten filtern und Diagramme aktualisieren
    function updateCharts() {
        const selectedExercise = exerciseSelect.value;
        const selectedTimeRange = timeRange.value;

        if (!selectedExercise) return;

        const filteredWorkouts = filterWorkouts(selectedExercise, selectedTimeRange);
        if (filteredWorkouts.length === 0) {
            console.log("No workouts found for the selected exercise and time range.");
            return;
        }

        const chartData = prepareChartData(filteredWorkouts);

        renderVolumeChart(chartData.dates, chartData.volumes);
        renderMaxWeightChart(chartData.dates, chartData.maxWeights);
    }

    // Workouts filtern
    function filterWorkouts(exerciseName, timeRange) {
        const now = new Date();
        return workouts
            .filter(workout =>
                workout.exercises.some(e => e.name === exerciseName) &&
                (timeRange === "all" || (now - new Date(workout.date)) / (1000 * 60 * 60 * 24) <= timeRange)
            );
    }

    // Daten für Diagramme vorbereiten
    function prepareChartData(filteredWorkouts) {
        const dates = [];
        const volumes = [];
        const maxWeights = [];

        filteredWorkouts.forEach(workout => {
            const workoutDate = new Date(workout.date).toLocaleDateString();
            const exercise = workout.exercises.find(e => e.name === exerciseSelect.value);

            dates.push(workoutDate);
            volumes.push(exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0));
            maxWeights.push(Math.max(...exercise.sets.map(set => set.weight)));
        });

        return { dates, volumes, maxWeights };
    }

    // Diagramm für Volumen
    function renderVolumeChart(dates, volumes) {
        new Chart(volumeChartCanvas, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "Training Volume",
                    data: volumes,
                    borderColor: "#6c63ff",
                    fill: false,
                    tension: 0.1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Volume (kg)" } },
                },
            },
        });
    }

    // Diagramm für Maximales Gewicht
    function renderMaxWeightChart(dates, maxWeights) {
        new Chart(maxWeightChartCanvas, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "Max Weight",
                    data: maxWeights,
                    borderColor: "#ff6363",
                    fill: false,
                    tension: 0.1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Weight (kg)" } },
                },
            },
        });
    }

    // Event Listener für Änderungen
    exerciseSelect.addEventListener("change", updateCharts);
    timeRange.addEventListener("change", updateCharts);
}
