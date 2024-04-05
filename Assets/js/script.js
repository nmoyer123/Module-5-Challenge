// Retrieve tasks and nextId from localStorage or initialize if not present
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task ID
function generateTaskId() {
    const timestamp = Date.now(); // Get current timestamp
    const randomNum = Math.floor(Math.random() * 10000); // Generate a random number
    return `${timestamp}-${randomNum}`; // Combine them to form a unique ID
}

// Function to create a task card element and append it to the correct container
function createTaskCard(task) {
    // Creating the card container and its elements using jQuery
    const cardContainer = $('<div>').addClass('card').attr('data-task-id', task.id); // This line is correct as is.
    const cardBody = $('<div>').addClass('card-body');
    const titleElement = $('<h5>').addClass('card-title').text(task.title);
    const descriptionElement = $('<p>').addClass('card-text').text(task.description);
    const dueDateElement = $('<p>').addClass('card-text').text('Due Date: ' + task.dueDate);

    // Appending the elements to the card body and the card container
    cardBody.append(titleElement, descriptionElement, dueDateElement);
    cardContainer.append(cardBody);

    // Determining the correct container based on task status
    let targetContainerId;
    switch (task.status) {
        case 'to-do':
            targetContainerId = '#todo-cards';
            break;
        case 'in-progress':
            targetContainerId = '#in-progress-cards';
            break;
        case 'done':
            targetContainerId = '#done-cards';
            break;
    }
    $(targetContainerId).append(cardContainer);
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    // Clearing existing task cards
    $('#todo-cards, #in-progress-cards, #done-cards').empty();

    // Rendering task cards
    taskList.forEach(task => {
        createTaskCard(task);
    });

    // Making task cards draggable
    $(".card").draggable({
        revert: "invalid",
        helper: "clone"
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    // Retrieving form input values using jQuery
    const title = $('#taskTitle').val();
    const description = $('#taskDescription').val();
    const dueDate = $('#taskDueDate').val();

    // Creating a new task object
    const task = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'to-do'
    };

    // Adding the new task to the task list and updating localStorage
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(++nextId)); // Incrementing nextId for future use

    // Re-rendering the updated task list
    renderTaskList();
}

// Function to handle deleting a task
$(document).on('click', '.delete-task-btn', function() {
    const taskId = $(this).data('taskId');
    const taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1); // Removing the task from the task list
    }
    localStorage.setItem("tasks", JSON.stringify(taskList)); // Updating localStorage
    renderTaskList(); // Re-rendering the task list
});

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.attr('data-task-id');
    const newStatus = $(event.target).attr('id').replace('-cards', '');

    const taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList(); // This will refresh the list and reapply draggable to all cards.
    }
}
// Initializing the application when the document is ready
$(document).ready(function() {
    renderTaskList();

    $('#taskForm').submit(handleAddTask);

    $('.lane').droppable({
        accept: '.card',
        drop: handleDrop
    });

    $('#taskDueDate').datepicker({ dateFormat: "yy-mm-dd" });
});
