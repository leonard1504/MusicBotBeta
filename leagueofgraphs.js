const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());

async function getChampStats(queryregion, summoner, queuetype, amount) {
    let championsDataString;
    switch(queuetype) {
        case "all":
            championsDataString = "championsData-all-queues";
            break;
        case "solo":
            championsDataString = "championsData-soloqueue";
            break;
        case "flex":
            championsDataString = "championsData-flex";
            break;
    }
    url = `https://www.leagueofgraphs.com/de/summoner/champions/${queryregion}/${summoner}#${championsDataString}`;
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.setDefaultTimeout(10000);
    await page.waitForSelector("button.ncmp__btn");
    const selectors = await page.$$('button.ncmp__btn')
    await selectors[1].click();

    const tables_all_queues = await page.$$("div.content.active tr td div.txt span, div.content.active tr td div.progressBarTxt, div.content.active tr td.text-center a.full-cell");
    let champs = [];
    let topChamps = [];
    let i = 1;
    let getChamp, champName, champRounds, champWR, champKills, champDeaths, champAssists, champCSPMin, champGPM, champPenta;
    for(const div of tables_all_queues) {
        getChamp = await page.evaluate(el => el.textContent, div);
        switch(i) {
            case 1:
                champName = getChamp.replaceAll("\n", "").replaceAll(/\s/g, '');
                break;
            case 2:
                champRounds = getChamp;
                break;
            case 3:
                champWR = getChamp;
                break;
            case 4:
                let kda = getChamp.replaceAll("\n", "").replaceAll(/\s/g, '').split("/");
                champKills = kda[0];
                champDeaths = kda[1];
                champAssists = kda[2];
                break;
            case 5:
                champCSPMin = getChamp.replaceAll("\n", "").replaceAll(/\s/g, '');
                break;
            case 6: 
                champGPM = getChamp.replaceAll("\n", "").replaceAll(/\s/g, '')
                break;
            case 7:
                champPenta = getChamp.replaceAll("\n", "").replaceAll(/\s/g, '')
                break;
        }
        i++;
        if(i === 8) {
            champStats = {
                name: champName,
                rounds: champRounds,
                wr: champWR,
                kills: champKills,
                deaths: champDeaths,
                assists: champAssists,
                cs: champCSPMin,
                gpm: champGPM,
                penta: champPenta
            };
            champs.push(champStats);
            i = 1; 
        }
    }
    await browser.close();
    if(amount > champs.length) {
        amount = champs.length;
    }
    for(let j = 0; j < amount; j++) {
        topChamps.push(champs[j]);
    }
    return topChamps;
}

async function getLaneStats(queryregion, summoner, queuetype) {
    let championsDataString;
    switch(queuetype) {
        case "all":
            championsDataString = "championsData-all-queues";
            break;
        case "solo":
            championsDataString = "championsData-soloqueue";
            break;
        case "flex":
            championsDataString = "championsData-flex";
            break;
    }
    url = `https://www.leagueofgraphs.com/de/summoner/${queryregion}/${summoner}#${championsDataString}`;
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.setDefaultTimeout(10000);
    await page.waitForSelector("button.ncmp__btn");
    const selectors = await page.$$('button.ncmp__btn')
    await selectors[1].click();

    const role_stats = await page.$$("div#profileRoles div.content.active tbody tr td div.txt.name, div#profileRoles div.content.active tbody tr td div.progressBarTxt");
    let getRoles;
    let allRoles = [];
    let i = 1;
    let roleLane, roleRounds, roleWR, laneInfos;
    for(const roles of role_stats) {
        getRoles = await page.evaluate(el => el.textContent, roles);
        switch(i) {
            case 1:
                roleLane = getRoles.replace(/^[^A-Z]*/g, '').replace(/[^a-z)]*$/g, '');
                break;
            case 2:
                roleRounds = getRoles;
                break;
            case 3:
                roleWR = getRoles;
                break;
        }
        i++;
        if(i === 4) {
            laneInfos = {
                lane: roleLane,
                rounds: roleRounds,
                wr: roleWR
            }
            allRoles.push(laneInfos);
            i = 1;
        } 
    }

    await browser.close();
    return allRoles;
}

