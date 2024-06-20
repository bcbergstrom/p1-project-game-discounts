//Global Variables to store data to access through functions
let prevDeal = undefined
let dealInt = 0
let currentDeal = undefined
let userID = null
let ranOnce = false
const globalNewLikedGames = []
let star = ""
const globalNewLikedUsers = []



//general reqeust object for the cheapShark API
let requestOptions = {
    method: "GET",
    redirect: "follow"
}

//my "fetch" command to grab all the deals
const fetchFromShark = () => {
    //fetches the day's deals from steam
    start()
    fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&steamRating=85&onSale=1", requestOptions)
        .then(r => r.json())
        .then(deals => {
            //sets the deals object to all the deals
            dealsObj = deals
            //runs a majority of functions
            refreshDeals()
            //adds handlers/load functionality
            if(!ranOnce){
                buttonHandler()             
                onLoad()
                ranOnce = true
            }
        })
}

const buttonHandler = () =>{
    //query selectors to grab the button html
    const prev = document.querySelector("#game-prev")
    const next = document.querySelector("#game-next")
    const listButton = document.querySelector("#list-reset-yes")


    //event Listeners for the 2 buttons (listButton and next/prev)
    listButton.addEventListener("click",onClick)
    next.addEventListener("click",() => {
        //sets the previous deal to the current deal and refreshes the deals
        prevDeal = currentDeal
        refreshDeals()
        //if the object is 0, rerun the fetch command in order to refresh the deals
        if(dealsObj.length == 0){
            fetchFromShark()
        }
        //check if the game is "starred", or if people using my site deem it to 
        // be good enough to be 'poupular'
        checkIfStarred()

    })
    prev.addEventListener("click", () => {
        if(currentDeal == prevDeal){
            refreshDeals()
        } else {
            //grabs some new data, such as grabbing all the data from steam
            getGameData(prevDeal.steamAppID)
            
            currentDeal = prevDeal
        }
    })
}

const refreshDeals = () => {
    //filters the deals based on review count, if steam review is greater 
    //or equal to 10k

    const filteredDeals = dealsObj.filter(deal => 
        deal.steamRatingCount >= 10000)

    //gets a random deal from filtered deals, then removes said deal
    const splitDeals = Math.floor((Math.random() * filteredDeals.length))
    const finalDeal = filteredDeals[splitDeals]
    filteredDeals.splice(splitDeals,1)
    //adds data to the global objects
    currentDeal = finalDeal
    dealsObj = filteredDeals
    //grabs the gamedata
    getGameData(finalDeal.steamAppID)
}




const getGameData = (gameID) => {
    //grabs the data from the steam API using a CORS Proxy (demo)
    fetch(`https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids=${gameID}`)
    .then(r => r.json())
    .then(data => {
        //makes the data parsable
        const temp = data[gameID].data
        //assings data
        assignData(temp)
    })
}

const assignData = (steamGameObj) => {
        //query selectors for all the objects
        const thumbnail = document.querySelector("#game-thumbnail")
        const title = document.querySelector("#game-title")
        const tags = document.querySelector("#game-desc-short")
        const price = document.querySelector("#best-price-src")
        const description = document.querySelector("#game-desc-long")
        const img_1 = document.querySelector("#desc-img-1")
        const img_2 = document.querySelector("#desc-img-2")
        const body = document.querySelector("#main-grid")
        
        //changes the body back to a visible class
        body.className = "fixed-grid"
        //adds all the screenshots, descriptions, pricing info, etc.
        img_1.src = steamGameObj.screenshots[0].path_thumbnail
        img_2.src = steamGameObj.screenshots[1].path_thumbnail
        description.textContent = steamGameObj.short_description
        price.textContent = "$" + currentDeal.salePrice
        price.href = `https://www.cheapshark.com/redirect?dealID=${currentDeal.dealID}&k=1`
        thumbnail.src = steamGameObj.header_image
        //adds the star to the object
        title.textContent = steamGameObj.name + star
        tags.textContent = steamGameObj.genres[0].description

}
//stores data for the users
function storeData(){
    //grabs data from the json server
    fetch("http://localhost:3000/users")
    .then(r => r.json())
    .then(users1 => {
        //filter all the users to make sure it's existing or not existing in the db
        const filteredUsers = users1.filter(user1 => {
            return  parseInt(user1.id) === parseInt(userID)
        })
        //change it to a string so the db doesn't yell at me
        const tempTempUserID = userID.toString()
        //if there is no users that share an ID, then add it in
        if(filteredUsers.length == 0){
            fetch("http://localhost:3000/users", {
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
        },
                body:JSON.stringify({
                    id:tempTempUserID,
                    gamesLiked:[currentDeal.gameID]
                })
            })
            .then(r => r.json())
            .then(q => {
                //add it to the "global likes list (utilized for 2 other functions)"
                globalNewLikedGames.push(currentDeal.gameID)
                //check if the game liked deserves to be starred
                checkIfStarred()
            })
        } else {
            //fetch's a specific ID and patch's it using the globalNewLikedGames array
            fetch(`http://localhost:3000/users/${(userID)}`, {
                method:"PATCH",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    gamesLiked:[...globalNewLikedGames,currentDeal.gameID]
                })
            })
            .then(r => r.json())
            .then(games => {
                //add it to the "global likes list (utilized for 2 other functions)"
                globalNewLikedGames.push(currentDeal.gameID)
                checkIfStarred()
            })
        }
    })
}

