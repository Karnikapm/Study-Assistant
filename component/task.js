function saveTaskToFirestore(task) {
    db.collection("tasks").add(task)
      .then(() => {
        console.log("Task added to Firestore!");
        loadTasksFromFirestore();
      })
      .catch((error) => {
        console.error("Error adding task: ", error);
      });
  }
  
  function addNewTask(event) {
    event.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const rewardType = document.getElementById("taskRewardType").value;
  
    const newTask = {
      title,
      description,
      rewardType,
      completed: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
  
    saveTaskToFirestore(newTask);
    closeModal("newTaskModal");
  }
  
  function loadTasksFromFirestore() {
    db.collection("tasks")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        state.tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateUI();
      });
  }
  
  
  let state = {
      playerName: "K",
      level: 0,
      xp: 0,
      coins: 100,
      stats: {
        strength: 10,
        intelligence: 10,
        charisma: 10,
        creativity: 10
      },
      tasks: []
    };
    
    // Modal functions
    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      modal.classList.add("active");
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }
    
    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      modal.classList.remove("active");
      // Restore body scrolling
      document.body.style.overflow = "auto";
      // Reset form
      document.getElementById("newTaskForm").reset();
    }
    
    // Close modal when clicking outside
    window.onclick = function (event) {
      if (event.target.classList.contains("modal")) {
        closeModal(event.target.id);
      }
    };
    
    // Load state from localStorage
    function loadState() {
      const savedState = localStorage.getItem("questManagerState");
      if (savedState) {
        state = JSON.parse(savedState);
        updateUI();
      }
    }
    
    // Save state to localStorage
    function saveState() {
      localStorage.setItem("questManagerState", JSON.stringify(state));
    }
    
    // Update UI elements
    function updateUI() {
      document.getElementById("playerName").textContent = state.playerName;
      document.getElementById("level").textContent = state.level;
      document.getElementById("xp").textContent = state.xp;
      document.getElementById("xpBar").style.width = `${state.xp}%`;
      document.getElementById("coins").textContent = state.coins;
      document.getElementById("strength").textContent = state.stats.strength;
      document.getElementById("intelligence").textContent =
        state.stats.intelligence;
      document.getElementById("charisma").textContent = state.stats.charisma;
      document.getElementById("creativity").textContent = state.stats.creativity;
    
      updateTaskList();
    }
    
    // Update task list
    function updateTaskList() {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";
    
      state.tasks.forEach((task, index) => {
        const taskElement = document.createElement("div");
        taskElement.className = `task-item bg-zinc-900 hover:shadow-md hover:bg-zinc-800 rounded-lg p-4 ${
          task.completed ? "opacity-70" : ""
        } transform transition-all duration-300`;
        taskElement.innerHTML = `
                        <div class="flex flex-col lg:flex-row md:flex-row justify-between items-start">
                            <div>
                                <h3 class="font-bold ${
                                  task.completed ? "line-through" : ""
                                }">${task.title}</h3>
                                <p class="text-sm text-gray-400">${
                                  task.description || ""
                                }</p>
                            </div>
                            <div class="flex mt-1 lg:m-0 md:m-0 items-center space-x-2">
                                <span class="px-2 py-1 bg-white-500/20 rounded-lg text-sm">
                                    ${task.rewardType} +10
                                </span>
                                ${
                                  !task.completed
                                    ? `
                                    <button onclick="completeTask(${index})" class="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors duration-300">
                                        <i class="fas fa-check"></i>
                                    </button>
                                `
                                    : ""
                                }
                                <button onclick="deleteTask(${index})" class="px-2 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-300">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
        taskList.appendChild(taskElement);
      });
    }
    
    // Task management functions
    function addNewTask(event) {
      event.preventDefault();
      const title = document.getElementById("taskTitle").value;
      const description = document.getElementById("taskDescription").value;
      const rewardType = document.getElementById("taskRewardType").value;
    
      state.tasks.push({
        title,
        description,
        rewardType,
        completed: false
      });
    
      saveState();
      updateUI();
      closeModal("newTaskModal");
    }
    
    function completeTask(index) {
      const task = state.tasks[index];
      task.completed = true;
      state.stats[task.rewardType] += 10;
      state.xp += 10;
      state.coins += 5;
    
      if (state.xp >= 100) {
        state.level += 1;
        state.xp = state.xp - 100;
    
        // Add level up animation/notification
        const levelUpNotification = document.createElement("div");
        levelUpNotification.className =
          "fixed top-4 right-4 bg-white-500 text-white px-4 py-2 rounded-lg shadow-lg";
        levelUpNotification.textContent = `Level Up! You are now level ${state.level}`;
        document.body.appendChild(levelUpNotification);
    
        setTimeout(() => {
          levelUpNotification.remove();
        }, 3000);
      }
    
      saveState();
      updateUI();
    
      // Add completion animation
      const taskElement = document.querySelector(
        `#taskList > div:nth-child(${index + 1})`
      );
      taskElement.classList.add("opacity-50", "translate-x-2");
      setTimeout(() => {
        updateUI();
      }, 500);
    }
    
    function deleteTask(index) {
      // Add delete animation
      const taskElement = document.querySelector(
        `#taskList > div:nth-child(${index + 1})`
      );
      taskElement.classList.add("opacity-0", "translate-x-4");
    
      setTimeout(() => {
        state.tasks.splice(index, 1);
        saveState();
        updateUI();
      }, 300);
    }
    
    function editName() {
      const newName = prompt("Enter your new name:", state.playerName);
      if (newName && newName.trim()) {
        state.playerName = newName.trim();
        saveState();
        updateUI();
      }
    }
    
    // Handle keyboard events for modal
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const modal = document.querySelector(".modal.active");
        if (modal) {
          closeModal(modal.id);
        }
      }
    });
    
    // Prevent form submission when pressing enter in input fields
    document.querySelectorAll("input").forEach((input) => {
      input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      });
    });
    
    // Add animations for stats changes
    function animateStatChange(statElement) {
      statElement.classList.add("scale-110", "text-white-400");
      setTimeout(() => {
        statElement.classList.remove("scale-110", "text-white-400");
      }, 300);
    }
    
    // Initialize app with some example tasks if empty
    function initializeApp() {
      loadState();
      if (state.tasks.length === 0) {
        state.tasks = [
          {
            title: "Basic of data structure",
            description: "Try to complete basic knowlege of DS with 2 days!",
            rewardType: "intelligence",
            completed: false
          },
          {
            title: "Collect 100 coins",
            description: "Gather coins from completed tasks or quests.",
            rewardType: "coins",
            completed: false
          },
          {
            title: "Practice python",
            description: "Practice Coding in Python for Data Analysis",
            rewardType: "intelligence",
            completed: false
          },
          {
            title: "Help a friend",
            description: "Assist a friend in completing their quest.",
            rewardType: "charisma",
            completed: false
          },
          {
            title: "Craft a new item",
            description: "Use your creativity to craft a new item.",
            rewardType: "creativity",
            completed: false
          },
          {
            title: "Level Up!",
            description: "Reach level 5 by completing tasks.",
            rewardType: "strength",
            completed: false
          }
        ];
        saveState();
        updateUI();
      }
    }
    
    // Add custom error handling
    window.addEventListener("error", function (event) {
      console.error("An error occurred:", event.error);
      const errorNotification = document.createElement("div");
      errorNotification.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg";
      errorNotification.textContent = "An error occurred. Please try again.";
      document.body.appendChild(errorNotification);
    
      setTimeout(() => {
        errorNotification.remove();
      }, 3000);
    });
    
    // Add local storage error handling
    function saveState() {
      try {
        localStorage.setItem("questManagerState", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save state:", error);
        // Handle storage quota exceeded
        if (error.name === "QuotaExceededError") {
          alert("Storage limit reached. Please delete some tasks.");
        }
      }
    }
    
    // Initialize tooltips for buttons
    function initializeTooltips() {
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button) => {
        if (button.querySelector("i")) {
          button.setAttribute(
            "title",
            button.querySelector("i").className.includes("check")
              ? "Complete Quest"
              : button.querySelector("i").className.includes("trash")
              ? "Delete Quest"
              : "Edit Name"
          );
        }
      });
    }
    
    // Automatically save state periodically
    setInterval(saveState, 10000); // Save every 10 seconds
    
    // Initialize the application
    document.addEventListener("DOMContentLoaded", function () {
      initializeApp();
      initializeTooltips();
    });
    