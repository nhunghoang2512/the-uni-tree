addLayer("g", {
    name: "genesis", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        purchaseleft:20,
    }},
    color: "#DDDDDD",
    requires: new Decimal("1e-39"), // Can be a function that takes requirement increases into account
    resource: "genesis", // Name of prestige currency
    baseResource: "force", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        exp=0.5
        if(hasUpgrade("q",44)) exp+=0.1
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("g",14)) mult=mult.times(upgradeEffect("g",14))
        if(hasUpgrade("g",32)) mult=mult.times(upgradeEffect("g",32))
        if(hasUpgrade("g",15)) mult=mult.times(3)
        if(hasUpgrade("q",25)) mult=mult.times(upgradeEffect("q",25))
        if(hasUpgrade("q",43)) mult=mult.times(upgradeEffect("q",43))
        if(hasUpgrade("p",13)) mult=mult.times(upgradeEffect("p",13))
        mult=mult.times(buyableEffect("g",11))
        mult=mult.times(buyableEffect("g",23))

        if(hasMilestone("q",0)) mult=mult.times(tmp.q.quarkboost[1])
        if(hasChallenge("n",31)) mult=mult.times(player.q.points.pow(0.01).add(1))

        if(inChallenge("n",31)) mult=mult.div(player.q.points.pow(0.1).add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if(player.e.ischarge1) exp=exp.times(tmp.e.chargeeff[1])
        if(player.a.unlocked) exp=exp.times(buyableEffect("a",12))
        if(inChallenge("n",11)) exp=exp.times(0.3)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for genesis", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){
        let keep=[]
        if(hasUpgrade("q",22)||hasMilestone("a",0)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) {
            if(!hasUpgrade("q",22)) player.subtabs.g.mainTabs="Main"
            layerDataReset("g", keep)
        }
    },
    update(diff){
        if(player.points.eq(0)&&player.g.points.eq(0)) player.g.points=new Decimal(1)
    },
    layerShown(){return true},
    passiveGeneration(){return (hasUpgrade("q",31)||hasMilestone("a",0))?(upgradeEffect("q",31).max(hasMilestone("a",0)?0.05:0)):0},
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:#DDDDDD;text-shadow:0 0 10px #DDDDDD">${format(player.g.points)}</h2> genesis, producing <h2 style="color:#DDDDDD;text-shadow:0 0 10px #DDDDDD">${format(getPointGen())}</h2> force/s.`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",function() { return `Before buying any genesis things,force need to be more then 1e-39.`},{ "font-size":"15px"},],
                "blank",
                "upgrades",
                "blank",
                ["buyables",[1]],
            ]
        },
        "Quantum":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:#DDDDDD;text-shadow:0 0 10px #DDDDDD">${format(player.g.points)}</h2> genesis, producing <h2 style="color:#DDDDDD;text-shadow:0 0 10px #DDDDDD">${format(getPointGen())}</h2> force/s.`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                ["buyables",[2,3]],
                "blank",
                ["display-text",function() { return inChallenge("n",22)?`Purchases left:${player.g.purchaseleft}.`:``},{ "font-size":"15px"},],
            ],
            unlocked(){return hasUpgrade("g",25)}
        }
    },
    update(diff){
        if((hasUpgrade("q",23)||hasMilestone("p",0)||hasMilestone("a",0))) layers.g.buyables[11].buy()
        if((hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))&&(!inChallenge("n",22))) layers.g.buyables[21].buy()
        if((hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))&&(!inChallenge("n",22))) layers.g.buyables[22].buy()
        if((hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))&&(!inChallenge("n",22))) layers.g.buyables[23].buy()
        if((hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))&&(!inChallenge("n",22))) layers.g.buyables[31].buy()
        if((hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))&&(!inChallenge("n",22))) layers.g.buyables[32].buy()
    },
    upgrades:{
        11:{
            title:"Weak force",
            description(){return `Double force gain.`},
            cost(){return new Decimal(2)},
            unlocked(){ 
                return true
            },
            canAfford(){return player.g.points.gte(2)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(2)},
        },
        12:{
            title:"Strong force",
            description(){return `Boost force gain based on genesis.`},
            cost(){return new Decimal(5)},
            unlocked(){ 
                return hasUpgrade("g",11)
            },
            canAfford(){return player.g.points.gte(5)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(5)},
            effect(){return player.g.points.add(1).ln().pow(hasUpgrade("g",16)?2:1.6).times(hasMilestone("q",2)?tmp.q.quarkboost[3]:1).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("g",12))}`},
            tooltip(){
                if(hasUpgrade("g",21)) return `ln(g+1)<b style="color:#00EF00">^2+1`
                return `ln(g+1)^1.6+1`
            }
        },
        13:{
            title:"Pulling",
            description(){return `Boost force gain based on itself.`},
            cost(){return new Decimal(15)},
            unlocked(){ 
                return hasUpgrade("g",12)
            },
            canAfford(){return player.g.points.gte(15)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(15)},
            effect(){return player.points.times(1e40).pow(0.025).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("g",13))}`},
            tooltip(){
                if(hasUpgrade("g",22)) return `(f*1e40)<b style="color:#00EF00">^0.04</b>+1`
                return `(f*1e40)^0.025+1`
            }
        },
        14:{
            title:"Genesis power",
            description(){return `Boost genesis gain based on force.`},
            cost(){return new Decimal(30)},
            unlocked(){ 
                return hasUpgrade("g",13)
            },
            canAfford(){return player.g.points.gte(30)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(30)},
            effect(){return player.points.times(1e37).add(1).log10().pow(2).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("g",14))}`},
            tooltip(){return `log10(f*1e37+1)^2+1`}
        },
        15:{
            title:"Gravity",
            description(){return `Triple genesis gain, unlock a booster.`},
            cost(){return new Decimal(100)},
            unlocked(){ 
                return hasUpgrade("g",14)
            },
            canAfford(){return player.g.points.gte(100)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(100)},
        },
        21:{
            title:"Stronger force",
            description(){return `"Strong force" effect is stronger.`},
            cost(){return new Decimal(2e5)},
            unlocked(){ 
                return hasUpgrade("g",15)
            },
            canAfford(){return player.g.points.gte(2e5)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(2e5)},
            tooltip(){return "1.44->1.6"}
        },
        22:{
            title:"Strength",
            description(){return `"Pulling" effect is stronger.`},
            cost(){return new Decimal(1.5e6)},
            unlocked(){ 
                return hasUpgrade("g",21)
            },
            canAfford(){return player.g.points.gte(1.5e6)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1.5e6)},
            tooltip(){return "0.025->0.04"}
        },
        23:{
            title:"Cosmic wave",
            description(){return `Boost force gain base based on genesis.`},
            cost(){return new Decimal(5e6)},
            unlocked(){ 
                return hasUpgrade("g",22)
            },
            canAfford(){return player.g.points.gte(5e6)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(5e6)},
            effect(){return player.g.points.add(1).log10().div(100).min(0.3)},
            effectDisplay(){return this.effect().eq(0.3)?`Currently:+0.30(Hard capped)`:`Currently:+${format(upgradeEffect("g",23))}`},
            tooltip(){return `log10(g+1)/100`}
        },
        24:{
            title:"Balanced gravity",
            description(){return `Divide "Gravitational field" price based on force.`},
            cost(){return new Decimal(1e7)},
            unlocked(){ 
                return hasUpgrade("g",23)
            },
            canAfford(){return player.g.points.gte(1e7)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e7)},
            effect(){return player.points.times(1e35).add(1).pow(0.2).max(1)},
            effectDisplay(){return `Currently:/${format(upgradeEffect("g",24))}`},
            tooltip(){return `(f*1e35+1)^0.2`}
        },
        25:{
            title:"Quantum tunnel",
            description(){return `Unlock new buyables.`},
            cost(){return new Decimal(1e8)},
            unlocked(){ 
                return hasUpgrade("g",24)||hasUpgrade("g",25)
            },
            canAfford(){return player.g.points.gte(1e8)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e8)},
        },
        31:{
            title:"Quantum float",
            description(){return `Unlock a new buyable.`},
            cost(){return new Decimal(1e12)},
            unlocked(){ 
                return hasUpgrade("g",25)
            },
            canAfford(){return player.g.points.gte(1e12)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e12)},
        },
        32:{
            title:"Synergism power",
            description(){return `Boost genesis gain based on "Positive"s.`},
            cost(){return new Decimal(1e16)},
            unlocked(){ 
                return hasUpgrade("g",31)
            },
            canAfford(){return player.g.points.gte(1e16)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e16)},
            effect(){return getBuyableAmount("g",21).add(1).pow(2).div(10).max(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("g",32))}`},
            tooltip(){return `(n+1)^2/10`}
        },
        33:{
            title:"Quark",
            description(){return `Unlock a new layer.`},
            cost(){return new Decimal(1e20)},
            unlocked(){ 
                return hasUpgrade("g",32)
            },
            canAfford(){return player.g.points.gte(1e20)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e20)},
        },
        34:{
            title:"Quantum quark",
            description(){return `Unlock a new buyable.`},
            cost(){return new Decimal(1e38)},
            unlocked(){ 
                return hasUpgrade("g",33)&&hasMilestone("q",2)
            },
            canAfford(){return player.g.points.gte(1e38)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e38)},
        },
        35:{
            title:"Quantum quark II",
            description(){return `Unlock a new buyable.`},
            cost(){return new Decimal(1e65)},
            unlocked(){ 
                return hasUpgrade("g",34)&&hasMilestone("q",5)
            },
            canAfford(){return player.g.points.gte(1e65)&&player.points.gt("1e-39")},
            pay(){return player.g.points=player.g.points.minus(1e65)},
        },
    },
    buyables:{
        11:{
            title:"Gravitational field",
            cost(x) { return Decimal.pow(10,Decimal.pow(x,1.5)).div(hasUpgrade("g",24)?upgradeEffect("g",24):1).div(hasMilestone("q",1)?tmp.q.quarkboost[2]:1)},
            effect(x) { 
                base=new Decimal(3)
                if(hasUpgrade("p",24)) base=base.add(2)
                if(hasUpgrade("n",33)) base=base.add(1)
                return Decimal.pow(base,x.add(buyableEffect("g",22)))
            },
            display() { return ((hasUpgrade("q",23)||hasMilestone("a",0))?``:`Reset genesis,force,`+((hasUpgrade("q",14)||hasMilestone("a",0))?``:` and first 9 genesis upgrades`))+` to boost genesis and force gain.
                                Next at: ${format(this.cost())} genesis
                                Amount: ${format(getBuyableAmount("g",11))}
                                Effect: x${format(this.effect())}` },
            canAfford() { return player.g.points.gte(this.cost())&&this.unlocked()&&player.points.gte("1e-39") },
            buy(){
                if(!tmp.g.buyables[11].canAfford) return
                if(!(hasUpgrade("q",14)||hasMilestone("a",0))) player.g.upgrades = player.g.upgrades.filter(item => item > "24")
                if(!(hasUpgrade("q",23)||hasMilestone("p",0)||hasMilestone("a",0))){
                    player.g.points=new Decimal(0)
                    player.points=new Decimal("1e-39")
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.g.buyables[11].canAfford) return
                let tb = player.g.points.max(1).times(hasMilestone("q",1)?tmp.q.quarkboost[2]:1).times(hasUpgrade("g",24)?upgradeEffect("g",24):1).log10().root(1.5)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",15)||getBuyableAmount("g",11).gt(0)},
            style:{"height":"250px","width":"250px","font-size":"15px","border-radius":"1%","border":"10 px solid","background-color"(){return tmp.g.buyables[11].canAfford? "#DDDDDD25":"#000000"},"border-color":"#DDDDDD","color":"#DDDDDD"}
        },
        21:{
            title:"Positive",
            cost(x) { return Decimal.pow(10,Decimal.pow(x.add(1),(hasMilestone("p",0)?1.1:1.25))).times("8e-32")},
            effect(x) { 
                let base=new Decimal(5)
                if(hasUpgrade("q",11)) base=base.add(1.5)
                return Decimal.pow(base,x)
            },
            display() { return `Boost force gain.
                                Cost: ${format(this.cost())} force
                                Amount: ${format(getBuyableAmount("g",21))}
                                Effect: x${format(this.effect())}` },
            canAfford() { return player.points.gt(this.cost())&&this.unlocked()&&(player.g.purchaseleft!=0)},
            buy(){
                if(inChallenge("n",22)) player.g.purchaseleft--; 
                if(!tmp.g.buyables[21].canAfford) return
                if(!(hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))) player.points=player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.g.buyables[21].canAfford) return
                let tb = player.points.max(1).times(1e30).log10().root(1.25).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",25)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%"}
        },
        22:{
            title:"Vanish",
            cost(x) { return Decimal.pow(1000,x.pow(1.5)).times("1e-25") },
            effect(x) { 
                base=new Decimal(0.5)
                if(hasMilestone("p",1)) base=base.add(0.1)
                if(hasUpgrade("a",12)) base=base.add(0.2)
                return this.unlocked()? x.times(base):new Decimal(0)
            },
            display() { return `Give free "Gravitational field"s.
                                Cost: ${format(this.cost())} force
                                Amount: ${format(getBuyableAmount("g",22))}
                                Effect: +${format(this.effect())}` },
            canAfford() { return player.points.gt(this.cost())&&this.unlocked()&&(player.g.purchaseleft!=0)},
            buy(){
                if(inChallenge("n",22)) player.g.purchaseleft--;
                if(!tmp.g.buyables[22].canAfford) return
                if(!(hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))) player.points=player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.g.buyables[22].canAfford) return
                let tb = player.points.max(1).times(1e25).log(1000).root(1.5).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",31)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%"}
        },
        23:{
            title:"Negative",
            cost(x) { return Decimal.pow(1.5,x.add(1).pow(2)).times("8e-29") },
            effect(x) {
                let base=new Decimal(3)
                if(hasUpgrade("q",12)) base=base.add(1.5)
                if(hasUpgrade("a",11)) base=base.add(2)
                if(inChallenge("n",11)) base=new Decimal(1)
                return Decimal.pow(base,x)
            },
            display() { return `Boost genesis gain.
                                Cost: ${format(this.cost())} force
                                Amount: ${format(getBuyableAmount("g",23))}
                                Effect: x${format(this.effect())}` },
            canAfford() { return player.points.gt(this.cost())&&this.unlocked()&&(player.g.purchaseleft!=0)},
            buy(){
                if(inChallenge("n",22)) player.g.purchaseleft--;
                if(!tmp.g.buyables[23].canAfford) return
                if(!(hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))) player.points=player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.g.buyables[23].canAfford) return
                let tb = player.points.max(1).times(1e28).log(1.5).sqrt().sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",25)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%"}
        },
        31:{
            title:"Inflation",
            cost(x) { return Decimal.pow(15,x.add(1)).pow(0.8).times(1000) },
            effect(x) { return Decimal.pow((inChallenge("n",21) ? new Decimal(1) : x.add(1).log10().add(2)),x)},
            display() { return `Boost first 3 types of quarks gain.
                                Cost: ${format(this.cost())} force
                                Amount: ${format(getBuyableAmount("g",31))}/100
                                Effect: x${format(this.effect())}` },
            canAfford() { return player.points.gt(this.cost())&&this.unlocked()&&(player.g.purchaseleft!=0)},
            purchaseLimit:100,
            buy(){
                if(inChallenge("n",22)) player.g.purchaseleft--;
                if(!tmp.g.buyables[31].canAfford) return
                if(!(hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))) player.points=player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1).min(100))
            },
            buyMax() {
                if(!tmp.g.buyables[31].canAfford) return
                let tb = player.points.max(1).div(1000).sqrt().log(15).pow(1.25).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",34)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        32:{
            title:"Massive field",
            cost(x) { return Decimal.pow(20,x.add(1).pow(1.25)).times(1e20) },
            effect(x) {return Decimal.pow(x.add(1).log10().add(1.75),x)},
            display() { return `Boost last 3 types of quarks gain.
                                Cost: ${format(this.cost())} force
                                Amount: ${format(getBuyableAmount("g",32))}
                                Effect: x${format(this.effect())}` },
            canAfford() { return player.points.gt(this.cost())&&this.unlocked()&&(player.g.purchaseleft!=0)},
            buy(){
                if(inChallenge("n",22)) player.g.purchaseleft--;
                if(!tmp.g.buyables[32].canAfford) return
                if(!(hasUpgrade("q",33)||hasMilestone("p",0)||hasMilestone("a",0))) player.points=player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.g.buyables[32].canAfford) return
                let tb = player.points.max(1).div(1e20).log(20).root(1.25).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasUpgrade("g",35)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
    },
}),
addLayer("q", {
    name: "quark", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        upquark: new Decimal(0),
        downquark: new Decimal(0),
        strangequark: new Decimal(0),
        charmquark: new Decimal(0),
        topquark: new Decimal(0),
        bottomquark: new Decimal(0),
    }},
    color:"rgb(175, 50, 50)",
    requires: new Decimal("1e-13"), // Can be a function that takes requirement increases into account
    resource: "quark", // Name of prestige currency
    baseResource: "force", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        let exp=0.1
        if(hasUpgrade("n",34)) exp+=0.01
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasMilestone("q",3)) mult=mult.times(tmp.q.quarkboost[4])
        if(hasUpgrade("q",25)) mult=mult.times(upgradeEffect("q",25))
        if(hasUpgrade("q",42)) mult=mult.times(upgradeEffect("q",42))
        if(hasUpgrade("p",12)) mult=mult.times(upgradeEffect("p",12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if(player.e.ischarge2) exp=exp.times(tmp.e.chargeeff[2])
        if(hasChallenge("n",21)) exp=exp.times(1.05)
        if(player.a.unlocked) exp=exp.times(buyableEffect("a",13))
        if(inChallenge("n",21)) exp=exp.times(0.1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("g",33)||player.q.unlocked},
    branches:["g"],
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("p",2)) keep.push("upgrades")
        if(hasMilestone("p",6)) keep.push("milestones")
        if (layers[resettingLayer].row > this.row) {
            if(!hasMilestone("p",6)) player.subtabs.q.mainTabs="Main"
            layerDataReset("q", keep)
        }
    },
    passiveGeneration(){return (hasMilestone("p",5)&&(!inChallenge("n",31)))?1:0},
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(175,50,50);text-shadow:0 0 10px rgb(175,50,50)">${format(player.q.points)}</h2> quark, boost force gain by <h2 style="color:rgb(175,50,50);text-shadow:0 0 10px rgb(175,50,50)">${format(tmp.q.calcqboost)}</h2>`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                "milestones",
                "upgrades",
            ]
        },
        "Quarks":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(175,50,50);text-shadow:0 0 10px rgb(175,50,50)">${format(player.q.points)}</h2> quark, boost force gain by <h2 style="color:rgb(175,50,50);text-shadow:0 0 10px rgb(175,50,50)">${format(tmp.q.calcqboost)}</h2>`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",function() { return `You have <b style="color:red">${format(player.q.upquark)}</b>(+${format(tmp.q.quarkgen[1])}/s) upquark, boost genesis gain by ${format(tmp.q.quarkboost[1])}`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `You have <b style="color:orange">${format(player.q.downquark)}</b>(+${format(tmp.q.quarkgen[2])}/s) downquark, "Gravitational Field" price is divided by ${format(tmp.q.quarkboost[2])}`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `You have <b style="color:yellow">${format(player.q.strangequark)}</b>(+${format(tmp.q.quarkgen[3])}/s) strangequark, "Strong force" effect is boosted by ${format(tmp.q.quarkboost[3])}`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `You have <b style="color:green">${format(player.q.charmquark)}</b>(+${format(tmp.q.quarkgen[4])}/s) charmquark, boost quark gain by ${format(tmp.q.quarkboost[4])}`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `You have <b style="color:cyan">${format(player.q.topquark)}</b>(+${format(tmp.q.quarkgen[5])}/s) topquark, first 2 types of quark effect is boosted by x${format(tmp.q.quarkboost[5])}`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `You have <b style="color:violet">${format(player.q.bottomquark)}</b>(+${format(tmp.q.quarkgen[6])}/s) bottomquark, middle 2 types of quark effect is boosted by x${format(tmp.q.quarkboost[6])}`},{ "font-size":"15px"},],
                "blank",
            ],
            unlocked(){return hasMilestone("q",0)}
        },
    },
    update(diff){
        player.q.upquark=player.q.upquark.add(tmp.q.quarkgen[1].times(diff))
        player.q.downquark=player.q.downquark.add(tmp.q.quarkgen[2].times(diff))
        player.q.strangequark=player.q.strangequark.add(tmp.q.quarkgen[3].times(diff))
        player.q.charmquark=player.q.charmquark.add(tmp.q.quarkgen[4].times(diff))
        player.q.topquark=player.q.topquark.add(tmp.q.quarkgen[5].times(diff))
        player.q.bottomquark=player.q.bottomquark.add(tmp.q.quarkgen[6].times(diff))
    },
    calcqboost(){
        base=new Decimal(11)
        if(hasUpgrade("p",15)) base=base.add(1)
        return Decimal.pow(base,player.q.points.add(1).log10()).pow(2)
    },
    quarkgen(){
        upgen=new Decimal(0)
        downgen=new Decimal(0)
        strangegen=new Decimal(0)
        charmgen=new Decimal(0)
        topgen=new Decimal(0)
        bottomgen=new Decimal(0)
        if(hasMilestone("q",0)){
            upgen=player.q.points.pow(0.6667)
            if(hasUpgrade("q",13)) upgen=upgen.times(upgradeEffect("q",13))
            if(hasUpgrade("q",35)) upgen=upgen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) upgen=upgen.times(upgradeEffect("p",14))
            upgen=upgen.times(buyableEffect("g",31))
            if(hasMilestone("p",1)) upgen=upgen.pow(1.25)
        }
        if(hasMilestone("q",1)){
            downgen=player.q.points.pow(0.3333)
            if(hasUpgrade("q",15)) downgen=downgen.times(upgradeEffect("q",15))
            if(hasUpgrade("q",35)) downgen=downgen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) downgen=downgen.times(upgradeEffect("p",14))
            downgen=downgen.times(buyableEffect("g",31))
            if(hasMilestone("p",1)) downgen=downgen.pow(1.25)
        }
        if(hasMilestone("q",2)){
            strangegen=upgen.pow(0.25)
            if(hasUpgrade("q",21)) strangegen=strangegen.times(upgradeEffect("q",21))
            if(hasUpgrade("q",35)) strangegen=strangegen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) strangegen=strangegen.times(upgradeEffect("p",14))
            strangegen=strangegen.times(buyableEffect("g",31))
            if(hasMilestone("p",1)) strangegen=strangegen.pow(1.25)
        }
        if(hasMilestone("q",3)){
            charmgen=downgen.pow(0.25)
            if(hasUpgrade("q",24)) charmgen=charmgen.times(upgradeEffect("q",24))
            if(hasUpgrade("q",35)) charmgen=charmgen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) charmgen=charmgen.times(upgradeEffect("p",14))
            charmgen=charmgen.times(buyableEffect("g",32))
            if(hasMilestone("p",1)) charmgen=charmgen.pow(1.25)
        }
        if(hasMilestone("q",4)){
            topgen=strangegen.pow(0.1)
            if(hasUpgrade("q",32)) topgen=topgen.times(upgradeEffect("q",32))
            if(hasUpgrade("q",35)) topgen=topgen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) topgen=topgen.times(upgradeEffect("p",14))
            topgen=topgen.times(buyableEffect("g",32))
            if(hasMilestone("p",1)) topgen=topgen.pow(1.25)
        }
        if(hasMilestone("q",5)){
            bottomgen=charmgen.pow(0.1)
            if(hasUpgrade("q",34)) bottomgen=bottomgen.times(upgradeEffect("q",34))
            if(hasUpgrade("q",35)) bottomgen=bottomgen.times(upgradeEffect("q",35))
            if(hasUpgrade("p",14)) bottomgen=bottomgen.times(upgradeEffect("p",14))
            bottomgen=bottomgen.times(buyableEffect("g",32))
            if(hasMilestone("p",1)) bottomgen=bottomgen.pow(1.25)
        }
        return [null,upgen,downgen,strangegen,charmgen,topgen,bottomgen]
    },
    quarkboost(){
        upboost=new Decimal(1)
        downboost=new Decimal(1)
        strangeboost=new Decimal(1)
        charmboost=new Decimal(1)
        topboost=new Decimal(1)
        bottomboost=new Decimal(1)
        if(hasMilestone("q",4)){
            topboost=player.q.topquark.add(1).log10().pow(3).div(100).add(1)
            if(hasUpgrade("a",33)) topboost=topboost.pow(upgradeEffect("a",33))
        }
        if(hasMilestone("q",5)){
            bottomboost=player.q.bottomquark.add(1).log10().pow(2).div(100).add(1)
        }
        if(hasMilestone("q",0)){
            upboost=Decimal.pow(3,player.q.upquark.add(1).log10())
            if(hasMilestone("q",4)) upboost=upboost.times(topboost)
        }
        if(hasMilestone("q",1)){
            downboost=player.q.downquark.add(1).pow(0.5)
            if(hasMilestone("q",4)) downboost=downboost.times(topboost)
        }
        if(hasMilestone("q",2)){
            strangeboost=Decimal.pow(1.5,player.q.strangequark.add(1).log10().pow(1.5))
            if(hasMilestone("q",5)) strangeboost=strangeboost.times(bottomboost)
        }
        if(hasMilestone("q",3)){
            charmboost=Decimal.pow(2,player.q.charmquark.add(1).log10().times(2))
            if(hasMilestone("q",5)) charmboost=charmboost.times(bottomboost)
            if(hasUpgrade("p",22)) charmboost=charmboost.pow(upgradeEffect("p",22))
        }
        
        return [null,upboost,downboost,strangeboost,charmboost,topboost,bottomboost]
    },
    upgrades:{
        11:{
            title:"Stronger Positive",
            description(){return `+1.5 to "Positive" base.`},
            cost(){return new Decimal(2)},
            unlocked(){ 
                return player.q.unlocked
            },
            canAfford(){return player.q.points.gte(2)},
            pay(){return player.q.points=player.q.points.minus(2)},
        },
        12:{
            title:"Stronger Negative",
            description(){return `+1.5 to "Negative" base.`},
            cost(){return new Decimal(2)},
            unlocked(){ 
                return player.q.unlocked
            },
            canAfford(){return player.q.points.gte(2)},
            pay(){return player.q.points=player.q.points.minus(2)},
        },
        13:{
            title:"Quark chain I",
            description(){return `Boost upquark gain based on quarks.`},
            cost(){return new Decimal(5)},
            unlocked(){ 
                return hasUpgrade("q",11)||hasUpgrade("q",12)
            },
            canAfford(){return player.q.points.gte(5)},
            pay(){return player.q.points=player.q.points.minus(5)},
            effect(){return player.q.points.add(1).ln().pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(2):2).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",13))}`},
            tooltip(){return `ln(q+1)^${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(2)):2}+1`}
        },
        14:{
            title:"Quark QoL I",
            description(){return `"Gravitational field" doesn't reset upgrades any longer.`},
            cost(){return new Decimal(35)},
            unlocked(){ 
                return hasUpgrade("q",13)
            },
            canAfford(){return player.q.points.gte(35)},
            pay(){return player.q.points=player.q.points.minus(35)},
        },
        15:{
            title:"Quark chain II",
            description(){return `Boost downquark gain based on upquark.`},
            cost(){return new Decimal(35)},
            unlocked(){ 
                return hasUpgrade("q",13)
            },
            canAfford(){return player.q.points.gte(35)},
            pay(){return player.q.points=player.q.points.minus(35)},
            effect(){return Decimal.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(1.1):1.1,player.q.upquark.add(1).ln())},
            effectDisplay(){return `x${format(upgradeEffect("q",15))}`},
            tooltip(){return `${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(1.1)):1.1}^(ln(uq+1))`}
        },
        21:{
            title:"Quark chain III",
            description(){return `Boost strangequark gain based on downquark.`},
            cost(){return new Decimal(400)},
            unlocked(){ 
                return hasUpgrade("q",14)||hasUpgrade("q",15)
            },
            canAfford(){return player.q.points.gte(400)},
            pay(){return player.q.points=player.q.points.minus(400)},
            effect(){return Decimal.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(1.08):1.08,player.q.downquark.add(1).ln())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",21))}`},
            tooltip(){return `${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(1.08)):1.08}^(ln(dq+1))`}
        },
        22:{
            title:"Quark Qol II",
            description(){return `Keep genesis upgrades on reset.`},
            cost(){return new Decimal(300)},
            unlocked(){ 
                return hasUpgrade("q",14)||hasUpgrade("q",15)
            },
            canAfford(){return player.q.points.gte(300)},
            pay(){return player.q.points=player.q.points.minus(300)},
        },
        23:{
            title:"Quark Qol III",
            description(){return `Auto reset "Gravitational field"s, "Gravitational field" resets nothing.`},
            cost(){return new Decimal(20000)},
            unlocked(){ 
                return hasUpgrade("q",21)||hasUpgrade("q",22)
            },
            canAfford(){return player.q.points.gte(20000)},
            pay(){return player.q.points=player.q.points.minus(20000)},
        },
        24:{
            title:"Quark chain IV",
            description(){return `Boost charmquark gain based on strangequark.`},
            cost(){return new Decimal(3e5)},
            unlocked(){ 
                return hasUpgrade("q",21)||hasUpgrade("q",22)
            },
            canAfford(){return player.q.points.gte(3e5)},
            pay(){return player.q.points=player.q.points.minus(3e5)},
            effect(){return Decimal.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(1.06):1.06,player.q.strangequark.add(1).ln())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",24))}`},
            tooltip(){return `${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(1.06)):1.06}^(ln(sq+1))`}
        },
        25:{
            title:"Genesis chain",
            description(){return `Boost genesis and quark gain based on genesis.`},
            cost(){return new Decimal(1e6)},
            unlocked(){ 
                return hasUpgrade("q",23)&&hasUpgrade("q",24)
            },
            canAfford(){return player.q.points.gte(1e6)},
            pay(){return player.q.points=player.q.points.minus(1e6)},
            effect(){return player.g.points.add(1).ln().pow(3).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",25))}`},
            tooltip(){return `ln(g+1)^3+1`}
        },
        31:{
            title:"Quark Qol IV",
            description(){return `Auto generate genesis based on quark.`},
            cost(){return new Decimal(1e6)},
            unlocked(){ 
                return hasUpgrade("q",25)
            },
            canAfford(){return player.q.points.gte(1e6)},
            pay(){return player.q.points=player.q.points.minus(1e6)},
            effect(){return player.q.points.add(1).log10().div(10).min(50).add(hasMilestone("p",4)?0.05:0)},
            effectDisplay(){return `Currently:${format(upgradeEffect("q",31).times(100))}%`},
            tooltip(){return `log10(q+1)/10`}
        },
        32:{
            title:"Quark chain V",
            description(){return `Boost topquark gain based on charmquark.`},
            cost(){return new Decimal(1e15)},
            unlocked(){ 
                return hasUpgrade("q",31)
            },
            canAfford(){return player.q.points.gte(1e15)},
            pay(){return player.q.points=player.q.points.minus(1e15)},
            effect(){return Decimal.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(1.04):1.04,player.q.charmquark.add(1).ln())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",32))}`},
            tooltip(){return `${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(1.04)):1.04}^(ln(cq+1))`}
        },
        33:{
            title:"Quark Qol V",
            description(){return `Auto buy genesis buyables, genesis buyables no longer reduce force.`},
            cost(){return new Decimal(1e15)},
            unlocked(){ 
                return hasUpgrade("q",31)
            },
            canAfford(){return player.q.points.gte(1e15)},
            pay(){return player.q.points=player.q.points.minus(1e15)},
        },
        34:{
            title:"Quark chain VI",
            description(){return `Boost bottomquark gain based on topquark.`},
            cost(){return new Decimal(3e16)},
            unlocked(){ 
                return hasUpgrade("q",32)&&hasUpgrade("q",33)
            },
            canAfford(){return player.q.points.gte(3e16)},
            pay(){return player.q.points=player.q.points.minus(3e16)},
            effect(){return Decimal.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(1.02):1.02,player.q.topquark.add(1).ln())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",34))}`},
            tooltip(){return `${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(1.02)):1.02}^(ln(tq+1))`}
        },
        35:{
            title:"Quark chain VII",
            description(){return `Boost all type of quark gain based on force.`},
            cost(){return new Decimal(1e17)},
            unlocked(){ 
                return hasUpgrade("q",34)
            },
            canAfford(){return player.q.points.gte(1e17)},
            pay(){return player.q.points=player.q.points.minus(1e17)},
            effect(){return player.points.pow(hasUpgrade("p",23)?upgradeEffect("p",23).add(2):2).add(1).ln().add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",35))}`},
            tooltip(){return `ln(f^${hasUpgrade("p",23)?format(upgradeEffect("p",23).add(2)):2}+1)+1`}
        },
        41:{
            title:"Proton",
            description(){return `Unlock a new layer.`},
            cost(){return new Decimal(1e20)},
            unlocked(){ 
                return hasUpgrade("q",35)
            },
            canAfford(){return player.q.points.gte(1e20)},
            pay(){return player.q.points=player.q.points.minus(1e20)},
        },
        42:{
            title:"Quark defense",
            description(){return `Boost quark gain based on itself.`},
            cost(){return new Decimal(1e34)},
            unlocked(){ 
                return hasMilestone("p",3)
            },
            canAfford(){return player.q.points.gte(1e34)},
            pay(){return player.q.points=player.q.points.minus(1e34)},
            effect(){return player.q.points.pow(0.02).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",42))}`},
            tooltip(){return `q^0.02+1`}
        },
        43:{
            title:"Quark pulling",
            description(){return `"Pulling" affects genesis gain with a weaker effect.`},
            cost(){return new Decimal(1e35)},
            unlocked(){ 
                return hasMilestone("p",3)
            },
            canAfford(){return player.q.points.gte(1e35)},
            pay(){return player.q.points=player.q.points.minus(1e35)},
            effect(){return upgradeEffect("g",13).pow(0.25)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("q",43))}`},
            tooltip(){return `eff^0.25`}
        },
        44:{
            title:"More crunching",
            description(){return `+0.1 to genesis gain base.`},
            cost(){return new Decimal(1e36)},
            unlocked(){ 
                return hasMilestone("p",3)
            },
            canAfford(){return player.q.points.gte(1e36)},
            pay(){return player.q.points=player.q.points.minus(1e36)},
        },
        45:{
            title:"Electron",
            description(){return `Unlock a new layer.`},
            cost(){return new Decimal(1e48)},
            unlocked(){ 
                return hasMilestone("p",3)
            },
            canAfford(){return player.q.points.gte(1e48)},
            pay(){return player.q.points=player.q.points.minus(1e48)},
        },
    },
    milestones:{
        0: {
            requirementDescription: "1 quark & 1e-13 force",
            done() { return player.q.points.gte(1)&&player.points.gte("1e-13")},
            effectDescription: "Start to generate upquarks.",
        },
        1: {
            requirementDescription: "3 quark & 1e-9 force",
            done() { return player.q.points.gte(3)&&player.points.gte("1e-9")},
            effectDescription: "Start to generate downquarks.",
        },
        2: {
            requirementDescription: "75 quark & 1e7 force",
            done() { return player.q.points.gte(75)&&player.points.gte(1e7)},
            effectDescription: "Start to generate strangequarks.",
        },
        3: {
            requirementDescription: "500 quark & 1e10 force",
            done() { return player.q.points.gte(500)&&player.points.gte(1e10)},
            effectDescription: "Start to generate charmquarks.",
        },
        4: {
            requirementDescription: "1e14 quark & 1e25 force",
            done() { return player.q.points.gte(1e14)&&player.points.gte(1e25)},
            effectDescription: "Start to generate topquarks.",
        },
        5: {
            requirementDescription: "1e16 quark & 1e26 force",
            done() { return player.q.points.gte(1e16)&&player.points.gte(1e26)},
            effectDescription: "Start to generate bottomquarks.",
        },
    }
}),
addLayer("p", {
    name: "proton", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color:"rgb(0, 60, 235)",
    requires: new Decimal(1e20), // Can be a function that takes requirement increases into account
    resource: "proton", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.04, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("p",21)) mult=mult.times(2)
        if(hasUpgrade("p",25)) mult=mult.times(upgradeEffect("p",25))
        if(hasUpgrade("p",33)) mult=mult.times(upgradeEffect("p",33))
        if(hasUpgrade("p",43)) mult=mult.times(upgradeEffect("p",43))
        if(hasUpgrade("n",23)) mult=mult.times(upgradeEffect("n",23))
        if(hasUpgrade("p",44)) mult=mult.times(upgradeEffect("p",44))
        if(hasMilestone("a",0)) mult=mult.times(10)
        if(hasChallenge("n",11)) mult=mult.times(10)
        if(hasChallenge("n",12)) mult=mult.times(25)
        if(hasChallenge("n",21)) mult=mult.times(100)
        if(player.a.unlocked) mult=mult.times(tmp.a.getatomboost)
        if(hasUpgrade("a",23)) mult=mult.times(upgradeEffect("a",23))
        if(hasUpgrade("a",35)) mult=mult.times(upgradeEffect("a",35))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp=new Decimal(1)
        if(player.e.ischarge4) exp=exp.times(tmp.e.chargeeff[4])
        if(hasChallenge("n",22)) exp=exp.times(1.05)
        if(player.a.unlocked) exp=exp.times(buyableEffect("a",21))
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for protons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("q",41)||player.p.unlocked},
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("a",1)) keep.push("upgrades")
        if(hasMilestone("a",5)) keep.push("milestones")
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("p", keep)
        }
    },
    branches:["q"],
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(0,60,235);text-shadow:0 0 10px rgb(0,60,235)">${format(player.p.points)}</h2> proton.`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                "upgrades",
            ]
        },
        "Milestones":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(0,60,235);text-shadow:0 0 10px rgb(0,60,235)">${format(player.p.points)}</h2> proton.`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                "milestones"
            ],
        },
    },
    passiveGeneration(){return hasMilestone("a",5)?1:0},
    update(diff){
    },
    upgrades:{
        11:{
            title:"Softcap delayer",
            description(){return `Force softcap starts at 1 instead of 1e-13.`},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return player.p.unlocked
            },
            canAfford(){return player.p.points.gte(1)},
            pay(){return player.p.points=player.p.points.minus(1)},
        },
        12:{
            title:"Proton boost I",
            description(){return `Boost quark gain based on proton.`},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return hasUpgrade("p",11)
            },
            canAfford(){return player.p.points.gte(1)},
            pay(){return player.p.points=player.p.points.minus(1)},
            effect(){return Decimal.pow(1.2,player.p.points.add(1).times(10).ln().times(1.5))},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",12))}`},
            tooltip(){return `1.2^(ln((p+1)*10)*1.5)`}
        },
        13:{
            title:"Proton boost II",
            description(){return `Boost genesis gain based on proton.`},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return hasUpgrade("p",11)
            },
            canAfford(){return player.p.points.gte(1)},
            pay(){return player.p.points=player.p.points.minus(1)},
            effect(){return Decimal.pow(2,player.p.points.add(1).times(10).log10())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",13))}`},
            tooltip(){return `2^(log10((p+1)*10))`}
        },
        14:{
            title:"Proton boost III",
            description(){return `Boost 6 types of quark gain based on proton.`},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return hasUpgrade("p",11)
            },
            canAfford(){return player.p.points.gte(1)},
            pay(){return player.p.points=player.p.points.minus(1)},
            effect(){return player.p.points.add(1).times(10).pow(0.4)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",14))}`},
            tooltip(){return `((p+1)*10)^0.4`}
        },
        15:{
            title:"Proton boost IV",
            description(){return `Quark boost base +1.`},
            cost(){return new Decimal(3)},
            unlocked(){ 
                return hasUpgrade("p",12)&&hasUpgrade("p",13)&&hasUpgrade("p",14)
            },
            canAfford(){return player.p.points.gte(3)},
            pay(){return player.p.points=player.p.points.minus(3)},
        },
        21:{
            title:"Multiple proton",
            description(){return `Double proton gain.`},
            cost(){return new Decimal(5)},
            unlocked(){ 
                return hasUpgrade("p",15)
            },
            canAfford(){return player.p.points.gte(5)},
            pay(){return player.p.points=player.p.points.minus(5)},
        },
        22:{
            title:"Multiple quarks",
            description(){return `Charmquark effect is raised to an exponent based on proton.`},
            cost(){return new Decimal(15)},
            unlocked(){
                return hasUpgrade("p",21)
            },
            canAfford(){return player.p.points.gte(15)},
            pay(){return player.p.points=player.p.points.minus(15)},
            effect(){return player.p.points.add(1).log10().div(20).add(1).min(2.67)},
            effectDisplay(){return this.effect().gte(2.67)?`Currently:^2.67(capped)`:`Currently:^${format(upgradeEffect("p",22))}`},
            tooltip(){return `log10(p+1)/25+1`}
        },
        23:{
            title:"Quark chain X",
            description(){return `Add to all quark chain's base based on proton.`},
            cost(){return new Decimal(15)},
            unlocked(){
                return hasUpgrade("p",21)
            },
            canAfford(){return player.p.points.gte(15)},
            pay(){return player.p.points=player.p.points.minus(15)},
            effect(){return player.p.points.add(1).log10().div(500).min(0.02)},
            effectDisplay(){return this.effect().gte(0.02)?`Currently:+0.02(capped)`:`Currently:+${format(upgradeEffect("p",23),3)}`},
            tooltip(){return `log10(p+1)/500`}
        },
        24:{
            title:"Stronger field",
            description(){return `Add 2 to "Gravatitional field" effect base.`},
            cost(){return new Decimal(15)},
            unlocked(){
                return hasUpgrade("p",21)
            },
            canAfford(){return player.p.points.gte(15)},
            pay(){return player.p.points=player.p.points.minus(15)},
        },
        25:{
            title:"Proton synergism",
            description(){return `Boost proton gain based on quark.`},
            cost(){return new Decimal(30)},
            unlocked(){
                return hasUpgrade("p",22)&&hasUpgrade("p",23)&&hasUpgrade("p",24)
            },
            canAfford(){return player.p.points.gte(30)},
            pay(){return player.p.points=player.p.points.minus(30)},
            effect(){return Decimal.pow(1.2,player.q.points.add(1).log10().sub(35).max(0))},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",25))}`},
            tooltip(){return `1.2^(log10(q+1)-35)`}
        },
        31:{
            title:"Softcap delayer II",
            description(){return `Force softcap is ^0.98 weaker.`},
            cost(){return new Decimal(10000)},
            unlocked(){
                return hasUpgrade("p",25)
            },
            canAfford(){return player.p.points.gte(10000)},
            pay(){return player.p.points=player.p.points.minus(10000)},
        },
        32:{
            title:"Lower energy requirement",
            description(){return `Divide electron price based on proton.`},
            cost(){return new Decimal(1e5)},
            unlocked(){
                return hasUpgrade("p",31)
            },
            canAfford(){return player.p.points.gte(1e5)},
            pay(){return player.p.points=player.p.points.minus(1e5)},
            effect(){return player.p.points.pow(0.5).add(1)},
            effectDisplay(){return `Currently:/${format(upgradeEffect("p",32))}`},
            tooltip(){return `p^0.5+1`}
        },
        33:{
            title:"The hidden proton",
            description(){return `Boost proton gain based on genesis.`},
            cost(){return new Decimal(1e7)},
            unlocked(){
                return hasUpgrade("p",32)
            },
            canAfford(){return player.p.points.gte(1e7)},
            pay(){return player.p.points=player.p.points.minus(1e7)},
            effect(){return player.g.points.add(1).log(hasUpgrade("a",27)?2:10).pow(0.5).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",33))}`},
            tooltip(){return `log(g+1)^0.5`}
        },
        34:{
            title:"New charges I",
            description(){return `Unlock 2 new charges.`},
            cost(){return new Decimal(3e10)},
            unlocked(){
                return hasUpgrade("p",33)
            },
            canAfford(){return player.p.points.gte(3e10)},
            pay(){return player.p.points=player.p.points.minus(3e10)},
        },
        35:{
            title:"Neutron",
            description(){return `Unlock a new layer.`},
            cost(){return new Decimal(1e13)},
            unlocked(){
                return hasUpgrade("p",34)
            },
            canAfford(){return player.p.points.gte(1e13)},
            pay(){return player.p.points=player.p.points.minus(1e13)},
        },
        41:{
            title:"Force reboot",
            description(){return `Boost force gain based on proton.`},
            cost(){return new Decimal(1e20)},
            unlocked(){
                return hasUpgrade("p",35)
            },
            canAfford(){return player.p.points.gte(1e20)},
            pay(){return player.p.points=player.p.points.minus(1e20)},
            effect(){return player.p.points.add(1).pow(2)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",41))}`},
            tooltip(){return `(p+1)^2`}
        },
        42:{
            title:"New charges II",
            description(){return `Unlock a new charge.`},
            cost(){return new Decimal(1e41)},
            unlocked(){
                return hasUpgrade("p",41)
            },
            canAfford(){return player.p.points.gte(1e41)},
            pay(){return player.p.points=player.p.points.minus(1e41)},
        },
        43:{
            title:"Proton quantum",
            description(){return `Boost proton gain based on "Vanish"s you have.`},
            cost(){return new Decimal(2e56)},
            unlocked(){
                return hasUpgrade("p",42)
            },
            canAfford(){return player.p.points.gte(2e56)},
            pay(){return player.p.points=player.p.points.minus(2e56)},
            effect(){return Decimal.pow(1.25,getBuyableAmount("g",22))},
            effectDisplay(){return `Currently:x${format(upgradeEffect("p",43))}`},
            tooltip(){return `1.25^v`}
        },
        44:{
            title:"Mixed proton",
            description(){return `Boost proton gain based on ME.`},
            cost(){return new Decimal(1e62)},
            unlocked(){
                return hasUpgrade("p",43)&&hasChallenge("n",22)
            },
            canAfford(){return player.p.points.gte(1e62)},
            pay(){return player.p.points=player.p.points.minus(1e62)},
            effect(){return Decimal.pow(5,player.n.mixpoints.pow(0.4)).min(1e50)},
            effectDisplay(){return `Currently:`+(this.effect().gte(1e50)?`x1.00e50<br>(Capped)`:`x${format(upgradeEffect("p",44))}`)},
            tooltip(){return `5^(me^0.4)`}
        },
        45:{
            title:"Rotation synergism I",
            description(){return `boost y based on x buyables.`},
            cost(){return new Decimal(1e64)},
            unlocked(){
                return hasUpgrade("p",44)&&hasChallenge("n",22)
            },
            canAfford(){return player.p.points.gte(1e64)},
            pay(){return player.p.points=player.p.points.minus(1e64)},
            effect(){return getBuyableAmount("n",11).div(50)},
            effectDisplay(){return `Currently:+${format(upgradeEffect("p",45))}`},
            tooltip(){return `x/50`}
        },
    },
    milestones:{
        0: {
            requirementDescription: "1 proton",
            done() { return player.p.points.gte(1)},
            effectDescription: `10x force gain, the exponent growth of "Positive" price is weaker.<br>Keep genesis automations.`,
        },
        1: {
            requirementDescription: "2 proton",
            done() { return player.p.points.gte(2)},
            effectDescription: `All types of quark gain is raised to ^1.25, add 0.1 to "Vanish" base.`,
        },
        2: {
            requirementDescription: "3 proton",
            done() { return player.p.points.gte(3)},
            effectDescription: `Keep quark upgrades on resets.`,
        },
        3: {
            requirementDescription: "10 proton",
            done() { return player.p.points.gte(10)},
            effectDescription: `Unlock more quark upgrades.`,
        },
        4: {
            requirementDescription: "20 proton",
            done() { return player.p.points.gte(20)},
            effectDescription: `Add 5% to the effect of "Quark Qol IV".`,
        },
        5: {
            requirementDescription: "100 proton",
            done() { return player.p.points.gte(100)},
            effectDescription: `Auto generate 100% of your quark on reset per second.`,
        },
        6: {
            requirementDescription: "2500 proton",
            done() { return player.p.points.gte(2500)},
            effectDescription: `Keep quark milestones.`,
        },
    }
}),
addLayer("e", {
    name: "electron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        maxcharge: 1,
        currentcharge: 0,
        ischarge1: false,
        ischarge2: false,
        ischarge3: false,
        ischarge4: false,
        ischarge5: false,
        ischarge6: false,
        ischarge7: false,
        style1: 0,
        style2: 0,
        style3: 0,
        style4: 0,
        style5: 0,
        style6: 0,
        style7: 0,
    }},
    color:"rgb(235, 225, 0)",
    requires: new Decimal(1e55), // Can be a function that takes requirement increases into account
    resource: "electron", // Name of prestige currency
    baseResource: "force", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){return 2}, // Prestige currency exponent
    base(){return 10},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("p",32)) mult=mult.div(upgradeEffect("p",32))
        if(hasUpgrade("n",42)) mult=mult.div(upgradeEffect("n",42))
        if(hasUpgrade("n",31)) mult=mult.div(1e25)
        if(player.e.ischarge5) mult=mult.div(tmp.e.chargeeff[5])
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if(player.a.unlocked) exp=exp.times(buyableEffect("a",22))
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for electron", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("q",45)||player.e.unlocked},
    autoPrestige(){return hasUpgrade("a",37)},
    branches:["q"],
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(235,225,0);text-shadow:0 0 10px rgb(235,225,0)">${format(player.e.points)}</h2> electron.`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",function() { return `Click on clickables above to charge/discharge them.<br>
                                                    Charge/Discharge anything force to do a electron reset.<br>
                                                    Current charge:${player.e.currentcharge}/${player.e.maxcharge}`}],
                "blank",
                "clickables",
            ]
        },
    },
    canBuyMax(){return hasMilestone("a",3)},
    resetsNothing(){return hasUpgrade("a",31)},
    chargeeff(){
        eff1=new Decimal(1)
        eff2=new Decimal(1)
        eff3=new Decimal(1)
        eff4=new Decimal(1)
        eff5=new Decimal(1)
        eff6=new Decimal(1)
        eff7=new Decimal(1)
        eff8=new Decimal(1)
        eff9=new Decimal(1)
        if(player.e.unlocked&&player.e.ischarge1){
            eff1=player.e.points.pow(0.5).div(25).add(1)
        }
        if(player.e.unlocked&&player.e.ischarge2){
            eff2=player.e.points.pow(0.3).div(33).add(1)
        }
        if(player.e.unlocked&&player.e.ischarge3){
            eff3=Decimal.pow(10,player.e.points.pow(1.2)).max(1)
        }
        if(player.e.unlocked&&player.e.ischarge4){
            eff4=player.e.points.pow(0.4).div(100).add(1)
        }
        if(player.e.unlocked&&player.e.ischarge5){
            eff5=player.e.points.pow(10).add(1)
            if(hasUpgrade("n",24)) eff5=eff5.pow(upgradeEffect("n",24))
        }
        if(player.e.unlocked&&player.e.ischarge6){
            eff6=Decimal.pow(5,player.e.points.pow(0.3)).max(1)
        }
        if(player.e.unlocked&&player.e.ischarge7){
            eff7=player.e.points.pow(2).div(99).add(1)
        }
        return [null,eff1,eff2,eff3,eff4,eff5,eff6,eff7,eff8,eff9]
    },
    curcharge(){
        cur=0
        if(player.e.ischarge1) cur++
        if(player.e.ischarge2) cur++
        if(player.e.ischarge3) cur++
        if(player.e.ischarge4) cur++
        if(player.e.ischarge5) cur++
        if(player.e.ischarge6) cur++
        if(player.e.ischarge7) cur++
        return cur
    },
    update(diff){
        player.e.currentcharge=tmp.e.curcharge
        player.e.style1=(player.e.style1+2)%130
        player.e.style2=(player.e.style2+2)%130
        player.e.style3=(player.e.style3+2)%130
        player.e.style4=(player.e.style4+2)%130
        player.e.style5=(player.e.style5+2)%130
        player.e.style6=(player.e.style6+2)%130
        player.e.style7=(player.e.style7+2)%130
        player.e.maxcharge=tmp.e.getmaxcharge
    },
    getmaxcharge(){
        let maxc=1
        if(hasUpgrade("n",13)) maxc=2
        if(hasUpgrade("n",43)) maxc=3
        if(hasUpgrade("a",28)) maxc=4
        return maxc
    },
    getchargestyle(){
        a="radial-gradient(#000000 "+(Math.abs(65-player.e.style1))+"%,#FFFFFF75 "+(Math.max(100-Math.abs(100-player.e.style1),35))+"%)"
        b="radial-gradient(#000000 "+(Math.abs(65-player.e.style2))+"%,rgba(175,50,50,0.3) "+(Math.max(100-Math.abs(100-player.e.style2),35))+"%)"
        c="radial-gradient(#000000 "+(Math.abs(65-player.e.style3))+"%,rgba(215, 215, 215, 0.3) "+(Math.max(100-Math.abs(100-player.e.style3),35))+"%)"
        d="radial-gradient(#000000 "+(Math.abs(65-player.e.style4))+"%,rgba(0,60,235,0.3) "+(Math.max(100-Math.abs(100-player.e.style4),35))+"%)"
        e="radial-gradient(#000000 "+(Math.abs(65-player.e.style5))+"%,rgba(235, 225, 0, 0.3) "+(Math.max(100-Math.abs(100-player.e.style5),35))+"%)"
        f="radial-gradient(#000000 "+(Math.abs(65-player.e.style6))+"%,rgba(225,0, 0, 0.3) "+(Math.max(100-Math.abs(100-player.e.style6),35))+"%)"
        g="radial-gradient(#000000 "+(Math.abs(65-player.e.style7))+("%,rgba("+Math.floor(player.n.mixcolorR)+","+Math.floor(player.n.mixcolorG)+","+Math.floor(player.n.mixcolorB)+",0.3)")+(Math.max(100-Math.abs(100-player.e.style7),35))+"%)"
        return [null,a,b,c,d,e,f,g]
    },
    clickables:{
        11:{
            display(){return `Charge electron into genesis<br>Genesis gain is raised to ^${format(tmp.e.chargeeff[1],3)}`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"#EEEEEE","color":"#EEEEEE","font-size":"15px",
                "background"(){
                    if(player.e.ischarge1) return tmp.e.getchargestyle[1]
                    if(player.e.currentcharge<player.e.maxcharge) return "#EEEEEE30"
                    return "#00000000"
                },
                "text-shadow"(){
                    if(player.e.ischarge1) return "0 0 2px black"
                    return ""
                }
            },
            unlocked(){return player.e.unlocked},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge1=!player.e.ischarge1
                player.e.style1=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge1)}
        },
        12:{
            display(){return `Charge electron into quark<br>Quark gain is raised to ^${format(tmp.e.chargeeff[2],3)}`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"rgb(175,50,50)","color":"rgb(175,50,50)","font-size":"15px",
                "background"(){
                    if(player.e.ischarge2) return tmp.e.getchargestyle[2]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba(175,50,50,0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return player.e.unlocked},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge2=!player.e.ischarge2
                player.e.style2=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge2)}
        },
        13:{
            display(){return `Charge electron into force<br>Force softcap starts x${format(tmp.e.chargeeff[3])} later.`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"rgb(215,215,215)","color":"rgb(215,215,215)","font-size":"15px",
                "background"(){
                    if(player.e.ischarge3) return tmp.e.getchargestyle[3]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba(215,215,215,0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return player.e.unlocked},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge3=!player.e.ischarge3
                player.e.style3=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge3)}
        },
        21:{
            display(){return `Charge electron into proton<br>Proton gain is raised to ^${format(tmp.e.chargeeff[4],3)}.`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"rgb(0,60,235)","color":"rgb(0,60,235)","font-size":"15px","margin-top":"10px",
                "background"(){
                    if(player.e.ischarge4) return tmp.e.getchargestyle[4]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba(0,60,235,0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return hasUpgrade("p",34)},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge4=!player.e.ischarge4
                player.e.style4=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge4)}
        },
        22:{
            display(){return `Charge electron into itself<br>Divide electron price by ${format(tmp.e.chargeeff[5])}.`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"rgb(235,225,0)","color":"rgb(235,225,0)","font-size":"15px","margin-top":"10px",
                "background"(){
                    if(player.e.ischarge5) return tmp.e.getchargestyle[5]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba(235,225,0,0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return hasUpgrade("p",34)},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge5=!player.e.ischarge5
                player.e.style5=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge5)}
        },
        23:{
            display(){return `Charge electron into neutron<br>Boost NE gain by x${format(tmp.e.chargeeff[6])}.`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color":"rgb(225,0,0)","color":"rgb(225,0,0)","font-size":"15px","margin-top":"10px",
                "background"(){
                    if(player.e.ischarge6) return tmp.e.getchargestyle[6]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba(225,0,0,0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return hasUpgrade("p",42)},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge6=!player.e.ischarge6
                player.e.style6=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge6)}
        },
        31:{
            display(){return `Charge electron into mix energy<br>Boost ME gain by x${format(tmp.e.chargeeff[7])}.`},
            style:{"height":"150px","width":"150px","border-radius":"5%","border-size":"6px","border-color"(){return player.n.mixcolor},"color"(){return player.n.mixcolor},"font-size":"15px","margin-top":"10px",
                "background"(){
                    if(player.e.ischarge7) return tmp.e.getchargestyle[7]
                    if(player.e.currentcharge<player.e.maxcharge) return "rgba("+Math.floor(player.n.mixcolorR)+","+Math.floor(player.n.mixcolorG)+","+Math.floor(player.n.mixcolorB)+",0.3)"
                    return "#00000000"
                }
            },
            unlocked(){return hasMilestone("a",4)},
            onClick(){
                doReset("e",force=true)
                player.e.ischarge7=!player.e.ischarge7
                player.e.style7=0
            },
            canClick(){return (player.e.currentcharge<player.e.maxcharge)||(player.e.ischarge7)}
        },
    }
}),
addLayer("n", {
    name: "neutron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        mixpoints: new Decimal(0),
        mixcolor: "",
        mixcolorR: 0,
        mixcolorG: 60,
        mixcolorB: 235,
        state1: true,
        state2: false,
        state3: false,
    }},
    color:"rgb(225,0,0)",
    requires: new Decimal(1e120), // Can be a function that takes requirement increases into account
    resource: "neutron energy", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.05, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("n",11)) mult=mult.times(2)
        if(hasUpgrade("n",22)) mult=mult.times(upgradeEffect("n",22))
        if(hasUpgrade("n",32)) mult=mult.times(75)
        if(hasUpgrade("n",41)) mult=mult.times(upgradeEffect("n",41))
        if(hasMilestone("a",1)) mult=mult.times(100)
        if(player.e.ischarge6) mult=mult.times(tmp.e.chargeeff[6])
        if(player.a.unlocked) mult=mult.times(tmp.a.getatomboost)
        if(hasUpgrade("a",26)) mult=mult.times(upgradeEffect("a",26))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp=new Decimal(1)
        if(player.a.unlocked) exp=exp.times(buyableEffect("a",23))
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("p",35)||player.a.unlocked},
    branches:["q"],
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("a",2)) keep.push("challenges")
        if(hasUpgrade("a",22)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("n", keep)
        }
    },
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(225,0,0);text-shadow:0 0 10px rgb(225,0,0)">${format(player.n.points)}</h2> neutron energy(+${format(tmp.n.getnegen)}/s,starts at 1.00e120 quark).`},{ "font-size":"15px"},],
                "blank",
                "upgrades",
            ]
        },
        "Challenges":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(225,0,0);text-shadow:0 0 10px rgb(225,0,0)">${format(player.n.points)}</h2> neutron energy(+${format(tmp.n.getnegen)}/s,starts at 1.00e120 quark).`},{ "font-size":"15px"},],
                "blank",
                "challenges"
            ],
            unlocked(){return hasUpgrade("n",15)||player.a.unlocked},
        },
        "Mix energy":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:${player.n.mixcolor};text-shadow:0 0 10px ${player.n.mixcolor}">${format(player.n.mixpoints)}</h2> mixed energy.`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `ME gain formula: <math xmlns="http://www.w3.org/1998/Math/MathML" display="block" style="font-size:25px"><mo stretchy="false">(</mo><mo stretchy="false">(</mo><mi>l</mi><mi>o</mi><mi>g</mi><mn>10</mn><mo stretchy="false">(</mo><mrow><mfrac><mrow><mi>p</mi><mo>+</mo><mn>1</mn></mrow><mrow><mn>1</mn><mi>e</mi><mn>60</mn></mrow></mfrac></mrow><mo stretchy="false">)</mo><msup><mo stretchy="false">)</mo><mi style="color:rgb(0,60,235)">x</mi></msup><mo>+</mo><mo stretchy="false">(</mo><mi>l</mi><mi>o</mi><mi>g</mi><mn>10</mn><mo stretchy="false">(</mo><mrow><mfrac><mrow><mi>n</mi><mi>e</mi><mo>+</mo><mn>1</mn></mrow><mrow><mn>1</mn><mi>e</mi><mn>10</mn></mrow></mfrac></mrow><mo stretchy="false">)</mo><msup><mo stretchy="false">)</mo><mi style="color:rgb(225,0,0)">y</mi></msup><msup><mo stretchy="false">)</mo><mrow><mi>l</mi><mi>o</mi><mi>g</mi><mn>10</mn><mo stretchy="false">(</mo><mi>e</mi><mo>-</mo><mn>4</mn><msup><mo stretchy="false">)</mo><mi style="color:rgb(235,225,0)">z</mi></msup></mrow></msup><mo>-</mo><mn>2</mn></math>`}],
                "blank",
                ["display-text",function() { return `<b style="color:rgb(0,60,235);font-family:MS serif">x</b>=<b style="text-shadow:0 0 10px rgb(255,255,255);font-family:MS serif"">${format(tmp.n.getmixenergy[1])}</b>  <b style="color:rgb(225,0,0);font-family:MS serif"">y</b>=<b style="text-shadow:0 0 10px rgb(255,255,255);font-family:MS serif"">${format(tmp.n.getmixenergy[2])}</b>  <b style="color:rgb(235,225,0);font-family:MS serif"">z</b>=<b style="text-shadow:0 0 10px rgb(255,255,255);font-family:MS serif"">${format(tmp.n.getmixenergy[3])}</b>`},{ "font-size":"25px" }],
                "blank",
                "buyables",
            ],
            unlocked(){return hasChallenge("n",22)||player.a.unlocked},
        },
    },
    update(diff){
        player.n.points=player.n.points.add(tmp.n.getnegen.times(diff))
        player.n.mixcolor="rgb("+Math.floor(player.n.mixcolorR)+","+Math.floor(player.n.mixcolorG)+","+Math.floor(player.n.mixcolorB)+")"
        player.n.mixpoints=tmp.n.getmixenergy[0]
    },
    getnegen(){
        let gen=new Decimal(0)
        gen=player.q.points.add(1).log10().sub(120).max(0).pow(2).div(10000)
        gen=gen.times(tmp.n.gainMult).pow(tmp.n.gainExp)
        return  player.q.points.gte(1e120)&&hasUpgrade("p",35) ? gen : new Decimal(0)
    },
    getmixenergy(){
        let p=new Decimal(1)
        p=p.add(buyableEffect("n",11))
        if(hasUpgrade("n",44)) p=p.add(upgradeEffect("n",44))
        if(hasUpgrade("a",25)) p=p.add(0.1)
        let e=new Decimal(1)
        e=e.add(buyableEffect("n",13))
        if(hasUpgrade("a",25)) e=e.add(0.1)
        let n=new Decimal(1)
        n=n.add(buyableEffect("n",12))
        if(hasUpgrade("p",45)) n=n.add(upgradeEffect("p",45))
        if(hasUpgrade("a",25)) n=n.add(0.1)
        let me=new Decimal(1)
        me=(player.p.points.add(1).div(1e60).log10().max(1).pow(p).add(player.n.points.add(1).div(1e10).log10().max(1).pow(n))).pow(player.e.points.minus(4).max(10).log10()).minus(2).max(0)
        if(player.e.ischarge7) me=me.times(tmp.e.chargeeff[7])
        let lst=[me,p,n,e]
        return lst
    },
    getmixcolor(){
        if(player.n.mixcolorR<235&&player.n.mixcolorG>=60&&player.n.mixcolorG<225&&player.n.mixcolorB>0&&player.n.state1){
            player.n.mixcolorR+=11.75
            player.n.mixcolorG+=8.25
            player.n.mixcolorB-=11.75
            if(player.n.mixcolorR>=235){
                player.n.state1=false
                player.n.state2=true
            }
        }
        if(player.n.mixcolorR>225&&player.n.mixcolorR<=235&&player.n.mixcolorG>0&&player.n.mixcolorB==0&&player.n.state2){
            player.n.mixcolorR-=0.5
            player.n.mixcolorG-=11.25
            if(player.n.mixcolorG<=0){
                player.n.state2=false
                player.n.state3=true
            }
        }
        if(player.n.mixcolorR>0&&player.n.mixcolorG<60&&player.n.mixcolorB<235&&player.n.state3){
            player.n.mixcolorR-=11.25
            player.n.mixcolorG+=3
            player.n.mixcolorB+=11.75
            if(player.n.mixcolorB>=235){
                player.n.state3=false
                player.n.state1=true
            }
        }
    },
    upgrades:{
        11:{
            title:"Neutron rays",
            description(){return `Double NE gain.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1)},
            unlocked(){
                return true
            },
            canAfford(){return player.n.points.gte(1)},
            pay(){return player.n.points=player.n.points.minus(1)},
        },
        12:{
            title:"Neutron force",
            description(){return `10x force gain.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(3)},
            unlocked(){
                return hasUpgrade("n",11)
            },
            canAfford(){return player.n.points.gte(3)},
            pay(){return player.n.points=player.n.points.minus(3)},
        },
        13:{
            title:"Neutron charge",
            description(){return `You can charge 2 things at once.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("n",12)
            },
            canAfford(){return player.n.points.gte(5)},
            pay(){return player.n.points=player.n.points.minus(5)},
        },
        14:{
            title:"Neutron softcap delayer",
            description(){return `Force softcap is 0.9x weaker.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("n",13)
            },
            canAfford(){return player.n.points.gte(5)},
            pay(){return player.n.points=player.n.points.minus(5)},
        },
        15:{
            title:"Challenges?",
            description(){return `Unlock a challenge.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(10)},
            unlocked(){
                return hasUpgrade("n",14)
            },
            canAfford(){return player.n.points.gte(10)},
            pay(){return player.n.points=player.n.points.minus(10)},
        },
        21:{
            title:"Neutron boost I",
            description(){return `Boost force gain after softcap based on NE.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(100)},
            unlocked(){
                return hasUpgrade("n",15)
            },
            canAfford(){return player.n.points.gte(100)},
            pay(){return player.n.points=player.n.points.minus(100)},
            effect(){return player.n.points.add(1).pow(0.25)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("n",21))}`},
            tooltip(){return `(ne+1)^0.25`}
        },
        22:{
            title:"Neutron boost II",
            description(){return `Boost NE gain based on force.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(200)},
            unlocked(){
                return hasUpgrade("n",21)
            },
            canAfford(){return player.n.points.gte(200)},
            pay(){return player.n.points=player.n.points.minus(200)},
            effect(){return player.points.add(1).log10().add(1).pow(hasUpgrade("a",32)?1.8:1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("n",22))}`},
            tooltip(){return `log10(f+1)+1`}
        },
        23:{
            title:"Neutron boost III",
            description(){return `Boost proton gain based on NE.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(20000)},
            unlocked(){
                return hasUpgrade("n",22)
            },
            canAfford(){return player.n.points.gte(20000)},
            pay(){return player.n.points=player.n.points.minus(20000)},
            effect(){return player.n.points.add(1).ln().pow(2).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("n",23))}`},
            tooltip(){return `ln(ne+1)^2+1`}
        },
        24:{
            title:"Neutron boost IV",
            description(){return `Boost electron charge effect based on NE.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(3e6)},
            unlocked(){
                return hasUpgrade("n",23)
            },
            canAfford(){return player.n.points.gte(3e6)},
            pay(){return player.n.points=player.n.points.minus(3e6)},
            effect(){return player.n.points.add(1).log10().div(200).add(1)},
            effectDisplay(){return `Currently:^${format(upgradeEffect("n",24))}`},
            tooltip(){return `log10(ne+1)/200+1`}
        },
        25:{
            title:"Challenges!",
            description(){return `Unlock two new challenges.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e7)},
            unlocked(){
                return hasUpgrade("n",24)
            },
            canAfford(){return player.n.points.gte(1e7)},
            pay(){return player.n.points=player.n.points.minus(1e7)},
        },
        31:{
            title:"Static boost I",
            description(){return `Divide electron price by 1e25.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e7)},
            unlocked(){
                return hasUpgrade("n",25)
            },
            canAfford(){return player.n.points.gte(1e7)},
            pay(){return player.n.points=player.n.points.minus(1e7)},
        },
        32:{
            title:"Static boost II",
            description(){return `75x NE gain.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1.5e7)},
            unlocked(){
                return hasUpgrade("n",31)
            },
            canAfford(){return player.n.points.gte(1.5e7)},
            pay(){return player.n.points=player.n.points.minus(1.5e7)},
        },
        33:{
            title:"Static boost III",
            description(){return `+1 to "Gravatational field" base.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e9)},
            unlocked(){
                return hasUpgrade("n",32)
            },
            canAfford(){return player.n.points.gte(1e9)},
            pay(){return player.n.points=player.n.points.minus(1e9)},
        },
        34:{
            title:"Static boost IV",
            description(){return `Add 0.01 to quark gain exp.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e9)},
            unlocked(){
                return hasUpgrade("n",33)
            },
            canAfford(){return player.n.points.gte(1e9)},
            pay(){return player.n.points=player.n.points.minus(1e9)},
        },
        35:{
            title:"Challenges.",
            description(){return `Unlock the last challenge.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(2.5e9)},
            unlocked(){
                return hasUpgrade("n",34)
            },
            canAfford(){return player.n.points.gte(2.5e9)},
            pay(){return player.n.points=player.n.points.minus(2.5e9)},
        },
        41:{
            title:"Mixed neutron",
            description(){return `Boost NE gain based on ME.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e9)},
            unlocked(){
                return hasChallenge("n",22)
            },
            canAfford(){return player.n.points.gte(1e9)},
            pay(){return player.n.points=player.n.points.minus(1e9)},
            effect(){return player.n.mixpoints.pow(3).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("n",41))}`},
            tooltip(){return `me^3+1`}
        },
        42:{
            title:"Mixed electron",
            description(){return `Divide electron price based on ME.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(5e9)},
            unlocked(){
                return hasUpgrade("n",41)
            },
            canAfford(){return player.n.points.gte(5e9)},
            pay(){return player.n.points=player.n.points.minus(5e9)},
            effect(){return Decimal.pow(1.1,player.n.mixpoints).times(1e10).min("1e308")},
            effectDisplay(){return `Currently:`+(this.effect().gte("1e308")? `/1.00e308<br>(Capped)`:`/${format(upgradeEffect("n",42))}`)},
            tooltip(){return `1.1^m*1e10`}
        },
        43:{
            title:"Chaotic charge",
            description(){return `You can charge 3 things at once.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(5e10)},
            unlocked(){
                return hasUpgrade("n",42)
            },
            canAfford(){return player.n.points.gte(5e10)},
            pay(){return player.n.points=player.n.points.minus(5e10)},
        },
        44:{
            title:"Rotation synergism II",
            description(){return `Boost x based on y buyables.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(5e11)},
            unlocked(){
                return hasUpgrade("n",43)
            },
            canAfford(){return player.n.points.gte(5e11)},
            pay(){return player.n.points=player.n.points.minus(5e11)},
            effect(){return getBuyableAmount("n",12).div(50)},
            effectDisplay(){return `Currently:+${format(upgradeEffect("n",44))}`},
            tooltip(){return `y/50`}
        },
        45:{
            title:"Atom",
            description(){return `Unlock a new layer.`},
            currencyDisplayName:"NE",
            cost(){return new Decimal(1e13)},
            unlocked(){
                return hasUpgrade("n",43)
            },
            canAfford(){return player.n.points.gte(1e13)},
            pay(){return player.n.points=player.n.points.minus(1e13)},
        },
    },
    challenges:{
            11:{
                name() {return`Genesis-less`},
                challengeDescription() {return `Genesis gain is raised to ^0.5, "Negative" base is 1.`},
                unlocked(){return hasUpgrade("n",15)},
                goalDescription(){return  `1e100 Force`},
                style:{"border-radius":"5%","border-color":"red","font-size":"17px","width":"250px","height":"250px"},
                rewardDescription:"+0.1 to force gain exp. and 10x proton gain.",
                canComplete(){return player.points.gte(1e100)},
                marked(){return hasChallenge("n",11)},
            },     
            12:{
                name() {return`Forceless`},
                challengeDescription() {return `Force softcap starts at 1e-39 and ^2 stronger.`},
                unlocked(){return hasUpgrade("n",25)},
                goalDescription(){return  `1e16 Force`},
                style:{"border-radius":"5%","border-color":"red","font-size":"17px","width":"250px","height":"250px"},
                rewardDescription:"Force softcap is 0.95x weaker and 25x proton gain.",
                canComplete(){return player.points.gte(1e16)},
                marked(){return hasChallenge("n",12)},
            },
            21:{
                name() {return`Quarkless`},
                challengeDescription() {return `Quark gain is raised to ^0.1, "Inflation" base is 1.`},
                unlocked(){return hasUpgrade("n",25)},
                goalDescription(){return  `1e62 Force`},
                style:{"border-radius":"5%","border-color":"red","font-size":"17px","width":"250px","height":"250px"},
                rewardDescription:"^1.05 quark gain and 100x proton gain.",
                canComplete(){return player.points.gte(1e62)},
                marked(){return hasChallenge("n",21)},
            },
            22:{
                name() {return`Purchaseless`},
                challengeDescription() {return `You can only buy 20 genesis buyable in total, genesis buyable automation is disabled.`},
                unlocked(){return hasUpgrade("n",35)},
                goalDescription(){return  `1e125 Force`},
                style:{"border-radius":"5%","border-color":"red","font-size":"17px","width":"250px","height":"250px"},
                rewardDescription:"Unlock mix energy, ^1.05 proton gain.",
                onEnter(){
                    player.g.purchaseleft=20
                },
                onExit(){
                    player.g.purchaseleft=20
                },
                canComplete(){return player.points.gte(1e125)},
                marked(){return hasChallenge("n",22)},
            },
            31:{
                name() {return`Layer reduce`},
                challengeDescription() {return `Divide genesis gain based on quarks^0.1, quark autogen is disabled.`},
                unlocked(){return hasMilestone("a",3)},
                goalDescription(){return  `1e190 Force`},
                style:{"border-radius":"5%","border-color":"red","font-size":"15px","width":"250px","height":"250px"},
                rewardDescription(){return `x2 Atom gain, boost genesis gain based on quark^0.01.<br>
                                    Currently:x${format(player.q.points.pow(0.01).add(1))}`},
                canComplete(){return player.points.gte(1e190)},
                marked(){return hasChallenge("n",31)},
            },
    },
    buyables:{
        11:{
            cost(x) { return Decimal.pow(1000,x.pow(1.25)).times(1e40) },
            effect(x) {return x.times(0.05)},
            display() { return `<b style="font-size:17.5px">+0.05 to x</b>
                                Cost: ${format(this.cost())} proton
                                Amount: ${format(getBuyableAmount("n",11))}
                                Effect: +${format(this.effect())}` },
            canAfford() { return player.p.points.gt(this.cost())&&this.unlocked()},
            buy(){
                if(!tmp.n.buyables[11].canAfford) return
                player.p.points=player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.n.buyables[11].canAfford) return
                let tb = player.p.points.max(1).div(1e40).log(1000).root(1.25).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasChallenge("n",22)||hasMilestone("a",2)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        12:{
            cost(x) { return Decimal.pow(10,x.pow(1.5)).times(1e8) },
            effect(x) {return x.times(0.05)},
            display() { return `<b style="font-size:17.5px">+0.05 to y</b>
                                Cost: ${format(this.cost())} NE
                                Amount: ${format(getBuyableAmount("n",12))}
                                Effect: +${format(this.effect())}` },
            canAfford() { return player.n.points.gt(this.cost())&&this.unlocked()},
            buy(){
                if(!tmp.n.buyables[12].canAfford) return
                player.n.points=player.n.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.n.buyables[12].canAfford) return
                let tb = player.n.points.max(1).div(1e8).log(10).root(1.5).sub(1)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasChallenge("n",22)||hasMilestone("a",2)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        13:{
            cost(x) { return Decimal.pow(2,x.pow(0.8)).floor() },
            effect(x) {return x.times(0.05)},
            display() { return `<b style="font-size:17.5px">+0.05 to z</b>
                                Cost: ${format(this.cost())} electron
                                Amount: ${format(getBuyableAmount("n",13))}
                                Effect: +${format(this.effect())}` },
            canAfford() { return player.e.points.gte(this.cost())&&this.unlocked()},
            buy(){
                if(!tmp.n.buyables[13].canAfford) return
                player.e.points=player.e.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!tmp.n.buyables[13].canAfford) return
                let tb = player.e.points.max(1).log(2).pow(1.25)
                let tg = tb.plus(1).floor()
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).max(tg))
            },
            unlocked(){return hasChallenge("n",22)||hasMilestone("a",2)},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
    },
}),
addLayer("a", {
    name: "atom", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        row1costmult: new Decimal(1),
        row2costmult: new Decimal(1),
        row3costmult: new Decimal(1),
        boughtsum: new Decimal(0),
    }},
    color:"rgb(20, 110, 175)",
    requires: new Decimal(15), // Can be a function that takes requirement increases into account
    resource: "atom", // Name of prestige currency
    baseResource: "mixed energy", // Name of resource prestige is based on
    baseAmount() {return player.n.mixpoints}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasChallenge("n",31)) mult=mult.times(2)
        if(hasUpgrade("a",37)) mult=mult.times(4)
        if(hasUpgrade("a",21)) mult=mult.times(upgradeEffect("a",21))
        if(hasUpgrade("a",24)) mult=mult.times(upgradeEffect("a",24))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp=new Decimal(1)
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("n",45)||player.a.unlocked},
    branches:["p","e","n"],
    hotkeys: [
        {key: "a", description: "A: Reset for atom", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat:{
        "Main":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">${format(player.a.points)}</h2> atom, boost proton and NE gain by <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">x${format(tmp.a.getatomboost)}</h2>`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                "buyables",
            ]
        },
        "Milestones":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">${format(player.a.points)}</h2> atom, boost proton and NE gain by <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">x${format(tmp.a.getatomboost)}</h2>`},{ "font-size":"15px"},],
                "blank",
                "prestige-button",
                "blank",
                "milestones"
            ],
        },
        "Elements":{
            content:[
                ["display-text",function() { return `You have <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">${format(player.a.points)}</h2> atom, boost proton and NE gain by <h2 style="color:rgb(20,110,175);text-shadow:0 0 10px rgb(20,110,175)">x${format(tmp.a.getatomboost)}</h2>`},{ "font-size":"15px"},],
                "blank",
                ["display-text",function() { return `When you choose one element, the others in this row will be more expensive`},{ "font-size":"15px"},],
                "blank",
                "clickables",
                "blank",
                "upgrades",
            ],
            unlocked(){return hasMilestone("a",6)},
        },
    },
    getatomboost(){
        let boost=new Decimal(1)
        let exp=new Decimal(5)
        if(hasUpgrade("a",36)) exp=exp.add(0.5)
        boost=Decimal.pow(exp,player.a.points.add(1).log10())
        return boost
    },
    update(diff){
    },
    buyables:{
        11:{
            cost(x) {
                lst=[1,1,1,2,2,2]
                return lst[x]
            },
            effect(x) {return x.times(0.02).add(1)},
            title() {return `Force boost`},
            display() { return `+^0.02 to force gain after 1 
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",11))}/5
                                Effect: ^${format(this.effect())}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[11].canAfford&&getBuyableAmount("a",11).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        12:{
            cost(x) {
                lst=[1,2,2,2,3,3]
                return lst[x]
            },
            effect(x) {return x.times(0.03).add(1)},
            title() {return `Genesis boost`},
            display() { return `+^0.03 to genesis gain 
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",12))}/5
                                Effect: ^${format(this.effect())}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[12].canAfford&&getBuyableAmount("a",12).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        13:{
            cost(x) {
                lst=[1,2,2,3,4,4]
                return lst[x]
            },
            effect(x) {return x.times(0.01).add(1)},
            title() {return `Quark boost`},
            display() { return `+^0.01 to quark gain 
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",13))}/5
                                Effect: ^${format(this.effect())}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[13].canAfford&&getBuyableAmount("a",13).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        21:{
            cost(x) {
                lst=[1,2,3,4,4,5]
                return lst[x]
            },
            effect(x) {return x.times(0.02).add(1)},
            title() {return `Proton boost`},
            display() { return `+^0.02 to proton gain 
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",21))}/5
                                Effect: ^${format(this.effect())}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[21].canAfford&&getBuyableAmount("a",21).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        22:{
            cost(x) {
                lst=[1,2,3,4,5,5]
                return lst[x]
            },
            effect(x) {return x.times(0.02).add(1)},
            title() {return `Electron boost`},
            display() { return `+^0.02 to electron price root
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",22))}/5
                                Effect: ^${format(new Decimal(1).div(this.effect()))}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[22].canAfford&&getBuyableAmount("a",22).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
        23:{
            cost(x) {
                lst=[1,2,3,4,5,6]
                return lst[x]
            },
            effect(x) {return x.times(0.02).add(1)},
            title() {return `Neutron boost`},
            display() { return `+^0.02 to NE gain
                                Cost: ${format(this.cost())} atom
                                Amount: ${format(getBuyableAmount("a",23))}/5
                                Effect: ^${format(this.effect())}` },
            canAfford() { return player.a.points.gte(this.cost())&&this.unlocked()},
            purchaseLimit:5,
            buy(){
                if(!tmp.a.buyables[23].canAfford&&getBuyableAmount("a",23).gte(5)) return
                player.a.points=player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return player.a.unlocked},
            style:{"height":"150px","width":"150px","font-size":"15px","border-radius":"5%","margin-top":"15px","font-size":"12.5px"}
        },
    },
    milestones:{
        0: {
            requirementDescription: "1 atom",
            done() { return player.a.points.gte(1)},
            effectDescription: `10x proton gain. +0.01 to force gain exp for first 50 atoms. Quark Qols are effective all the times.`,
        },
        1: {
            requirementDescription: "2 total atom",
            done() { return player.a.total.gte(2)},
            effectDescription: `100x NE gain. Keep proton upgrades on reset.`,
        },
        2: {
            requirementDescription: "3 total atom",
            done() { return player.a.total.gte(3)},
            effectDescription: `Keep neutron challenges completions on reset.`,
        },
        3: {
            requirementDescription: "5 total atom",
            done() { return player.a.total.gte(5)},
            effectDescription: `You can buy max electron at once, unlock a new neutron challenge.`,
        },
        4: {
            requirementDescription: "12 total atom",
            done() { return player.a.total.gte(12)},
            effectDescription: `Unlock a new charge.`,
        },
        5: {
            requirementDescription: "1500 total atom",
            done() { return player.a.total.gte(1500)},
            effectDescription: `Auto gain 100% of proton,keep proton milestones.`,
        },
        6: {
            requirementDescription: "10000 total atom",
            done() { return player.a.total.gte(10000)},
            effectDescription: `Unlock elements.`,
        },
    },
    clickables:{
        11:{
            display(){return `respec elements(give back ${format(player.a.boughtsum)} atom)`},
            style:{"height":"75px","min-height":"75px","width":"400px","border-radius":"5%","border-size":"6px","border-color":"rgb(20,110,175)","color":"rgb(20,110,175)","font-size":"15px","background-color":"rgba(20,110,175,0.3)"},
            unlocked(){return player.e.unlocked},
            onClick(){
                player.a.upgrades=[]        
                player.a.points=player.a.points.add(player.a.boughtsum)
                player.a.boughtsum=new Decimal(0)
                player.a.row1costmult=new Decimal(1)
                player.a.row2costmult=new Decimal(1)
                player.a.row3costmult=new Decimal(1)
            },
            canClick(){return true}
        },
    },
    upgrades:{
        11:{
            title:"H[1]",
            description(){return `Add 2 to "Negative" base.`},
            cost(){return new Decimal(8000).times(player.a.row1costmult)},
            unlocked(){
                return hasMilestone("a",6)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row1costmult=player.a.row1costmult.times(1.3)
            },
            canAfford(){return player.a.points.gte(player.a.row1costmult.times(8000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row1costmult.times(8000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",11)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[11].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",11)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[11].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",11)||tmp.a.upgrades[11].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        12:{
            title:"He[2]",
            description(){return `Add 0.2 to "Vanish" base.`},
            cost(){return new Decimal(12000).times(player.a.row1costmult)},
            unlocked(){
                return hasMilestone("a",6)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row1costmult=player.a.row1costmult.times(1.3)
            },
            canAfford(){return player.a.points.gte(player.a.row1costmult.times(12000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row1costmult.times(12000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 200)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",12)) return "rgb(200, 0, 200)"
                        if(tmp.a.upgrades[12].canAfford) return "rgba(200, 0, 200, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",12)) return "0px 0px 15px rgba(200, 0, 200, 0.75)"
                        if(tmp.a.upgrades[12].canAfford) return "0px 0px 20px rgb(200, 0, 200)"
                        return "0px 0px 2px rgb(200, 0, 200)"
                    },"color"(){
                        if(hasUpgrade("a",12)||tmp.a.upgrades[12].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 200)"
                    }
                },
        },
        21:{
            title:"Li[3]",
            description(){return `Boost atom gain based on itself.`},
            cost(){return new Decimal(17500).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",11)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.1)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(17500))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(17500))},
            effect(){return player.a.points.add(1).log(2).pow(2).div(30)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",21))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(220, 70, 2)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",21)) return "rgb(220, 70, 2)"
                        if(tmp.a.upgrades[21].canAfford) return "rgba(220, 70, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",21)) return "0px 0px 15px rgba(220, 70, 0, 0.75)"
                        if(tmp.a.upgrades[21].canAfford) return "0px 0px 20px rgb(220, 70, 0)"
                        return "0px 0px 2px rgb(220, 70, 0)"
                    },"color"(){
                        if(hasUpgrade("a",21)||tmp.a.upgrades[21].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(220, 70, 0)"
                    }
                },
        },
        22:{
            title:"Be[4]",
            description(){return `Keep neutron upgrades on reset.`},
            cost(){return new Decimal(14000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",21)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.4)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(14000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(14000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 130, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",22)) return "rgb(200, 130, 0)"
                        if(tmp.a.upgrades[22].canAfford) return "rgba(200, 130, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",22)) return "0px 0px 15px rgba(200, 130, 0, 0.75)"
                        if(tmp.a.upgrades[22].canAfford) return "0px 0px 20px rgb(200, 130, 0)"
                        return "0px 0px 2px rgb(200, 130, 0)"
                    },"color"(){
                        if(hasUpgrade("a",22)||tmp.a.upgrades[22].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 130, 0)"
                    }
                },
        },
        23:{
            title:"B[5]",
            description(){return `x5 proton gain for each element bought.`},
            cost(){return new Decimal(18000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",22)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.2)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(18000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(18000))},
            effect(){return Decimal.pow(5,player.a.upgrades.length)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",23))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(150, 200, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",23)) return "rgb(150, 200, 0)"
                        if(tmp.a.upgrades[23].canAfford) return "rgba(150, 200, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",23)) return "0px 0px 15px rgba(150, 200, 0, 0.75)"
                        if(tmp.a.upgrades[23].canAfford) return "0px 0px 20px rgb(150, 200, 0)"
                        return "0px 0px 2px rgb(150, 200, 0)"
                    },"color"(){
                        if(hasUpgrade("a",23)||tmp.a.upgrades[23].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(150, 200, 0)"
                    }
                },
        },
        24:{
            title:"C[6]",
            description(){return `Boost atom gain based on force.`},
            cost(){return new Decimal(45000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",23)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.2)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(45000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(45000))},
            effect(){return player.points.add(1).log10().pow(4).div(2e9).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",24))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",24)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[24].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",24)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[24].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",24)||tmp.a.upgrades[24].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        25:{
            title:"N[7]",
            description(){return `+0.1 to x,y and z.`},
            cost(){return new Decimal(80000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",26)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.4)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(80000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(80000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",25)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[25].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",25)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[25].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",25)||tmp.a.upgrades[25].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        26:{
            title:"O[8]",
            description(){return `Boost NE gain based on atom.`},
            cost(){return new Decimal(50000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",27)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.3)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(50000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(50000))},
            effect(){return Decimal.pow(2,player.a.points.add(1).log10())},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",26))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",26)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[26].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",26)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[26].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",26)||tmp.a.upgrades[26].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        27:{
            title:"F[9]",
            description(){return `"Hidden proton" log10 -> log2.`},
            cost(){return new Decimal(45000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",28)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.1)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(45000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(45000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",27)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[27].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",27)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[27].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",27)||tmp.a.upgrades[27].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        28:{
            title:"Ne[10]",
            description(){return `You can charge 4 things at once.`},
            cost(){return new Decimal(30000).times(player.a.row2costmult)},
            unlocked(){
                return hasUpgrade("a",12)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row2costmult=player.a.row2costmult.times(1.3)
            },
            canAfford(){return player.a.points.gte(player.a.row2costmult.times(30000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row2costmult.times(30000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 200)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",28)) return "rgb(200, 0, 200)"
                        if(tmp.a.upgrades[28].canAfford) return "rgba(200, 0, 200, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",28)) return "0px 0px 15px rgba(200, 0, 200, 0.75)"
                        if(tmp.a.upgrades[28].canAfford) return "0px 0px 20px rgb(200, 0, 200)"
                        return "0px 0px 2px rgb(200, 0, 200)"
                    },"color"(){
                        if(hasUpgrade("a",28)||tmp.a.upgrades[28].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 200)"
                    }
                },
        },
        31:{
            title:"Na[11]",
            description(){return `Electron resets nothing.`},
            cost(){return new Decimal(75000).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",21)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.2)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(75000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(75000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(220, 70, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",31)) return "rgb(220, 70, 0)"
                        if(tmp.a.upgrades[31].canAfford) return "rgba(220, 70, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",31)) return "0px 0px 15px rgba(220, 70, 0, 0.75)"
                        if(tmp.a.upgrades[31].canAfford) return "0px 0px 20px rgb(220, 70, 0)"
                        return "0px 0px 2px rgb(220, 70, 0)"
                    },"color"(){
                        if(hasUpgrade("a",31)||tmp.a.upgrades[31].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(220, 70, 0)"
                    }
                },
        },
        32:{
            title:"Mg[12]",
            description(){return `Neutron Boost II effect is ^1.8 stronger.`},
            cost(){return new Decimal(95000).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",22)||hasUpgrade("a",31)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.1)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(95000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(95000))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 130, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",32)) return "rgb(200, 130, 0)"
                        if(tmp.a.upgrades[32].canAfford) return "rgba(200, 130, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",32)) return "0px 0px 15px rgba(200, 130, 0, 0.75)"
                        if(tmp.a.upgrades[32].canAfford) return "0px 0px 20px rgb(200, 130, 0)"
                        return "0px 0px 2px rgb(200, 130, 0)"
                    },"color"(){
                        if(hasUpgrade("a",32)||tmp.a.upgrades[32].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 130, 0)"
                    }
                },
        },
        33:{
            title:"Al[13]",
            description(){return `Topquark effect is stronger based on atom.`},
            cost(){return new Decimal(300000).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",23)||hasUpgrade("a",32)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.25)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(300000))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(300000))},
            effect(){return player.a.points.div(1e5).add(1).log10().add(1).sqrt()},
            effectDisplay(){return `^${format(upgradeEffect("a",33))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(0, 220, 200)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",33)) return "rgb(0, 220, 200)"
                        if(tmp.a.upgrades[33].canAfford) return "rgba(0, 220, 200, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",33)) return "0px 0px 15px rgba(0, 220, 200, 0.75)"
                        if(tmp.a.upgrades[33].canAfford) return "0px 0px 20px rgb(0, 220, 200)"
                        return "0px 0px 2px rgb(0, 220, 200)"
                    },"color"(){
                        if(hasUpgrade("a",33)||tmp.a.upgrades[33].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(0, 220, 200)"
                    }
                },
        },
        34:{
            title:"Si[14]",
            description(){return `Force softcap starts x25 later for each element bought.`},
            cost(){return new Decimal(3e6).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",24)||hasUpgrade("a",33)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(2)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(3e6))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(3e6))},
            effect(){return Decimal.pow(25,player.a.upgrades.length)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",34))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(150, 200, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",34)) return "rgb(150, 200, 0)"
                        if(tmp.a.upgrades[34].canAfford) return "rgba(150, 200, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",34)) return "0px 0px 15px rgba(150, 200, 0, 0.75)"
                        if(tmp.a.upgrades[34].canAfford) return "0px 0px 20px rgb(150, 200, 0)"
                        return "0px 0px 2px rgb(150, 200, 0)"
                    },"color"(){
                        if(hasUpgrade("a",34)||tmp.a.upgrades[34].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(150, 200, 0)"
                    }
                },
        },
        35:{
            title:"P[15]",
            description(){return `Boost proton gain based on atom.`},
            cost(){return new Decimal(1e7).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",25)||hasUpgrade("a",34)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.3)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(1e7))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(1e7))},
            effect(){return player.a.points.add(1).div(1000).pow(0.2).add(1)},
            effectDisplay(){return `Currently:x${format(upgradeEffect("a",35))}`},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",35)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[35].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",35)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[35].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",35)||tmp.a.upgrades[35].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        36:{
            title:"S[16]",
            description(){return `Add 0.5 to atom boost exp.`},
            cost(){return new Decimal(5e7).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",26)||hasUpgrade("a",35)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.8)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(5e7))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(5e7))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",36)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[36].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",36)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[36].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",36)||tmp.a.upgrades[36].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        37:{
            title:"Cl[17]",
            description(){return `Auto buy electron and 4x atom gain.`},
            cost(){return new Decimal(2e7).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",27)||hasUpgrade("a",36)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.4)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(2e7))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(2e7))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 0)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",37)) return "rgb(200, 0, 0)"
                        if(tmp.a.upgrades[37].canAfford) return "rgba(200, 0, 0, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",37)) return "0px 0px 15px rgba(200, 0, 0, 0.75)"
                        if(tmp.a.upgrades[37].canAfford) return "0px 0px 20px rgb(200, 0, 0)"
                        return "0px 0px 2px rgb(200, 0, 0)"
                    },"color"(){
                        if(hasUpgrade("a",37)||tmp.a.upgrades[37].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 0)"
                    }
                },
        },
        38:{
            title:"Ar[18]",
            description(){return `Finish this game, for now.`},
            cost(){return new Decimal(1.5e8).times(player.a.row3costmult)},
            unlocked(){
                return hasUpgrade("a",37)
            },
            onPurchase(){
                player.a.boughtsum=player.a.boughtsum.add(this.cost)
                player.a.row3costmult=player.a.row3costmult.times(1.7)
            },
            canAfford(){return player.a.points.gte(player.a.row3costmult.times(1.5e8))},
            pay(){return player.a.points=player.a.points.minus(player.a.row3costmult.times(1.5e8))},
            style:{height:"100px",width:"100px","border-radius":"0%","border-size":"10px","border-color":"rgb(200, 0, 200)","min-height":"100px","background-color"(){
                        if(hasUpgrade("a",38)) return "rgb(200, 0, 200)"
                        if(tmp.a.upgrades[38].canAfford) return "rgba(200, 0, 200, 0.3)"
                        return "rgb(0, 0, 0)"
                    },"box-shadow"(){
                        if(hasUpgrade("a",38)) return "0px 0px 15px rgba(200, 0, 200, 0.75)"
                        if(tmp.a.upgrades[38].canAfford) return "0px 0px 20px rgb(200, 0, 200)"
                        return "0px 0px 2px rgb(200, 0, 200)"
                    },"color"(){
                        if(hasUpgrade("a",38)||tmp.a.upgrades[38].canAfford) return "rgb(0, 0, 0)"
                        return "rgb(200, 0, 200)"
                    }
                },
        },
    }
}),
addLayer("st", {
    symbol: "#",
    startData() { return {
        unlocked: true,
    }},
    color: "#DDDDDD",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Game stories")
    },
    tabFormat:{
        "Chapter I":{
            content:[
                ["infobox","Genesis1"],
                "blank",
                ["infobox","Genesis2"],
                "blank",
                ["infobox","Genesis3"],
                "blank",
                ["infobox","Genesis4"],
                "blank",
                ["infobox","Genesis5"],
            ]
        },
        "Chapter II":{
            content:[
                ["infobox","Quark1"],
                "blank",
                ["infobox","Quark2"],
                "blank",
                ["infobox","Quark3"],
                "blank",
                ["infobox","Quark4"],
                "blank",
                ["infobox","Quark5"],
                "blank",
            ],
            unlocked(){return player.q.unlocked||player.p.unlocked},
        },
        "Chapter III":{
            content:[
                ["infobox","Proton"],
                "blank",
                ["infobox","Electron"],
                "blank",
                ["infobox","Neutron"],
                "blank",
            ],
            unlocked(){return player.p.unlocked},
        },
        "Chapter IV":{
            content:[
                ["infobox","Atom"],
                "blank",
            ],
            unlocked(){return player.a.unlocked},
        }
    },
    infoboxes: {
        Genesis1: {
            title: "Part I-Genesis",
            body() { return `Soon after the universe exploded, there was nothing but nothingness.....<br>
                            A force suddenly appeared in the void, but it was extremely weak, what do you need to do.....
                ` },
            style:{"width":"400px"},
        },
        Genesis2: {
            title: "Part II-Force production",
            body() { return `You can produce force now by using a strange thing:Genesis.<br>
                           But it is still weaker than you thought, you should find a way to make it faster.....
                ` },
            style:{"width":"400px"},
            unlocked(){return hasUpgrade("g",11)||getBuyableAmount("g",11).gt(0)||player.q.unlocked||player.p.unlocked}
        },
        Genesis3: {
            title: "Part III-Gravity",
            body() { return `The force is strong enough to pull each other together.<br>
                            These makes produce faster.` },
            style:{"width":"400px"},
            unlocked(){return getBuyableAmount("g",11).gt(0)||player.q.unlocked||player.p.unlocked}
        },
        Genesis4: {
            title: "Part IV-Quantum",
            body() { return `Something strange things appeared in the void.<br>
                            Spend some force to catch it.` },
            style:{"width":"400px"},
            unlocked(){return hasUpgrade("g",25)||player.q.unlocked||player.p.unlocked}
        },
        Genesis5: {
            title: "Part V-Vanish",
            body() { return `You caught a positive quantum and a negative one.<br>
                            They vanished immediately, but you fell the gravity is stronger.` },
            style:{"width":"400px"},
            unlocked(){return hasUpgrade("g",31)||player.q.unlocked||player.p.unlocked}
        },
        Quark1: {
            title: "Part I-Quark",
            body() { return `Finally, the force is strong enough to stop quantums from vanishing.<br>
                            They merged up and created a new thing —— quark.<br>
                            You need more force to combined quarks together.<br>
                            Luckily, you can use all your genesis to create a quark.<br>
                            It can make force stronger.` },
            style:{"width":"400px"},
            unlocked(){return player.q.unlocked||player.p.unlocked}
        },
        Quark2: {
            title: "Part II-Types",
            body() { return `You found that there're different specifics between quarks.<br>
                            You decided to divide them into 6 types:<br>
                            up,down,strange,charm,top and bottom.<br>
                            Your current force only allows you to create the basic and the lightest one————up quarks.` },
            style:{"width":"400px"},
            unlocked(){return hasMilestone("q",0)||player.p.unlocked}
        },
        Quark3: {
            title: "Part III-Up and down",
            body() { return `You can generate down quarks now.<br>
                            Each type of quarks make force produce faster.<br>
                            Soon, you'll have your force exceed 1.<br>
                            But there's something slows down the production...` },
            style:{"width":"400px"},
            unlocked(){return hasMilestone("q",1)||player.p.unlocked}
        },
        Quark4: {
            title: "Part IV-Strange and charm",
            body() { return `These two types are much heavier than the previous ones.<br>
                            It took you much forces to create them.<br>
                            The new types are very unstable that they can become up/down quark instantly.<br>
                            So their production are based on your up/down quark production.` },
            style:{"width":"400px"},
            unlocked(){return hasMilestone("q",3)||player.p.unlocked}
        },
        Quark5: {
            title: "Part V-Top and bottom",
            body() { return `These two types are the rariest quarks.<br>
                            Their production are based on strange/charm production.<br>
                            They're so heavy that they could affect the lighter one's effect.<br>
                            Your quarks started to gathering, let's see what would happen...` },
            style:{"width":"400px"},
            unlocked(){return hasMilestone("q",5)||player.p.unlocked}
        },
        Proton: {
            title: "Part I-Proton",
            body() { return `By crunching two up quarks and one downquark.<br>
                            You made a new particle called proton.<br>
                            The energy of crunching is so huge that all of your quarks disappeared.<br>
                            What will be the boost of proton?` },
            style:{"width":"400px"},
            unlocked(){return player.p.unlocked}
        },
        Electron: {
            title: "Part II-Electron",
            body() { return `Protons now have enough force to catch something new.<br>
                            It is called electron.<br>
                            Electrons goes around proton and it has a large number of energy.<br>
                            Charge it can give a boost.` },
            style:{"width":"400px"},
            unlocked(){return player.e.unlocked}
        },
        Neutron: {
            title: "Part III-Neutron",
            body() { return `Things are much more complex now.<br>
                            A neutron appeared.<br>
                            By crunching quarks, you will passively get NE.<br>
                            You can unlock challenges with NE.<br>
                            Which is harder to produce force.` },
            style:{"width":"400px"},
            unlocked(){return player.n.unlocked}
        },
        Atom: {
            title: "Part I-Atom",
            body() { return `Proton,Neutron and electron mixed together.<br>
                            An atom appeared as the result of this combintion.<br>
                            All of your resources could be boosted with atoms.` },
            style:{"width":"400px"},
            unlocked(){return player.a.unlocked}
        },
    },
})
