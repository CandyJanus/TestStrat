const express = require('express'); 
const fs = require("fs");
const path = require('path')
const PORT = process.env.PORT || 5000;

//NOTE: JS browser is being used because of the chess graphics library 

// static data here is the website data that doesn't change while being sent from browser to server, which in this case, is all of it

const server = express()
    .use(express.static(path.join(__dirname, 'public')))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const { Server } = require('ws');
const e = require('express');

//NOTE: ws stands for web socket which connects browser to server, wss stands for web socket server as in a server that a web socket connects to

const wss = new Server({ server });


function sendMsg(client, type, msg="", move) {
  var new_msg = {
    type: type,
    content: msg,
    move: move,
    date: Date.now()
  };
  client.send(JSON.stringify(new_msg));
}

//NOTE: fen is standard chess notation
starting_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0'
// starting_fen = 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d3 0 2'
// starting_fen = 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1'

num_players_connected = 0

function reset(){
  fs.writeFile("./board.txt", starting_fen, () => {return 0;})
  // i = 0
  // wss.clients.forEach((client) => {
  //   sendMsg(client, 'state', starting_fen)
  // })
    wss.clients.forEach((client) => {
    sendMsg(client, 'reset', starting_fen)
  })
}

players = []

//NOTE: the .on function has the specified trigger, 'connection,' upon which it runs the lambda function to do stuff, in this case send data 
wss.on('connection', (ws) => {
    // need to verify two players connected
    console.log('Client connected');
    //   var msg = {
    //   type: "order",
    //   msg: num_players_connected,
    //   date: Date.now()
    // };

    //NOTE: to designate the order of the player, num_players_connected is a static variable within the server (that is, replaced by incoming data but not changed by the server)
    //NOTE: this goes to the client from the server. because this is the server code, all sendMsgs in this file will go to client
    sendMsg(ws, "order", num_players_connected)
    // ws.send(JSON.stringify(msg))
    
    //NOTE: tracks number of players. ws is the browser stream
    players.push([ws, num_players_connected])
    //NOTE: num players connnected is currently being used as the player id
    num_players_connected += 1
    // console.log("num_players_connected: " + num_players_connected)
    if (num_players_connected < 2) {
      // state is fen right now, though might add metadata later
      // var fen = fs.readFileSync("./board.txt", 'UTF-8')
      reset()
      // console.log("starting fen " + fen)
      // console.log(num_players_connected)
    } else{
      // fen = fs.readFileSync("./board.txt", 'UTF-8')
      // sendMsg(ws, 'state', fen)
      reset()
    }


    // updating state from client message
    //NOTE: 
    ws.onmessage = function (event) {
      // console.log(ws.client)
        var msg = JSON.parse(event.data)
        // console.log(msg.type)
        // console.log(msg.state)
        switch(msg.type) {
            case "state":
                var state = msg.state
                // console.log(msg.move)
                if (state != undefined) {
                // fs.writeFile("./board.json", JSON.stringify(state), () => {return 0;})
                fs.writeFile("./board.txt", state, () => {return 0;})
                // console.log(ws.client)
                    //NOTE: iterates over the list of players, and iterates within those player objects to 
                players.forEach(player => {
                  // console.log(player[0])
                  if (player[0] != ws){
                    sendMsg(player[0], 'state', msg.state, msg.move)  
                    // console.log("sent");
                  }
                })
                // wss.clients.forEach((client) => {
                //   console.log(client.)
                //   // if (client != wss.id)
                //   sendMsg(client, 'state', msg.state, msg.move)
                // })
                }
                break;
            case "reset":
                reset()
                break;
            
        }
        };
    ws.on('close', () => {
      console.log('Client disconnected');

      // if one of the players has disconnected, close the other player
      // and enable people to sign up as players
      players.forEach(element => {
        if (element[0] == ws){
          console.log("player number was " + element[1])
          if (element[1] == 0 || element[1] == 1){
            players.forEach(element2 => {
              if (element2[1] == 0 || element2[1] == 1){
                var msg = {
                  type: "quit",
                  date: Date.now()
                };
                element2[0].send(JSON.stringify(msg))
                element2[0].close()
              }
            reset()
            num_players_connected = 0
          })
          }
        }
      });
      players = []
      });
    console.log(num_players_connected)
  });



// setInterval(() => {
// wss.clients.forEach((client) => {
//     var msg = {
//         type: "time",
//         text: new Date().toTimeString(),
//         date: Date.now()
//       };
//     client.send(JSON.stringify(msg));
//     // client.send('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R')

// });
// }, 1000);

