import express from "express";
import http from "http";
import socketio, { Socket } from 'socket.io';

type Player = {
    id: number,
    name: string,
    joined: boolean,
    socketId: string,
}
const app: express.Express = express();
const server: http.Server = http.createServer(app);
const io: socketio.Server = new socketio.Server(server);

app.use(express.static("public"));

var players = [
    { id:1, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
    { id:2, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
    { id:3, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
    { id:4, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
    { id:5, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
    { id:6, name: "", joined: false, isWaiting: false, correct: false, socketId: "" },
]

var mode = 0
var hintMode = 0
var correctAnswer = ""
var answer = ""
var prefix = ""
var hintA = ""
var hintB = ""
var hintC = ""
var pointR = 0
var pointB = 0

var adminSocket: Socket | undefined

io.on("connection", (socket: socketio.Socket) => {
    socket.emit("PLAYERS", players)
    socket.emit("QUESTION", answer)
    socket.emit("PREFIX", prefix)
    socket.emit("HINT", hintA, hintB, hintC)
    socket.emit("MODE", mode)
    socket.emit("MODE_HINT", hintMode)
    socket.emit("POINT", pointR, pointB)

    socket.on("ADMIN", () => {
        adminSocket = socket
    })
    socket.on("RESET", () => {     
        players.forEach((it) => {
            it.isWaiting = false
            it.correct = false
        })

        correctAnswer = ""
        answer = ""
        prefix = ""
        hintA = ""
        hintB = ""
        hintC = ""

        io.emit("PLAYERS", players)
        io.emit("QUESTION", answer)
        io.emit("PREFIX", prefix)
        io.emit("HINT", hintA, hintB, hintC)
        
        adminSocket?.emit("FETCH_PLAYERS", players)
        adminSocket?.emit("FETCH_CORRECT_ANSWER", correctAnswer)
        adminSocket?.emit("FETCH_ANSWER", answer)
        adminSocket?.emit("FETCH_PREFIX", prefix)
        adminSocket?.emit("FETCH_HINT", hintA, hintB, hintC)
    })
    socket.on("MODE", (num: number) => {
        mode = num
        io.emit("MODE", num)
    })
    socket.on("MODE_HINT", (num: number) => {
        hintMode = num
        io.emit("MODE_HINT", num)
    })
    socket.on("CORRECT_ANSWER", (str: string) => {
        correctAnswer = str
    })
    socket.on("FETCH", () => {
        socket.emit("FETCH_PLAYERS", players)
        socket.emit("FETCH_CORRECT_ANSWER", correctAnswer)
        socket.emit("FETCH_ANSWER", answer)
        socket.emit("FETCH_PREFIX", prefix)
        socket.emit("FETCH_HINT", hintA, hintB, hintC)
    })

    socket.on("JOIN", (num: number) => {
        players[num].joined = true
        players[num].socketId = socket.id

        socket.emit("JOIN")
        io.emit("PLAYERS", players)
    });

    socket.on("UPDATE_PLAYER_NAME", (num: number, name: string) => {
        console.log(`update player name ${num}:${name}`)
        players[num].name = name
        io.emit("PLAYERS", players)
    });
    
    socket.on("UPDATE_ANSWER", (str: string) => {
        answer=str
        io.emit("QUESTION", answer)
    });
    
    socket.on("UPDATE_PREFIX", (str: string) => {
        prefix=str
        io.emit("PREFIX", prefix)
    });
    
    socket.on("UPDATE_HINT", (a: string, b: string, c: string) => {
        hintA = a
        hintB = b
        hintC = c
        io.emit("HINT", hintA, hintB, hintC)
    });
    socket.on("POINT", (r: number, b: number) => {
        pointR = r
        pointB = b
        io.emit("POINT", pointR, pointB)
    });
    
    socket.on("ANSWER", (a: string, b: string, c: string) => {
        const player = players.find((it) => it.socketId == socket.id)
        if(player != undefined) {
            if(player.isWaiting) return

            player.isWaiting = true
            io.emit("PLAYERS", players)
            adminSocket?.emit("ANSWER", {id: player.id, name: player.name}, {a: a, b: b, c: c})
        }
    });
    socket.on("CORRECT", (id: number) => {
        players[id-1].correct = true
        io.emit("PLAYERS", players)
        io.emit("CORRECT")
    });
    socket.on("WRONG", (id: number) => {
        players[id-1].isWaiting = false
        players[id-1].correct = false
        io.emit("PLAYERS", players)
        io.emit("WRONG")
    });

    socket.on("disconnect", () => {
        console.log(`disconnect ${socket.id}`)
        const player = players.find((it)=>it.socketId==socket.id)
        if(player != undefined) {
            player.joined = false
            player.socketId = ""
        }
    });
});

server.listen(3001, () => console.log("listening on *:3001"));