async function last10Games(queryregion, summoner) {
    url = `https://www.leagueofgraphs.com/de/summoner/${queryregion}/${summoner}`;
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.setDefaultTimeout(10000);
    await page.waitForSelector("button.ncmp__btn");
    const selectors = await page.$$('button.ncmp__btn')
    await selectors[1].click();

    const recent_games = await page.$$("div.box.recentGamesBox table.recentGamesTable tbody tr td.championCellLight img, div.box.recentGamesBox table.recentGamesTable tbody tr td.championCellLight div.spells img, div.box.recentGamesBox table.recentGamesTable tbody tr td.kdaColumn a div.kda, div.box.recentGamesBox table.recentGamesTable tbody tr td.kdaColumn a div.cs, div.box.recentGamesBox table.recentGamesTable tbody tr td.resultCellLight a div, div.box.recentGamesBox table.recentGamesTable tbody tr td.itemsColumnLight img, div.box.recentGamesBox table.recentGamesTable tbody tr td.itemsColumnDark div.itemsBlock div.emptyItem, div.box.recentGamesBox table.recentGamesTable tbody tr td.summonersTdLight div.summonerColumn div a img");
    let getImageInfo, getGames;
    let recentGames = [];
    let blueSide = [];
    let redSide = [];
    let i = 1;
    let gameChamp, gameSumm1, gameSumm2, gameResult, gameMode, gameTime, gameTimePlayed, gameKills, gameDeaths, gameAssists, gameCS, gameKP, gameInfos, gameItem1, gameItem2, gameItem3, gameItem4, gameItem5, gameItem6, gameItem7, gameSummoner1, gameSummoner2, gameSummoner3, gameSummoner4,gameSummoner5, gameSummoner6, gameSummoner7, gameSummoner8, gameSummoner9, gameSummoner10;
    for(const games of recent_games) {
        if(games._remoteObject.className === "HTMLImageElement") {
            getImageInfo = await page.evaluate(el => el.alt, games);
        } else {
            getGames = await page.evaluate(el => el.textContent, games);
        }
        switch(i) {
            case 1:
                gameChamp = getImageInfo
                break;
            case 3:
                gameSumm1 = getImageInfo;
                break;
            case 4:
                gameSumm2 = getImageInfo;
                break;
            case 5:
                gameResult = getGames;
                break;
            case 6:
                gameMode = getGames.replaceAll("\n", "").replace(/^[^A-Z]*/g, '').replace(/[^A-Za-z)]*$/g, '');;
                break;
            case 7:
                gameTime = getGames.replaceAll("\n", "").replace(/^[^V]*/g, '').replace(/[^a-z]*$/g, '');
                break;
            case 8:
                gameTimePlayed = getGames.replaceAll("\n", "").replace(/^[^0-9]*/g, '').replace(/[^s]*$/g, '');
                break;
            case 10:
                let kda = getGames.replaceAll("\n", "").replaceAll(/\s/g, '').split("/");
                gameKills = kda[0];
                gameDeaths = kda[1];
                gameAssists = kda[2];
                break;
            case 11:
                let CSandKP = getGames.replaceAll("\n", "").replace(/^[^0-9]*/g, '').replace(/[^\.]*$/g, '').split("-");
                gameCS = CSandKP[0];
                gameKP = CSandKP[1];
                break;
            case 12:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem1 = "-";
                } else {
                    gameItem1 = getImageInfo;
                }
                break;
            case 13:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem2 = "-";
                } else {
                    gameItem2 = getImageInfo;
                }
                break;
            case 14:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem3 = "-";
                } else {
                    gameItem3 = getImageInfo;
                }
                break;
            case 15:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem4 = "-";
                } else {
                    gameItem4 = getImageInfo;
                }
                break;
            case 16:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem5 = "-";
                } else {
                    gameItem5 = getImageInfo;
                }
                break;
            case 17:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem6 = "-";
                } else {
                    gameItem6 = getImageInfo;
                }
                break;
            case 18:
                if(games._remoteObject.description === "div.emptyItem") {
                    gameItem7 = "-";
                } else {
                    gameItem7 = getImageInfo;
                }
                break;
            case 19:
                gameSummoner1 = getImageInfo;
                blueSide.push(gameSummoner1);
                break;
            case 20:
                gameSummoner2 = getImageInfo;
                blueSide.push(gameSummoner2);
                break;
            case 21:
                gameSummoner3 = getImageInfo;
                blueSide.push(gameSummoner3);
                break;
            case 22:
                gameSummoner4 = getImageInfo;
                blueSide.push(gameSummoner4);
                break;
            case 23:
                gameSummoner5 = getImageInfo;
                blueSide.push(gameSummoner5);
                break;
            case 24:
                gameSummoner6 = getImageInfo;
                redSide.push(gameSummoner6);
                break;
            case 25:
                gameSummoner7 = getImageInfo;
                redSide.push(gameSummoner7);
                break;
            case 26:
                gameSummoner8 = getImageInfo;
                redSide.push(gameSummoner8);
                break;
            case 27:
                gameSummoner9 = getImageInfo;
                redSide.push(gameSummoner9);
                break;
            case 28:
                gameSummoner10 = getImageInfo;
                redSide.push(gameSummoner10);
                break;    

        }
        i++;
        if(i === 29) {
            gameInfos = {
                champ: gameChamp,
                summ1: gameSumm1,
                summ2: gameSumm2,
                result: gameResult,
                mode: gameMode,
                time: gameTime,
                time_played: gameTimePlayed,
                kills: gameKills,
                deaths: gameDeaths,
                assists: gameAssists,
                cs: gameCS.replace(/[^S]*$/g, ''),
                kp: gameKP.replace(/^[^0-9]*/g, ''),
                item1: gameItem1,
                item2: gameItem2,
                item3: gameItem3,
                item4: gameItem4,
                item5: gameItem5,
                item6: gameItem6,
                item7: gameItem7,
                blueSide1: blueSide[0],
                blueSide2: blueSide[1],
                blueSide3: blueSide[2],
                blueSide4: blueSide[3],
                blueSide5: blueSide[4],
                redSide1: redSide[0],
                redSide2: redSide[1],
                redSide3: redSide[2],
                redSide4: redSide[3],
                redSide5: redSide[4]
            }
            recentGames.push(gameInfos);
            blueSide = [];
            redSide = [];
            i = 1;
        }
    }
    await browser.close();
    return recentGames;
}

async function test() {
    /*try {
        const test1 = await getChampStats("euw", "Pepperoni1905", "all", "5");
        console.log(test1[0].name);
    } catch {}
    try {
        const test2 = await getLaneStats("euw", "Pepperoni1905", "solo");
        console.log(test2);
    } catch {}*/
    try {
        const test = await last10Games("euw", "Fetzι");
        console.log(await test[0]);
    } catch {
        console.log("Letzten 10 Games konnten nicht gefunden werden")
    }
}

//test();

module.exports = { getChampStats, getLaneStats, last10Games };