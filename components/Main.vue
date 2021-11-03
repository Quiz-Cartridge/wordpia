<template>
  <dev class="main">
    <img class="background absolute" src="@/assets/image/background.gif">
    <img class="answer box absolute" :src="answerBoxImg">
    <div v-for="player, index in players" :key="player.id">
      <img :class="'statusImg statusImg'+(index+1)+' answer absolute'" :src="answerImg" :hidden="!player.isWaiting">
      <img :class="'statusImg statusImg'+(index+1)+' correct absolute'" :src="correctImg" :hidden="!player.correct">
    </div>
    <img class="mainImg absolute" :src="mainImg">

    <img class="answer button absolute" :src="buttonImg" v-on:mousedown="answerDown" v-on:mouseup="answerUp">

    <div class="hint2" :hidden="hintMode!=0">
    <draggable class="answer items absolute" v-model="items" :options="options" group="answerItem">
      <div class="item" v-for="item in items" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
        <draggable class="answerA items absolute" v-model="answerA" :options="options" group="answerItem">
      <div class="item" v-for="item in answerA" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
        <draggable class="answerB items absolute" v-model="answerB" :options="options" group="answerItem">
      <div class="item" v-for="item in answerB" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
    <div class="hint absolute" :hidden="joined">
      <div class="prefix absolute">
        <p id="prefix1" class="absolute">{{prefix}}</p>
        <p id="prefix2" class="absolute">{{prefix}}</p>
      </div>
      <div class="content absolute">
        <p id="content1" class="absolute">{{hintA}}</p>
        <p id="content2" class="absolute">{{hintB}}</p>
      </div>
    </div>

    </div>
    <div class="hint3" :hidden="hintMode!=1">
    <draggable class="answer items absolute" v-model="items" :options="options" group="answerItem">
      <div class="item" v-for="item in items" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
        <draggable class="answerA items absolute" v-model="answerA" :options="options" group="answerItem">
      <div class="item" v-for="item in answerA" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
        <draggable class="answerB items absolute" v-model="answerB" :options="options" group="answerItem">
      <div class="item" v-for="item in answerB" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
    <draggable class="answerC items absolute" v-model="answerC" :options="options" group="answerItem">
      <div class="item" v-for="item in answerC" :key="item.id">
        {{item.name}}
      </div>
    </draggable>
    <div class="hint absolute" :hidden="joined">
      <div class="prefix absolute">
        <p id="prefix1" class="absolute">{{prefix}}</p>
        <p id="prefix2" class="absolute">{{prefix}}</p>
        <p id="prefix3" class="absolute">{{prefix}}</p>
      </div>
      <div class="content absolute">
        <p id="content1" class="absolute">{{hintA}}</p>
        <p id="content2" class="absolute">{{hintB}}</p>
        <p id="content3" class="absolute">{{hintC}}</p>
      </div>
    </div>
    </div>

    <div class="point absolute" :hidden="gameType < 1">
      <p class="pointR absolute">{{pointR}}</p>
      <p class="pointB absolute">{{pointB}}</p>
    </div>
    <div v-for="player, index in players" :key="index">
      <Player :id="'player'+(index+1)" :name="player.name" class="absolute"/>
      <img :class="'join join'+(index+1)+' button absolute'" :hidden="joined || player.joined" :src="buttonImg" v-on:mousedown="join(index)">
    </div>
  </dev>
</template>

<script lang="ts">
import Vue from 'vue'
import draggable from 'vuedraggable'
import { io, Socket } from 'socket.io-client'

import Player from '@/components/Player.vue'

import answerImg from "@/assets/image/answer.png"
import correctImg from "@/assets/image/correct.png"
import answerBoxImg0 from "@/assets/image/answer_box_0.png"
import answerBoxImg1 from "@/assets/image/answer_box_1.png"
import buttonImg from "@/assets/image/button.png"
import pushImg from "@/assets/image/button_push.png"

import pushSound from '@/assets/sound/push.mp3'
import correctSound from '@/assets/sound/correct.mp3'
import wrongSound from '@/assets/sound/wrong.mp3'

const socket: Socket = io(`localhost:3001`, { transports : ['websocket'] });

