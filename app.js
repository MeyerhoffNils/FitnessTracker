// === Lokale Speicherung ===
// Funktionen zum Speichern und Laden von Übungen und Workouts
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

// === Globale Variablen ===
const currentPage = document.body.querySelector("header nav a.active").textContent;
let exercises = loadExercisesFromLocalStorage();
let workouts = loadWorkoutsFromLocalStorage();
let currentWorkout = null;

// === Exercises-Seite ===
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

    // Event Listener: Übung hinzufügen
    addExerciseForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.getElementById("exerciseName").value;
        const muscleGroup = document.getElementById("muscleGroup").value;
        const notes = document.getElementById("exerciseNotes").value;

        exercises.push({ name, muscleGroup, notes });
        saveExercisesToLocalStorage(exercises);
        displayExercises();
        addExerciseForm.reset();
        exerciseForm.classList.add("hidden");
    });

    // Event Listener: Formular anzeigen/ausblenden
    addExerciseBtn.addEventListener("click", () => exerciseForm.classList.remove("hidden"));
    cancelBtn.addEventListener("click", () => {
        exerciseForm.classList.add("hidden");
        addExerciseForm.reset();
    });

    // Event Listener: Übung löschen
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

// === Workouts-Seite ===
if (currentPage === "Workouts") {
    const startWorkoutBtn = document.getElementById("startWorkoutBtn");
    const workoutForm = document.getElementById("workoutForm");
    const workoutDate = document.getElementById("workoutDate");
    const exerciseSelect = document.getElementById("exerciseSelect");
    const addExerciseBtn = document.getElementById("addExerciseBtn");
    const workoutExercises = document.getElementById("workoutExercises");
    const saveWorkoutBtn = document.getElementById("saveWorkoutBtn");

    // Funktion: Dropdown für Übungen befüllen
    function populateExerciseDropdown() {
        exerciseSelect.innerHTML = "<option value=''>Select an exercise</option>";
        exercises.forEach((exercise, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${exercise.name} (${exercise.muscleGroup})`;
            exerciseSelect.appendChild(option);
        });
    }

    // Event Listener: Workout starten
    startWorkoutBtn.addEventListener("click", () => {
        currentWorkout = { date: new Date().toLocaleDateString(), exercises: [], notes: "" };
        workoutForm.classList.remove("hidden");
        workoutDate.textContent = currentWorkout.date;
        populateExerciseDropdown();
    });

    // Event Listener: Übung hinzufügen
    addExerciseBtn.addEventListener("click", () => {
        const selectedIndex = exerciseSelect.value;
        if (selectedIndex === "") return;

        const selectedExercise = exercises[selectedIndex];
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
        addSetBtn.addEventListener("click", () => {
            const setDiv = document.createElement("div");
            setDiv.innerHTML = `
                <input type="number" placeholder="Weight (kg)" class="set-weight">
                <input type="number" placeholder="Reps" class="set-reps">
            `;
            setsDiv.appendChild(setDiv);
        });

        currentWorkout.exercises.push({ name: selectedExercise.name, muscleGroup: selectedExercise.muscleGroup, sets: [] });
    });

    // Event Listener: Workout speichern
    saveWorkoutBtn.addEventListener("click", () => {
        const notes = document.getElementById("workoutNotes").value;
        currentWorkout.notes = notes;

        const exerciseDivs = workoutExercises.querySelectorAll(".exercise-entry");
        exerciseDivs.forEach((exerciseDiv, index) => {
            const sets = [];
            const setDivs = exerciseDiv.querySelectorAll(".sets div");
            setDivs.forEach((setDiv) => {
                const weight = setDiv.querySelector(".set-weight").value;
                const reps = setDiv.querySelector(".set-reps").value;
                if (weight && reps) sets.push({ weight: parseFloat(weight), reps: parseInt(reps) });
            });
            currentWorkout.exercises[index].sets = sets;
        });

        workouts.push(currentWorkout);
        saveWorkoutsToLocalStorage(workouts);
        workoutForm.classList.add("hidden");
        workoutExercises.innerHTML = "";
        document.getElementById("workoutNotes").value = "";
        alert("Workout saved successfully!");
    });
}

// === History-Seite ===
if (currentPage === "History") {
    const workoutHistory = document.getElementById("workoutHistory");

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
                        <p>${workout.exercises.map(e => e.name).join(", ")}</p>
                        <p>${workout.exercises.length} exercises</p>
                        <a href="#" class="view-details" data-index="${index}">View Details</a>
                    </div>
                `;
                workoutHistory.appendChild(workoutItem);
            });
        }
    }

    workoutHistory.addEventListener("click", (event) => {
        if (event.target.classList.contains("view-details")) {
            const index = event.target.getAttribute("data-index");
            const workout = workouts[index];
            alert(`Details for ${workout.date}:\n${workout.exercises.map(e => `${e.name}: ${e.sets.map(s => `${s.weight}kg x ${s.reps} reps`).join(", ")}`).join("\n")}`);
        }
    });

    displayWorkoutHistory();
}

