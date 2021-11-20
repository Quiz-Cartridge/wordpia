<template>
    <div class="admin">
        <div class="command">
            <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded-full" @mouseup="fetchData()">
            サーバーからデータ取得
            </button>
            <button class="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-6 rounded-full" @mouseup="changeMode()">
            対戦モード切替
            </button>
            <button class="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-6 rounded-full" @mouseup="changeHint()">
            ヒント数切り替え切替
            </button>
        </div>
        <div class="player">
            <p class="label">プレイヤー</p>
            <div class="input red">
                <label for="player1">PLAYER1</label>
                <input id="player1" v-model="player1" @input="updatePlayerName(0, $event)">
                <label for="player2">PLAYER2</label>
                <input id="player2" v-model="player2" @input="updatePlayerName(1, $event)">
                <label for="player3">PLAYER3</label>
                <input id="player3" v-model="player3" @input="updatePlayerName(2, $event)">
            </div>
            <br>
            <div class="input blue">
                <label for="player4">PLAYER4</label>
                <input id="player4" v-model="player4" @input="updatePlayerName(3, $event)">
                <label for="player5">PLAYER5</label>
                <input id="player5" v-model="player5" @input="updatePlayerName(4, $event)">
                <label for="player6">PLAYER6</label>
                <input id="player6" v-model="player6" @input="updatePlayerName(5, $event)">
            </div>
            <br>
            <div class="input point" :hidden="!mode>0">
                <label for="pointRed">RED_POINT</label>
                <input id="pointRed" v-model="pointR" @input="updatePoint()">
                <label for="pointBlue">RED_POINT</label>
                <input id="pointBlue" v-model="pointB" @input="updatePoint()">
            </div>
        </div>
        <br>

        <div class="question">
            <p class="label">問題</p>
            <div class="input">
                <label for="answer">回答</label>
                <input id="answer" v-model="answer">
                <button class="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-4 rounded-full" @mouseup="createRandomAnswer">
                ランダム生成
                </button>
                <input v-model="randomAnswer">
                <br><br>
                <label for="prefix">PREFIX</label>
                <input id="prefix" v-model="prefix">
                <label for="hintA">ヒントA</label>
                <input id="hintA" v-model="hintA">
                <label for="hintB">ヒントB</label>
                <input id="hintB" v-model="hintB">
                <label for="hintC" :hidden="hintMode<1">ヒントC</label>
                <input id="hintC" v-model="hintC" :hidden="hintMode<1">
                <br>
                <div class="command center">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded-full" @mouseup="showQuestion">
                    問題表示
                    </button>
                    <button class="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-6 rounded-full" @mouseup="updateHint">
                    1文字送信
                    </button>
                    <br><br>
                    <button class="bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded-full" @mouseup="reset">
                    リセット
                    </button>
                </div>
            </div>
        </div>
        <br>

        <div class="answer">
            <p class="label">回答一覧</p>
            <table class="table-auto input">
            <thead>
                <tr>
                <th class="px-4 py-2">名前</th>
                <th class="px-4 py-2">回答A</th>
                <th class="px-4 py-2">回答B</th>
                <th class="px-4 py-2" :hidden="hintMode<1">回答C</th>
                <th class="px-4 py-2">判定</th>
                </tr>
            </thead>
            <tbody v-for="ans, index in answerList" :key="index">
                <td class="border px-4 py-2">{{ans.name}}</td>
                <td class="border px-4 py-2">{{ans.answerA}}</td>
                <td class="border px-4 py-2">{{ans.answerB}}</td>
                <td class="border px-4 py-2" :hidden="hintMode<1">{{ans.answerC}}</td>
                <td class="border px-4 py-2">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded-full" @mouseup="correct(ans.id, index)">
                    正解
                    </button>
                    <button class="bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded-full" @mouseup="wrong(ans.id, index)">
                    不正解
                    </button>
                </td>
            </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { io, Socket } from 'socket.io-client'

interface Answer {id: number, name: string, answerA: string, answerB: string, answerC: string}
const socket: Socket = io(`${process.env.HOST}:3001`, { transports : ['websocket'] });

