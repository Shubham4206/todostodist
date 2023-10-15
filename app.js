const dotenv = require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const cors=require('cors');
const bodyparser=require('body-parser');
const session = require('express-session');
const path=require('path');



app.use(bodyparser.urlencoded());
app.use(bodyparser.json());
app.use(cors());



app.use(express.static('public'));


app.use(session({
    secret: process.env.SECRET_KEY, // Replace with a strong, random secret key
    resave: false,
    saveUninitialized: true,
  }));



  app.get('/auth/todoist', (req, res) => {
    const clientId = 'dcdf42a57c784ae1992d2bad86126a05';
    const redirectUri = 'https://16.171.34.72:3000/auth/todoist/todos ';
    const authorizationUrl = `https://todoist.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=data:read_write&state=YOUR_STATE`;
    res.redirect(authorizationUrl);
});





app.get('/auth/todoist/todos', async (req, res) => {
    const clientId = 'dcdf42a57c784ae1992d2bad86126a05';
    const clientSecret = process.env.CLIENT_SECRET;
    const code = req.query.code;
    const redirectUri = 'https://16.171.34.72:3000/auth/todoist/todos';

    try {
        const tokenResponse = await axios.post('https://todoist.com/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
        });

        const accessToken = tokenResponse.data.access_token;

        req.session.accessToken = accessToken;


        res.redirect('/todos.html'); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to exchange the authorization code for an access token' });
    }
});




const protectRoute = (req, res, next) => {
    if (!req.session.accessToken) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };



  




app.post('/add-task', protectRoute,async (req, res) => {
    try {
        const taskContent = req.body.content; 
        const response = await axios.post('https://api.todoist.com/rest/v2/tasks', {
            content: taskContent
        }, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            }
        });
        console.log('hello buddy');
        res.status(200).json({ message: 'Task added' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add the task' });
    }
});



app.get('/get-task', protectRoute,async (req, res) => {
    try {
       // console.log('hello');
        
        const response = await axios.get('https://api.todoist.com/rest/v2/tasks', {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch data from Todoist API' });
    }
});



app.post('/complete-task/:taskId',protectRoute, async (req, res) => {
    try {
        const taskId = req.params.taskId;
      
        
        await axios.post(`https://api.todoist.com/rest/v2/tasks/${taskId}/close`, null, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            }
        });
        res.status(200).json({ message: 'Task marked as completed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete the task' });
    }
});





app.put('/update-task/:taskId',protectRoute, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const taskContent = req.body.content; 
        
        const response = await axios.post(`https://api.todoist.com/rest/v2/tasks/${taskId}`, {
            content: taskContent
        }, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            }
        });
        res.status(200).json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update the task' });
    }
});




app.delete('/delete-task/:taskId',protectRoute, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
       
        await axios.delete(`https://api.todoist.com/rest/v2/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            }
        });
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete the task' });
    }
});





app.use('/', (req, res) => {
    // res.sendFile(__dirname + '/public/login.html'); 
    res.sendFile(path.join(__dirname, `public/login.html`));
  });














app.listen(3000, () => {
    console.log(`CORS proxy server is running on port ${3000}`);
});
