let adminPlayers = []
let adminMatches = []

let matchEvents = []

document.addEventListener("DOMContentLoaded", ()=>{

loadData()

})

function loadData(){

adminPlayers = JSON.parse(localStorage.getItem("adminPlayers")) || []

adminMatches = JSON.parse(localStorage.getItem("adminMatches")) || []

displayPlayers()

displayMatches()

updateStats()

}

function saveData(){

localStorage.setItem("adminPlayers", JSON.stringify(adminPlayers))

localStorage.setItem("adminMatches", JSON.stringify(adminMatches))

}









/* PLAYERS */

document.getElementById("playerForm").addEventListener("submit", e=>{

e.preventDefault()

const id = document.getElementById("playerId").value

const player = {

id: id ? parseInt(id) : Date.now(),

name: playerName.value,

nickname: playerNickname.value,

position: playerPosition.value,

number: parseInt(playerNumber.value),

goals: parseInt(playerGoals.value) || 0,

assists: parseInt(playerAssists.value) || 0

}

if(id){

const index = adminPlayers.findIndex(p=>p.id==id)

adminPlayers[index]=player

}else{

adminPlayers.push(player)

}

saveData()

displayPlayers()

updateStats()

playerForm.reset()

})



function displayPlayers(){

const container = document.getElementById("playersList")

container.innerHTML=""

adminPlayers.forEach(player=>{

container.innerHTML+=`

<div>

${player.name} #${player.number}

<button onclick="deletePlayer(${player.id})">Delete</button>

</div>

`

})

}



function deletePlayer(id){

adminPlayers = adminPlayers.filter(p=>p.id!=id)

saveData()

displayPlayers()

updateStats()

}








/* MATCHES */

document.getElementById("matchForm").addEventListener("submit", e=>{

e.preventDefault()

const id = matchId.value

const match = {

id: id ? parseInt(id) : Date.now(),

homeTeam: homeTeam.value,

awayTeam: awayTeam.value,

date: matchDate.value,

time: matchTime.value,

venue: matchVenue.value,

status: matchStatus.value,

homeScore: homeScore.value ? parseInt(homeScore.value) : null,

awayScore: awayScore.value ? parseInt(awayScore.value) : null,

events: matchEvents

}

if(id){

const index = adminMatches.findIndex(m=>m.id==id)

adminMatches[index]=match

}else{

adminMatches.push(match)

}

matchEvents=[]

displayEvents()

saveData()

displayMatches()

updateStats()

matchForm.reset()

})



function displayMatches(){

const container = document.getElementById("matchesList")

container.innerHTML=""

adminMatches.forEach(match=>{

container.innerHTML+=`

<div>

<strong>${match.homeTeam} vs ${match.awayTeam}</strong>

<div>${match.homeScore ?? "-"} - ${match.awayScore ?? "-"}</div>

<div>Status: ${match.status}</div>

<button onclick="goal(${match.id},'home')">Home Goal</button>

<button onclick="goal(${match.id},'away')">Away Goal</button>

<button onclick="completeMatch(${match.id})">Completed</button>

<button onclick="deleteMatch(${match.id})">Delete</button>

</div>

`

})

}



function goal(id,team){

const match = adminMatches.find(m=>m.id==id)

if(team==="home"){

match.homeScore = (match.homeScore||0)+1

}else{

match.awayScore = (match.awayScore||0)+1

}

match.status="completed"

saveData()

displayMatches()

}



function completeMatch(id){

const match = adminMatches.find(m=>m.id==id)

match.status="completed"

saveData()

displayMatches()

}



function deleteMatch(id){

adminMatches = adminMatches.filter(m=>m.id!=id)

saveData()

displayMatches()

updateStats()

}








/* MATCH EVENTS */

function addMatchEvent(){

const event = {

team:eventTeam.value,

type:eventType.value,

player:eventPlayer.value,

minute:eventMinute.value

}

matchEvents.push(event)

displayEvents()

}



function displayEvents(){

const container = document.getElementById("eventsList")

container.innerHTML=""

matchEvents.forEach((event,index)=>{

container.innerHTML+=`

<div>

${event.team} | ${event.type} | ${event.player} ${event.minute}'

<button onclick="removeEvent(${index})">X</button>

</div>

`

})

}



function removeEvent(index){

matchEvents.splice(index,1)

displayEvents()

}


/* STATS */

function updateStats(){

document.getElementById("totalPlayers").textContent = adminPlayers.length

document.getElementById("totalGoals").textContent = adminPlayers.reduce((a,b)=>a+b.goals,0)

document.getElementById("totalAssists").textContent = adminPlayers.reduce((a,b)=>a+b.assists,0)

document.getElementById("upcomingMatches").textContent = adminMatches.filter(m=>m.status==="upcoming").length

}