//start is an initalizer that hides stuff
const start = () => {
    const form = document.querySelector("#purchase-form")
    form.className = "box is-hidden"

}

//creates event listeners for the menu screen/the "like game" button
function onLoad() {
    //blur is whenever something loses focus, so we're losing focus whenever we tab
    //out or ustilize the "purchase game" link
    document.addEventListener("blur", () => {
        //selects all the objects to hide the buttons on blur
        const form = document.querySelector("#purchase-form")
        const body = document.querySelector("#main-grid")
        body.className = "fixed-grid is-hidden"
        form.className = "box"
    
    })
    //creates the event listeners for the blur buttons 
    onBlur()
    //selects and creates the menu mouseover event hover
    const menu = document.querySelector("#menu_button")
    menu.addEventListener("mouseover", eventHover)
}



function eventHover(){
    //removes the onBlur event listener (incase it's ran again) and sets up the menu
    document.removeEventListener("blur", onBlur)
    const body = document.querySelector("#main-grid")
    body.className = "fixed-grid is-hidden"
    const reset = document.querySelector("#reset-list")
    reset.className = "box"
}

//checks if the game currently seelcted has 4 or more reviews, and if so, then sets the star to *
function checkIfStarred(){
    fetch(`http://localhost:3000/games/${currentDeal.gameID}`)
    .then(r => r.json())
    .then(games => {
        if(games.usersLiked.length == undefined){
            star = ""
        } else if(games.usersLiked.length > 4) {
            star = "*"
        }
    }).catch(() => {
        star = ""
    })
}


//onClick for the reset button
function onClick(){
    document.addEventListener("blur",onBlur)
    document.querySelector("#reset-list").className = "cell is-hidden"
    fetchFromShark()
}



//creates the like system
function onBlur(){
    const form = document.querySelector("#purchase-form")
    const body = document.querySelector("#main-grid")
    body.className = "fixed-grid is-hidden"
    form.className = "box"
    const yes = document.querySelector("#game-purchased")
    const no = document.querySelector("#game-not-purchased")
    yes.addEventListener("click", () => {
        storeData()
        body.className = "fixed-grid"
        form.className = "box is-hidden"
        storeGameData()
        refreshDeals()
    })
    no.addEventListener("click",() => {
        body.className = "fixed-grid"
        form.className = "box is-hidden"
    })

}


//stores a bunch of data based on likes for the games
function  storeGameData(){
    fetch("http://localhost:3000/games")
    .then(r => r.json())
    .then(games => {

        const filteredGames = games.find(game => {
        return game.id == currentDeal.gameID
        })
                if(filteredGames == undefined){
            fetch("http://localhost:3000/games", {
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
        },
                body:JSON.stringify({
                    id:currentDeal.gameID,
                    steamID: currentDeal.steamAppID,
                    dealID:currentDeal.dealID,
                    usersLiked:[userID.toString()]
                })
            })
            .then(r => r.json())
            .then(users => {
                checkIfStarred()

            })
        } else {
            fetch(`http://localhost:3000/games/${currentDeal.gameID}`, {
                method:"PATCH",
                headers:{
                    'Content-Type':'application/json'
        },
                body:JSON.stringify({
                    usersLiked:[...filteredGames.usersLiked,userID.toString()]
                })
            })
            .then(r => r.json())
            .then(games => {
                checkIfStarred()

            })
        }
    })

}

//creates an id and runs the info once the DOM is loaded
function generatePage(){
    document.addEventListener("DOMContentLoaded", () => {
        userID = Math.floor(Math.random() * 1000)
        fetchFromShark()
    })
}

generatePage()