export default Vue.extend({
    data() {
        return {
            mode: 0,
            hintMode: 0,
            player1: "",
            player2: "",
            player3: "",
            player4: "",
            player5: "",
            player6: "",
            answer: "",
            randomAnswer: "",
            prefix: "",
            index: 0,
            hintA: "",
            hintB: "",
            hintC: "",
            answerList: [] as Array<Answer>,
            pointR: 0,
            pointB: 0,
        }
    },
    methods: {
        changeMode() {
            this.mode ++
            if(this.mode == 2) {
                this.mode = 0
            }
            socket.emit("MODE", this.mode)
        },
        changeHint() {
            this.hintMode ++
            if(this.hintMode == 2) {
                this.hintMode = 0
            }
            socket.emit("MODE_HINT", this.hintMode)
        },
        updatePlayerName(num: number, e: Event) {
            socket.emit("UPDATE_PLAYER_NAME", num, (e as any).target.value)
        },
        showQuestion() {
            socket.emit("CORRECT_ANSWER", this.answer)
            socket.emit("UPDATE_ANSWER", this.randomAnswer)
            socket.emit("UPDATE_PREFIX", this.prefix)
        },
        reset() {
            this.index = 0
            this.answer = ""
            this.randomAnswer = ""
            this.hintA = ""
            this.hintB = ""
            this.hintC = ""
            this.answerList.splice(0, this.answerList.length)
            socket.emit("RESET")
        },
        createRandomAnswer() {
            const list = this.answer.split("")
            const sorted = list.sort( () => .5 - Math.random() )
            const result = sorted.join("")
            this.randomAnswer = result
        },
        updateHint() {
            this.index ++
            socket.emit("UPDATE_HINT", 
                this.hintA.substring(this.hintA.length - this.index, this.hintA.length),
                this.hintB.substring(this.hintB.length - this.index, this.hintB.length),
                this.hintC.substring(this.hintC.length - this.index, this.hintC.length),
            )
        },
        correct(id: number, index: number) {
            this.answerList.splice(index, 1)
            socket.emit("CORRECT", id)
        },
        wrong(id: number, index: number) {
            this.answerList.splice(index, 1)
            socket.emit("WRONG", id)
        },
        fetchData() {
            socket.emit("FETCH")
        },
        updatePoint() {
            socket.emit("POINT", this.pointR, this.pointB)
        }
    },
    created() {
        socket.emit("ADMIN")
        
        socket.on("FETCH_PLAYERS", (players: {name: string}[]) => {
            this.player1 = players[0].name
            this.player2 = players[1].name
            this.player3 = players[2].name
            this.player4 = players[3].name
            this.player5 = players[4].name
            this.player6 = players[5].name
        })
        socket.on("FETCH_HINT", (a:string, b:string, c:string) => {
            this.hintA = a
            this.hintB = b
            this.hintC = c
        })
        socket.on("FETCH_PREFIX", (str:string) => {
            this.prefix = str
        })
        socket.on("FETCH_ANSWER", (str:string) => {
            this.randomAnswer = str
        })
        socket.on("FETCH_CORRECT_ANSWER", (str:string) => {
            this.answer = str
        })
        
        socket.on("ANSWER", (player: {id: number, name: string}, answer: {a:string, b:string, c: string}) => {
            const ans: Answer = { id: player.id, name: player.name, answerA: answer.a, answerB: answer.b, answerC: answer.c }
            this.answerList.push(ans)
        })
        
        socket.on("disconnect", () => {
            alert("サーバーとの接続が切れました。\r\nリロードしてください＞＜")
        })
    }
})
</script>

<style scoped>
.admin {
    width: 100vw;
    height: 100vh;
    background-image: url("~@/assets/image/background.gif");
    background-size: cover;
}
.command {
    padding: 1% 1% 0% 1%;
}
.input {
    color: #e1cfab;
    font-size: 3vh;
    padding: 1% 1% 0% 1%;
}
.label {
    font-size: 4vh;
    font-weight: bold;
    color: aqua;
}
.center {
    text-align: center;
}
.answer tbody {
    color: #fff;
}
</style>