let modInfo = {
    name: "The universe Tree",
    id:"uitu",
    author: "User incremental",
    pointsName: "force",
    modFiles: ["layers.js", "tree.js"],
    allowSmall: true,

    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal("1e-39"),
    offlineLimit: 1, // In hours
}

// Version Info
let VERSION = {
    num: "0.A",
    name: "There is a atom",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.A</h3><br>
        - Added 6 layers.<br>
        - Added the universe.`

let winText = `Congratulations! You have reached the end of this game I guess.....`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"] // Don't call these every tick

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
    return player.g.points.gt(0)
}

// Function to calculate the point generation per second
function getPointGen() {
    if (!canGenPoints())
        return new Decimal(0)

    let gain=new Decimal("1e-40")
    let base=new Decimal(3)
    if(hasUpgrade("g",23)) base=base.add(upgradeEffect("g",23))
    if(hasChallenge("n",11)) base=base.add(0.1)
    if(hasMilestone("a",0)) base=base.add(player.a.points.min(50).times(0.01))

    gain=gain.times(Decimal.pow(base,player.g.points.add(1).log10()))
    if(hasUpgrade("g",11)) gain=gain.times(2)
    if(hasUpgrade("g",12)) gain=gain.times(upgradeEffect("g",12))
    if(hasUpgrade("g",13)) gain=gain.times(upgradeEffect("g",13))
    if(hasUpgrade("p",41)) gain=gain.times(upgradeEffect("p",41))
    if(hasUpgrade("n",12)) gain=gain.times(10)
    gain=gain.times(buyableEffect("g",11))
    gain=gain.times(buyableEffect("g",21))
    if(player.q.unlocked) gain=gain.times(tmp.q.calcqboost)
    if(hasMilestone("p",0)) gain=gain.times(10)

    if(gain.gte(1)) gain=gain.pow(buyableEffect("a",11))
    
    let softcap=new Decimal(1)
    let softpower=new Decimal(0.005)
    let softcapdiv=new Decimal(1)
    if(hasUpgrade("p",31)) softpower=softpower.times(0.98)
    if(inChallenge("n",12)) softpower=softpower.times(2)
    if(hasUpgrade("n",14)) softcapdiv=softcapdiv.div(0.9)
    if(hasChallenge("n",12)) softcapdiv=softcapdiv.div(0.95)
    softcap=(gain.div(getForceSoftcap()[1]).add(1).log10().div(softcapdiv)).add(1).pow(softpower)

    if(gain.gte(getForceSoftcap()[1])){
        let over=gain.sub(getForceSoftcap()[1]).max(0)
        let low1=over.pow(softcap).add(getForceSoftcap()[1])
        let high1=over.root(softcap).add(getForceSoftcap()[1])
        if(over.gte(1)) gain=high1
        if(over.lt(1)) gain=low1
    }

    if(hasUpgrade("n",21)) gain=gain.times(upgradeEffect("n",21))

    return gain;
}

//Calculate force softcaps
function getForceSoftcap() {
    let startsAt=new Decimal("1e-13")
    if(hasUpgrade("p",11)) startsAt=new Decimal(1)
    if(inChallenge("n",12)) startsAt=new Decimal("1e-39")
    if(player.e.ischarge3) startsAt=startsAt.times(tmp.e.chargeeff[3])
    if(hasUpgrade("a",34)) startsAt=startsAt.times(upgradeEffect("a",34))
     
    let gain=new Decimal("1e-40")
    let base=new Decimal(3)
    if(hasUpgrade("g",23)) base=base.add(upgradeEffect("g",23))
    if(hasChallenge("n",11)) base=base.add(0.1)
    if(hasMilestone("a",0)) base=base.add(player.a.points.min(50).times(0.01))
    gain=gain.times(Decimal.pow(base,player.g.points.add(1).log10()))
    if(hasUpgrade("g",11)) gain=gain.times(2)
    if(hasUpgrade("g",12)) gain=gain.times(upgradeEffect("g",12))
    if(hasUpgrade("g",13)) gain=gain.times(upgradeEffect("g",13))
    if(hasUpgrade("p",41)) gain=gain.times(upgradeEffect("p",41))
    if(hasUpgrade("n",12)) gain=gain.times(10)
    gain=gain.times(buyableEffect("g",11))
    gain=gain.times(buyableEffect("g",21))
    if(player.q.unlocked) gain=gain.times(tmp.q.calcqboost)
    if(hasMilestone("p",0)) gain=gain.times(10)

    if(gain.gte(1)) gain=gain.pow(buyableEffect("a",11))
    
    let softcap=new Decimal(1)
    let softpower=new Decimal(0.5)
    let softcapdiv=new Decimal(10)
    if(hasUpgrade("p",31)) softpower=softpower.times(0.98)
    if(inChallenge("n",12)) softpower=softpower.times(2)
    if(hasUpgrade("n",14)) softcapdiv=softcapdiv.div(0.9) 
    if(hasChallenge("n",12)) softcapdiv=softcapdiv.div(0.95)
    softcap=(gain.div(startsAt).add(1).log10().div(softcapdiv)).add(1).pow(softpower)

    return [null,startsAt,softcap]
}

// Add non-layer related variables that should go into "player"
function addedPlayerData() {
}

// Display extra things at the top of the page
var displayThings = [
];

// Determines when the game "ends"
function isEndgame() {
    return hasUpgrade("a",38)
}

// Background styles
var backgroundStyle = {}

// Max tick length
function maxTickLength() {
    return 3600 // Default is 1 hour
}

// Fix saves for old versions (no changes needed)
function fixOldSave(oldVersion) {
    // You can add your save fix logic here if necessary
}