export default Vue.extend({
  components: { draggable, Player },
  data() {
    return {
      gameType: 0,
      hintMode: 0,
      mainImg: null,
      answerImg: answerImg,
      correctImg: correctImg,
      answerBoxImg: answerBoxImg0,
      buttonImg: buttonImg,
      options: {
        animation: 200
      },
      items: [
        { id: 1, name: '' },
        { id: 2, name: '' },
        { id: 3, name: '' },
        { id: 4, name: '' },
        { id: 5, name: '' }
      ],
      answerA: [],
      answerB: [],
      answerC: [],
      prefix: "",
      hintA: "",
      hintB: "",
      hintC: "",
      pointR: 0,
      pointB: 0,
      players: [
        {id: 1, name: "", joined: false, isWaiting: false, correct: false},
        {id: 2, name: "", joined: false, isWaiting: false, correct: false},
        {id: 3, name: "", joined: false, isWaiting: false, correct: false},
        {id: 4, name: "", joined: false, isWaiting: false, correct: false},
        {id: 5, name: "", joined: false, isWaiting: false, correct: false},
        {id: 6, name: "", joined: false, isWaiting: false, correct: false},
      ],
      joined: false
    }
  },
  methods: {
    get refs():any {
      return this.$refs;
    },
    answerDown() {
      this.buttonImg = pushImg
    },
    answerUp() {
      this.buttonImg = buttonImg
      const audio = new Audio(pushSound)
      audio.play()

      const answerA = this.answerA.map((it)=>(it as any).name).join("")
      const answerB = this.answerB.map((it)=>(it as any).name).join("")
      const answerC = this.answerC.map((it)=>(it as any).name).join("")
      socket.emit("ANSWER", answerA, answerB, answerC)
    },
    join(num: number) {
      socket.emit("JOIN", num)
    }
  },
  mounted: function() {
    socket.on("connection", () => {
    });
    socket.on("MODE_HINT", (num: number) => {
      this.hintMode = num
      if(this.joined) {
        switch(this.hintMode) {
          case 0:
            this.mainImg = require("@/assets/image/player_main_0.png")
            break
          case 1:
            this.mainImg = require("@/assets/image/player_main_1.png")
            break
        }
      } else {
        switch(this.hintMode) {
          case 0:
            this.mainImg = require("@/assets/image/main_0.png")
            break
          case 1:
            this.mainImg = require("@/assets/image/main_1.png")
            break
        }
      }
    });
    socket.on("JOIN", () => {
      this.joined = true
      const audio = new Audio(pushSound)
      audio.play()

      switch(this.hintMode) {
        case 0:
          this.mainImg = require("@/assets/image/player_main_0.png")
          break
        case 1:
          this.mainImg = require("@/assets/image/player_main_1.png")
          break
      }
    })
    socket.on("PLAYERS", (players) => {
      this.players.splice(0, this.players.length)
      this.players.push(...players)
    })
    socket.on("POINT", (r:number, b:number) => {
      this.pointR = r
      this.pointB = b
    })
    socket.on("QUESTION", (str: string) => {
      const list = str.split("")
      const items = list.map((it, index)=> {
        return {id: index, name: it}
      })
      this.items = items
      this.answerA.splice(0, this.players.length)
      this.answerB.splice(0, this.players.length)
      this.answerC.splice(0, this.players.length)
    })
    socket.on("HINT", (a:string, b:string, c:string) => {
      this.hintA = a
      this.hintB = b
      this.hintC = c
    })
    socket.on("PREFIX", (str:string) => {
      this.prefix = str
    })
    socket.on("CORRECT", () => {
      const audio = new Audio(correctSound)
      audio.play()
    })
    socket.on("WRONG", () => {
      const audio = new Audio(wrongSound)
      audio.play()
    })
    
    socket.on("MODE", (num: number) => {
      switch(num) {
        case 0:
          return this.answerBoxImg = answerBoxImg0
        case 1:
          return this.answerBoxImg = answerBoxImg1
      }
    })
    
    socket.on("disconnect", () => {
      alert("サーバーとの接続が切れました。\r\nリロードしてください＞＜")
    })
    
    switch(this.hintMode) {
      case 0:
        this.mainImg = require("@/assets/image/main_0.png")
        break
      case 1:
        this.mainImg = require("@/assets/image/main_1.png")
        break
    }
  }
})
</script>
<style lang="scss" scoped>
.background {
  height: 100%;
  width: 100%;
  object-fit: fill;
}
.mainImg {
  height: 100%;
  width: 100%;
  object-fit: fill;
}
.answer.box {
  height: 100%;
  width: 90vw;
  top: 0vh;
  left: 1vw;
}
.answer.button {
  width: 6vw;
  height: 10vh;
  bottom: 1%;
  left: 50vw;
}
.items {
  width: 70vw;
  top: 18vh;
  right: 1vw;
  font-size: 14vh;
  text-align: center;
}
.hint2 .items.answerA {
  width: 57vw;
  height: 10vh;
  top: 44vh;
  right: 7vw;
  font-size: 14vh;
  text-align: center;
}
.hint2 .items.answerB {
  width: 57vw;
  height: 10vh;
  top: 60vh;
  right: 7vw;
  font-size: 14vh;
  text-align: center;
}

