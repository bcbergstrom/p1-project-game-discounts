//Function and Functionality
let dealsObj = undefined
let prevDeal = undefined
let dealInt = 0
let currentDeal = undefined
let userID = Math.floor(Math.random() * 100)
let ranOnce = false



let requestOptions = {
    method: "GET",
    redirect: "follow"
}
const fetchFromShark = () => {
    //fetches the day's deals from steam
    start()
    fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&steamRating=85&onSale=1", requestOptions)
        .then(r => r.json())
        .then(deals => {
            dealsObj = deals
            refreshDeals()
            if(!ranOnce){
                buttonHandler()             
                onLoad()
                ranOnce = true
            }
        })
}

const buttonHandler = () =>{
    const prev = document.querySelector("#game-prev")
    const next = document.querySelector("#game-next")
    const listButton = document.querySelector("#list-reset-yes")
    listButton.addEventListener("click",onClick)
    next.addEventListener("click",() => {
        prevDeal = currentDeal
        refreshDeals()
        if(dealsObj.length == 0){
            fetchFromShark()
        }
    })
    prev.addEventListener("click", () => {
        if(currentDeal == prevDeal){
            refreshDeals()
        } else {
            getGameData(prevDeal.steamAppID)
            currentDeal = prevDeal
        }
    })
}

const refreshDeals = () => {
    const filteredDeals = dealsObj.filter(deal => 
        deal.steamRatingCount >= 10000)
        //gets a random "deal from filtered deals, then removes said deal"
    const splitDeals = Math.floor((Math.random() * filteredDeals.length))
    const finalDeal = filteredDeals[splitDeals]
    filteredDeals.splice(splitDeals,1)
    currentDeal = finalDeal
    dealsObj = filteredDeals
    getGameData(finalDeal.steamAppID)
}


const getGameData = (gameID) => {
    fetch(`https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids=${gameID}`)
    .then(r => r.json())
    .then(data => {
        const temp = data[gameID].data
        assignData(temp)
    })
}

const assignData = (steamGameObj) => {
        const thumbnail = document.querySelector("#game-thumbnail")
        const title = document.querySelector("#game-title")
        const tags = document.querySelector("#game-desc-short")
        const price = document.querySelector("#best-price-src")
        const description = document.querySelector("#game-desc-long")
        const img_1 = document.querySelector("#desc-img-1")
        const img_2 = document.querySelector("#desc-img-2")
        const body = document.querySelector("#main-grid")

        body.className = "fixed-grid"
        img_1.src = steamGameObj.screenshots[0].path_thumbnail
        img_2.src = steamGameObj.screenshots[1].path_thumbnail
        description.textContent = steamGameObj.short_description
        price.textContent = "$" + currentDeal.salePrice
        price.href = `https://www.cheapshark.com/redirect?dealID=${currentDeal.dealID}&k=1`
        thumbnail.src = steamGameObj.header_image
        title.textContent = steamGameObj.name
        tags.textContent = steamGameObj.genres[0].description

}

const storeData = (userData) => {

}


const start = () => {
    const form = document.querySelector("#purchase-form")
    form.className = "box is-hidden"

}

function onLoad() {
    document.addEventListener("blur", onBlur)
    const menu = document.querySelector("#menu_button")
    menu.addEventListener("mouseover", eventHover)
}



function eventHover(){
    document.removeEventListener("blur", onBlur)
    const body = document.querySelector("#main-grid")

    body.className = "fixed-grid is-hidden"

    
    const reset = document.querySelector("#reset-list")
    reset.className = "box"



}

function onClick(){
    document.addEventListener("blur",onBlur)
    document.querySelector("#reset-list").className = "cell is-hidden"
    fetchFromShark()
}




function onBlur(){
    const form = document.querySelector("#purchase-form")
    const body = document.querySelector("#main-grid")
    body.className = "fixed-grid is-hidden"
    form.className = "box"
    const yes = document.querySelector("#game-purchased")
    const no = document.querySelector("#game-not-purchased")
    yes.addEventListener("click", () => {
        storeData(userID)
        body.className = "fixed-grid"
        form.className = "box is-hidden"
        refreshDeals()
    })
    no.addEventListener("click",() => {
        body.className = "fixed-grid"
        form.className = "box is-hidden"
    })
}


fetchFromShark()
