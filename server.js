const express = require('express');
const http = require('http');
const axios = require('axios');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
        io.emit('chat message', `You: ${msg}`);
        io.emit('chat message', 'AI: Waiting for response...');

        try {
            const response = await axios.post('http://192.168.1.160:1234/v1/chat/completions', {
                messages: [
                    { role: 'system', content: 'Always answer in rhymes.' },
                    { role: 'user', content: msg }
                ],
                temperature: 0.7,
                max_tokens: -1,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            io.emit('chat message', `AI: ${response.data.choices[0].message.content}`);
        } catch (error) {
            console.error(error);
            io.emit('chat message', 'AI: An error occurred while trying to communicate with the AI server.');
        }
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});