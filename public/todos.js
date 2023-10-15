        const myserverapi = 'http://16.171.34.72:3000';
        const taskList = document.getElementById('taskList');
        const apiKey = '8f329398b765cb8ea8ecb252f49a7e51a13cb84a';
        const newTaskInput = document.getElementById('newTaskInput');

        async function getTasks() {
            try {
                const response = await axios.get(`${myserverapi}/get-task`);
                displayTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        }

       
        function displayTasks(tasks) {
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${task.content}</span>
                    <button onclick="completeTask(${task.id})">Complete</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                    <button onclick="editTask(${task.id})">Edit</button>
                `;
                taskList.appendChild(li);
            });
        }

           
        
        function editTask(taskId) {
            const newContent = prompt('Edit the task:', '');
            if (newContent !== null) {
                updateTask(taskId, newContent);
            }
        }


        


        async function updateTask(taskId, newContent) {
            try {
                await axios.put(`${myserverapi}/update-task/${taskId}`, {
                    content: newContent
                });
                getTasks(); 
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }



        async function completeTask(taskId) {
            try {
                await axios.post(`${myserverapi}/complete-task/${taskId}`);
                getTasks(); 
            } catch (error) {
                console.error('Error completing task:', error);
            }
        }

        async function deleteTask(taskId) {
            try {
                await axios.delete(`${myserverapi}/delete-task/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
                getTasks(); 
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }

        newTaskInput.addEventListener('keyup', function (event) {
            if (event.key === 'Enter' && newTaskInput.value.trim() !== '') {
                addTask(newTaskInput.value);
                newTaskInput.value = '';
            }
        });

        async function addTask(text) {
            try {
                await axios.post(`${myserverapi}/add-task`, {
                    content: text
                });
                getTasks(); 
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    