.hint3 .items.answerA {
  width: 57vw;
  height: 10vh;
  top: 39vh;
  right: 7vw;
  font-size: 11vh;
  text-align: center;
}
.hint3 .items.answerB {
  width: 57vw;
  height: 10vh;
  top: 53vh;
  right: 7vw;
  font-size: 11vh;
  text-align: center;
}
.hint3 .items.answerC {
  width: 57vw;
  height: 10vh;
  top: 67vh;
  right: 7vw;
  font-size: 11vh;
  text-align: center;
}

.item {
  display: inline-block;
  width: 5.4vw;
  color: #000000;
}
.item:hover {
  cursor: grab;
}
.item:active {
  cursor: grabbing;
}
.player {
  width: 23vw;
  font-size: 9vh;
  color: #e1cfab;
  letter-spacing: -2vh;
  left: 0.5vw;
  text-align: center;
}
#player1 {
  top: 16vh;
}
#player2 {
  top: 27vh;
}
#player3 {
  top: 38vh;
}
#player4 {
  top: 49vh;
}
#player5 {
  top: 60vh;
}
#player6 {
  top: 71vh;
}
.hint2 {
  width: 60vw;
  font-size: 9vh;
}
.hint2 .prefix {
  width: 30vw;
  left: 36vw;
  letter-spacing: -2.5vh;
}
.hint2 #prefix1 {
  top: 48vh;
}
.hint2 #prefix2 {
  top: 64vh;
}
.hint2 .content {
  letter-spacing: -3vh;
}
.hint2 #content1 {
  width: 40vw;
  text-align: right;
  left: 50vw;
  top: 48vh;
}
.hint2 #content2 {
  width: 40vw;
  text-align: right;
  left: 50vw;
  top: 64vh;
}

.hint3 {
  width: 60vw;
  font-size: 9vh;
}
.hint3 .prefix {
  width: 30vw;
  left: 36vw;
  letter-spacing: -2.5vh;
}
.hint3 #prefix1 {
  top: 41vh;
}
.hint3 #prefix2 {
  top: 55vh;
}
.hint3 #prefix3 {
  top: 69vh;
}
.hint3 .content {
  letter-spacing: -3vh;
}
.hint3 #content1 {
  width: 40vw;
  text-align: right;
  left: 50vw;
  top: 41vh;
}
.hint3 #content2 {
  width: 40vw;
  text-align: right;
  left: 50vw;
  top: 55vh;
}
.hint3 #content3 {
  width: 40vw;
  text-align: right;
  left: 50vw;
  top: 69vh;
}
.join {
  height: 8vh;
  left: 24vw;
}
.join.join1 {
  top: 19vh;
}
.join.join2 {
  top: 30vh;
}
.join.join3 {
  top: 41vh;
}
.join.join4 {
  top: 52vh;
}
.join.join5 {
  top: 63vh;
}
.join.join6 {
  top: 74vh;
}
.statusImg.answer {
  height: 30vh;
  width: 30vw;
  left: -2vh;
}
.statusImg1.answer {
  top: 9vh;
}
.statusImg2.answer {
  top: 20vh;
}
.statusImg3.answer {
  top: 30vh;
}
.statusImg4.answer {
  top: 40vh;
}
.statusImg5.answer {
  top: 52vh;
}
.statusImg6.answer {
  top: 63vh;
}
.statusImg.correct {
  height: 10vh;
  width: 16vw;
  left: 6vw;
}
.statusImg1.correct {
  top: 18vh;
}
.statusImg2.correct {
  top: 29vh;
}
.statusImg3.correct {
  top: 40vh;
}
.statusImg4.correct {
  top: 51vh;
}
.statusImg5.correct {
  top: 62vh;
}
.statusImg6.correct {
  top: 73vh;
}
.point {
  height: 10vh;
  font-size: 9vh;
}
.point .pointR {
  width: 16vw;
  text-align: center;
  top: -1vh;
  left: 7vw;
}
.point .pointB {
  width: 16vw;
  text-align: center;
  top: 88vh;
  left: 7vw;
}
</style>