// === Progress-Seite ===
if (currentPage === "Progress") {
    // DOM-Elemente
    const exerciseSelect = document.getElementById("exerciseSelect");
    const timeRange = document.getElementById("timeRange");
    const volumeChartCanvas = document.getElementById("volumeChart");
    const maxWeightChartCanvas = document.getElementById("maxWeightChart");

    // Übungen und Workouts laden
    const exercises = loadExercisesFromLocalStorage();
    const workouts = loadWorkoutsFromLocalStorage();

    // Dropdown mit gespeicherten Übungen befüllen
    function populateExerciseDropdown() {
        exerciseSelect.innerHTML = "<option value=''>Select an exercise</option>";
        if (exercises.length > 0) {
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

    // Diagramme aktualisieren
    function updateCharts() {
        const selectedExercise = exerciseSelect.value;
        const selectedTimeRange = timeRange.value;

        if (!selectedExercise) {
            console.error("No exercise selected.");
            return;
        }

        const filteredWorkouts = filterWorkouts(selectedExercise, selectedTimeRange);

        if (filteredWorkouts.length === 0) {
            console.error("No workouts found for the selected exercise and time range.");
            return;
        }

        const chartData = prepareChartData(filteredWorkouts);

        renderVolumeChart(chartData.dates, chartData.volumes);
        renderMaxWeightChart(chartData.dates, chartData.maxWeights);
    }

    // Workouts nach Zeit und Übung filtern
    
    function filterWorkouts(exerciseName, timeRange) {
    const now = new Date();
    return workouts.filter(workout => {
        // Konvertiere das gespeicherte Datum in ein Date-Objekt
        const workoutDate = new Date(workout.date);

        // Überprüfe Zeitbereich und Übungsnamen
        return workout.exercises.some(e => e.name === exerciseName) &&
            (timeRange === "all" || (now - workoutDate) / (1000 * 60 * 60 * 24) <= timeRange);
    });
}

    // Diagrammdaten vorbereiten
    
function prepareChartData(filteredWorkouts) {
    const dates = [];
    const volumes = [];
    const maxWeights = [];

    filteredWorkouts.forEach(workout => {
        // Konvertiere das gespeicherte Datum in ein Date-Objekt
        const workoutDate = new Date(workout.date).toLocaleDateString();

        // Suche die Übung
        const exercise = workout.exercises.find(e => e.name === exerciseSelect.value);

        // Daten sammeln
        dates.push(workoutDate);
        volumes.push(exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0));
        maxWeights.push(Math.max(...exercise.sets.map(set => set.weight)));
    });

    return { dates, volumes, maxWeights };
}

    // Volumen-Diagramm rendern
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
                scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Volume (kg)" } },
                },
            },
        });
    }

    // Maximalgewicht-Diagramm rendern
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
                scales: {
                    x: { title: { display: true, text: "Date" } },
                    y: { title: { display: true, text: "Weight (kg)" } },
                },
            },
        });
    }

    // Event Listener für Dropdowns
    exerciseSelect.addEventListener("change", updateCharts);
    timeRange.addEventListener("change", updateCharts);
}
