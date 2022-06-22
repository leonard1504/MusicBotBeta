const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { color, riotapikey, iron, bronze, silver, gold, plat, dia, master, grandmaster, challenger, leaveemoji, loadingemoji, skipemoji, backemoji } = require('../config.json');
const { LolApi, Constants } = require('twisted');
const fetch = require('cross-fetch');
const paginationEmbed = require('../queuepagination');
const log = require('../leagueofgraphs');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lolstats')
        .addStringOption(option => option.setName('spielername').setRequired(true).setDescription("Gebe hier deinen Summonername ein"))
        .addStringOption(option => option.setName('region').setRequired(true).setDescription("Gebe hier deine Region ein").addChoices({name: 'Westeuropa', value: Constants.Regions.EU_WEST}).addChoices({name:'Osteuropa', value: Constants.Regions.EU_EAST}).addChoices({name:'Brasilien', value: Constants.Regions.BRAZIL}).addChoices({name: 'Japan', value: Constants.Regions.JAPAN}).addChoices({name: 'Korea', value: Constants.Regions.KOREA}).addChoices({name: 'Lateinamerika Nord', value: Constants.Regions.LAT_NORTH}).addChoices({name:'Lateinamerika Süd', value: Constants.Regions.LAT_SOUTH}).addChoices({name: 'Nordamerika', value: Constants.Regions.AMERICA_NORTH}).addChoices({name: 'Ozeanien', value: Constants.Regions.OCEANIA}).addChoices({name: 'Russland', value: Constants.Regions.RUSSIA}).addChoices({name: 'Türkei', value: Constants.Regions.TURKEY}))
		.setDescription('Zeigt die League of Legends Stats an'),
	async execute(interaction) {
        let wlratioflex, wlratiosolo, solostring, flexstring, soloranksymbol, flexranksymbol, summoner, rankedmmr, normalmmr, arammmr, soloduofirstname, soloduofirst, normalfirst, normalfirstname, flexfirst, flexfirstname, soloduosecondname, soloduosecond, normalsecond, normalsecondname, flexsecondname, flexsecond, soloduothird, soloduothirdname, normalthird, normalthirdname, flexthird, flexthirdname, normallanes, flexlanes, soloduolaness = "";
        let championsMastery = [];
        let topthreechampsMastery = [];
        let last10games;
        let getVersion = await fetch(`https://ddragon.leagueoflegends.com/api/versions.json`).then((resp) => resp.json());
        switch(interaction.options.get('region').value) {
            case Constants.Regions.EU_WEST:
                mmrregion = "euw";
                queryregion = "euw";
            break;
            case Constants.Regions.EU_EAST:
                mmrregion = "eune";
                queryregion = "eune";
            break;
            case Constants.Regions.RUSSIA:
                mmrregion = "eune";
                queryregion = "ru";
            break;
            case Constants.Regions.KOREA:
                mmrregion = "kr";
                queryregion = "kr";
            break;
            case Constants.Regions.OCEANIA:
                queryregion = "oce";
                mmrregion = "na";
            break;
            case Constants.Regions.JAPAN:
                queryregion = "jp";
                mmrregion = "na";
            break;
            case Constants.Regions.LAT_NORTH:
                queryregion = "lan";
                mmrregion = "na";
            break;
            case Constants.Regions.LAT_SOUTH:
                queryregion = "las";
                mmrregion = "na";
            break;
            case Constants.Regions.BRAZIL:
                queryregion = "br";
                mmrregion = "na";
            break;
            case Constants.Regions.TURKEY:
                queryregion = "tr";
                mmrregion = "na";
            break;
            default: 
                mmrregion = "na";
                queryregion = "na";
            break;
        }
        let getMMR = await fetch(`https://${mmrregion}.whatismymmr.com/api/v1/summoner?name=${encodeURI(interaction.options.get('spielername').value)}`).then((resp) => resp.json());

        if (interaction.member.nickname != null) {
            nick = interaction.member.nickname;
        } else {
            nick = interaction.user.username;
        }
        userpp = interaction.user.avatarURL();
        const embedwaiting = new MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`${loadingemoji} Informationen zu **${interaction.options.get('spielername').value}** werden gesammelt...`)
            .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);
        await interaction.reply({
            embeds: [embedwaiting]
        });

        const api = new LolApi({ key: `${riotapikey}`, rateLimitRetry: true, rateLimitRetryAttempts: 3});

        try {
            summoner = await api.Summoner.getByName(interaction.options.get('spielername').value, interaction.options.get('region').value);
        } catch(e) {
            if(e.status === 404) {
                const embedusernotfound = new MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Tut mir leid`)
                    .setDescription(`${leaveemoji} Ich konnte keinen Nutzer mit dem Namen **${interaction.options.get('spielername').value}** in der angegebenen Region finden.`)
                    .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);
		        await interaction.reply({ ephemeral: true, embeds: [embedusernotfound] });
            }
        }

        const champion = await api.Champion.masteryBySummoner(summoner.response.id, interaction.options.get('region').value);
        let champions = await fetch(`http://ddragon.leagueoflegends.com/cdn/${getVersion[4]}/data/de_DE/champion.json`).then((resp) => resp.json());
     
        for(let i = 0; i <= 2; i++) {
            championsMastery.push(champion.response[i]);
            for(let j = 0; j < Object.values(champions.data).length; j++) {
                if(Object.values(champions.data)[j].key == championsMastery[i].championId) {
                    topthreechampsMastery.push(Object.values(champions.data)[j]);
                    break;
                }
            }
        }
        
        const rank = await api.League.bySummoner(summoner.response.id, interaction.options.get('region').value);

        if(rank.response.length > 0) {
            for(let x = 0; rank.response.length > x; x++) {
                switch(rank.response[x].queueType) {
                    case "RANKED_SOLO_5x5":
                        switch(rank.response[x].tier) {
                            case "IRON":
                                soloranksymbol = `${iron}`;
                            break;
                            case "BRONZE":
                                soloranksymbol = `${bronze}`;
                            break;
                            case "SILVER":
                                soloranksymbol = `${silver}`;
                            break;
                            case "GOLD":
                                soloranksymbol = `${gold}`;
                            break;
                            case "PLATINUM":
                                soloranksymbol = `${plat}`;
                            break;
                            case "DIAMOND":
                                soloranksymbol = `${dia}`;
                            break;
                            case "MASTER":
                                soloranksymbol = `${master}`;
                            break;
                            case "GRANDMASTER":
                                soloranksymbol = `${grandmaster}`;
                            break;
                            case "CHALLENGER":
                                soloranksymbol = `${challenger}`;
                            break;
                        }; 
                        wlratiosolo = Math.round((rank.response[x].wins/(rank.response[x].wins+rank.response[x].losses))*100);
                        solostring = `**${soloranksymbol} ${rank.response[x].tier} ${rank.response[x].rank}** \n LP: ${rank.response[x].leaguePoints} \n Gewonnen: ${rank.response[x].wins} \n Verloren: ${rank.response[x].losses} \n Winrate: ${wlratiosolo}%`;  
                break;
                case "RANKED_FLEX_SR":  
                    switch(rank.response[x].tier) {
                        case "IRON":
                            flexranksymbol = `${iron}`;
                        break;
                        case "BRONZE":
                            flexranksymbol = `${bronze}`;
                        break;
                        case "SILVER":
                            flexranksymbol = `${silver}`;
                        break;
                        case "GOLD":
                            flexranksymbol = `${gold}`;
                        break;
                        case "PLATINUM":
                            flexranksymbol = `${plat}`;
                        break;
                        case "DIAMOND":
                            flexranksymbol = `${dia}`;
                        break;
                        case "MASTER":
                            flexranksymbol = `${master}`;
                        break;
                        case "GRANDMASTER":
                            flexranksymbol = `${grandmaster}`;
                        break;
                        case "CHALLENGER":
                            flexranksymbol = `${challenger}`;
                        break
                    };
                    wlratioflex = Math.round((rank.response[x].wins/(rank.response[x].wins+rank.response[x].losses))*100);
                    flexstring = `**${flexranksymbol} ${rank.response[x].tier} ${rank.response[x].rank}** \n LP: ${rank.response[x].leaguePoints} \n Gewonnen: ${rank.response[x].wins} \n Verloren: ${rank.response[x].losses} \n Winrate: ${wlratioflex}%`;
                break;
                default: 
                    if(rank.response[x].queueType !== "RANKED_FLEX_SR") {
                        flexstring = `${leaveemoji} Keine Ranglistendaten gefunden`;
                    } else if(rank.response[x].queueType !== "RANKED_SOLO_5x5") {
                        solostring = `${leaveemoji} Keine Ranglistendaten gefunden`;
                    }
                break;
                }
            }
        }      
        try {
            if(getMMR.ranked.avg != null) {
                rankedmmr = `Die MMR in Rangliste beträgt circa **${getMMR.ranked.avg}** \n Damit wäre **${interaction.options.get('spielername').value}** circa **${getMMR.ranked.closestRank}**`;
            } else {
                rankedmmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in Rangliste** vor um die MMR zu berechnen.`;
            }
            if(getMMR.normal.avg != null) {
                normalmmr = `Die MMR in Normal beträgt circa **${getMMR.normal.avg}** \n Damit wäre **${interaction.options.get('spielername').value}** circa **${getMMR.normal.closestRank}**`;
            } else {
                normalmmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in Normal** vor um die MMR zu berechnen.`;
            }
            if(getMMR.ARAM.avg != null) {
                arammmr = `Die MMR in ARAM beträgt circa **${getMMR.ARAM.avg}** \n Damit wäre **${interaction.options.get('spielername').value}** circa **${getMMR.ARAM.closestRank}**`;
            } else {
                arammmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in ARAM** vor um die MMR zu berechnen.`;
            }
        } catch(e) {
            rankedmmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in Rangliste** vor um die MMR zu berechnen.`;
            normalmmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in Normal** vor um die MMR zu berechnen.`;
            arammmr = `${leaveemoji} Es liegen noch nicht genügend **Solospiele in ARAM** vor um die MMR zu berechnen.`;
        }
        all = [];
        flex = [];
        solo = [];
        try {
            const allQueueChamp = await log.getChampStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'all', 3);
            const soloQueueChamp = await log.getChampStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'solo', 3);
            const flexQueueChamp = await log.getChampStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'flex', 3);
            const allQueueLane = await log.getLaneStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'all');
            const soloQueueLane = await log.getLaneStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'solo');
            const flexQueueLane = await log.getLaneStats(`${queryregion}`, `${interaction.options.get('spielername').value}`, 'flex');
            last10games = await log.last10Games(`${queryregion}`, `${interaction.options.get('spielername').value}`);
            normallanes = `\n ${interaction.options.get('spielername').value} hat in Normals und Ranked-Queue`;
            try {
                for(let i = 0; i < allQueueLane.length; i++) {
                    normallanestring = `\n **${allQueueLane[i].rounds} ${allQueueLane[i].lane}**-Spiele`;
                    normallanes += normallanestring;
                }
            } catch {
                normallanes = `${leaveemoji} Es liegen für diesen Nutzer keine Normals & Ranked-Queue Daten vor.`;
            }
            soloduolanes = `\n ${interaction.options.get('spielername').value} hat in Solo/Duo-Queue`;
            try {
                for(let i = 0; i < soloQueueLane.length; i++) {
                    soloduolanestring = `\n **${soloQueueLane[i].rounds} ${soloQueueLane[i].lane}**-Spiele`;
                    soloduolanes += soloduolanestring;
                }
            } catch {
                soloduolanes = `${leaveemoji} Es liegen für diesen Nutzer keine Solo/Duo-Queue Daten vor.`;
            }
            flexlanes = `\n ${interaction.options.get('spielername').value} hat in Flex-Queue`;
            try {
                for(let i = 0; i < flexQueueLane.length; i++) {
                    flexlanestring = `\n **${flexQueueLane[i].rounds} ${flexQueueLane[i].lane}**-Spiele`;
                    flexlanes += flexlanestring;
                }
            } catch {
                flexlanes = `${leaveemoji} Es liegen für diesen Nutzer keine Flex-Queue Daten vor.`;
            }
            try {
                normalfirstname = `**${allQueueChamp[0].name}**`;
                normalfirst = `Gespielt: **${allQueueChamp[0].rounds}** \n Winrate: **${allQueueChamp[0].wr}** \n Ø KDA: \n **${allQueueChamp[0].kills} / ${allQueueChamp[0].deaths} / ${allQueueChamp[0].assists}** \n Ø CS: **${allQueueChamp[0].cs}** \n Ø GPM: **${allQueueChamp[0].gpm}** \n Pentakills: **${allQueueChamp[0].penta}**`;
            } catch {
                normalfirst = `\u200b`;
                normalfirstname = `${leaveemoji} Keine Stats gefunden.`;
            }
            try {
                normalsecondname = `**${allQueueChamp[1].name}**`;
                normalsecond = `Gespielt: **${allQueueChamp[1].rounds}** \n Winrate: **${allQueueChamp[1].wr}** \n Ø KDA: \n **${allQueueChamp[1].kills} / ${allQueueChamp[1].deaths} / ${allQueueChamp[1].assists}** \n Ø CS: **${allQueueChamp[1].cs}** \n Ø GPM: **${allQueueChamp[1].gpm}** \n Pentakills: **${allQueueChamp[1].penta}**`;
            } catch {
                normalsecond = `\u200b`
                normalsecondname = `${leaveemoji} Keine Stats gefunden.`
            }
            try {
                normalthirdname = `**${allQueueChamp[2].name}**`;
                normalthird = `Gespielt: **${allQueueChamp[2].rounds}** \n Winrate: **${allQueueChamp[2].wr}** \n Ø KDA: \n **${allQueueChamp[2].kills} / ${allQueueChamp[2].deaths} / ${allQueueChamp[2].assists}** \n Ø CS: **${allQueueChamp[2].cs}** \n Ø GPM: **${allQueueChamp[2].gpm}** \n Pentakills: **${allQueueChamp[2].penta}**`;
            } catch {
                normalthird = `\u200b`
                normalthirdname = `${leaveemoji} Keine Stats gefunden.`
            }
            try {
                soloduofirstname = `**${soloQueueChamp[0].name}**`;
                soloduofirst = `Gespielt: **${soloQueueChamp[0].rounds}** \n Winrate: **${soloQueueChamp[0].wr}** \n Ø KDA: \n **${soloQueueChamp[0].kills} / ${soloQueueChamp[0].deaths} / ${soloQueueChamp[0].assists}** \n Ø CS: **${soloQueueChamp[0].cs}** \n Ø GPM: **${soloQueueChamp[0].gpm}** \n Pentakills: **${soloQueueChamp[0].penta}**`;
            } catch {
                soloduofirst = `\u200b`;
                soloduofirstname = `${leaveemoji} Keine Stats gefunden.`;
            }
            try {
                soloduosecondname = `**${soloQueueChamp[1].name}**`;
                soloduosecond = `Gespielt: **${soloQueueChamp[1].rounds}** \n Winrate: **${soloQueueChamp[1].wr}** \n Ø KDA: \n **${soloQueueChamp[1].kills} / ${soloQueueChamp[1].deaths} / ${soloQueueChamp[1].assists}** \n Ø CS: **${soloQueueChamp[1].cs}** \n Ø GPM: **${soloQueueChamp[1].gpm}** \n Pentakills: **${soloQueueChamp[1].penta}**`;
            } catch {
                soloduosecond = `\u200b`
                soloduosecondname = `${leaveemoji} Keine Stats gefunden.`
            }
            try {
                soloduothirdname = `**${soloQueueChamp[2].name}**`;
                soloduothird = `Gespielt: **${soloQueueChamp[2].rounds}** \n Winrate: **${soloQueueChamp[2].wr}** \n Ø KDA: \n **${soloQueueChamp[2].kills} / ${soloQueueChamp[2].deaths} / ${soloQueueChamp[2].assists}** \n Ø CS: **${soloQueueChamp[2].cs}** \n Ø GPM: **${soloQueueChamp[2].gpm}** \n Pentakills: **${soloQueueChamp[2].penta}**`;
            } catch {
                soloduothird = `\u200b`
                soloduothirdname = `${leaveemoji} Keine Stats gefunden.`
            }
            try {
                flexfirstname = `**${flexQueueChamp[0].name}**`;
                flexfirst = `Gespielt: **${flexQueueChamp[0].rounds}** \n Winrate: **${flexQueueChamp[0].wr}** \n Ø KDA: \n **${flexQueueChamp[0].kills} / ${flexQueueChamp[0].deaths} / ${flexQueueChamp[0].assists}** \n Ø CS: **${flexQueueChamp[0].cs}** \n Ø GPM: **${flexQueueChamp[0].gpm}** \n Pentakills: **${flexQueueChamp[0].penta}**`;
            } catch {
                flexfirst = `\u200b`;
                flexfirstname = `${leaveemoji} Keine Stats gefunden.`;
            }
            try {
                flexsecondname = `**${flexQueueChamp[1].name}**`;
                flexsecond = `Gespielt: **${flexQueueChamp[1].rounds}** \n Winrate: **${flexQueueChamp[1].wr}** \n Ø KDA: \n **${flexQueueChamp[1].kills} / ${flexQueueChamp[1].deaths} / ${flexQueueChamp[1].assists}** \n Ø CS: **${flexQueueChamp[1].cs}** \n Ø GPM: **${flexQueueChamp[1].gpm}** \n Pentakills: **${flexQueueChamp[1].penta}**`;
            } catch {
                flexsecond = `\u200b`
                flexsecondname = `${leaveemoji} Keine Stats gefunden.`
            }
            try {
                flexthirdname = `**${flexQueueChamp[2].name}**`;
                flexthird = `Gespielt: **${flexQueueChamp[2].rounds}** \n Winrate: **${flexQueueChamp[2].wr}** \n Ø KDA: \n **${flexQueueChamp[2].kills} / ${flexQueueChamp[2].deaths} / ${flexQueueChamp[2].assists}** \n Ø CS: **${flexQueueChamp[2].cs}** \n Ø GPM: **${flexQueueChamp[2].gpm}** \n Pentakills: **${flexQueueChamp[2].penta}**`;
            } catch {
                flexthird = `\u200b`
                flexthirdname = `${leaveemoji} Keine Stats gefunden.`
            }
        } catch(e) {
            console.log(e);
        }
        if(flexstring === undefined || flexstring === "undefined") {
            flexstring = `${leaveemoji} Keine Ranglistendaten gefunden`;
        }
        if(solostring === undefined || solostring === "undefined") {
            solostring = `${leaveemoji} Keine Ranglistendaten gefunden`;
        }

        const embeduserprofile = new MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`Stats für ${summoner.response.name}`)
        .setDescription(`Spielername: **${summoner.response.name}** \n Level: **${summoner.response.summonerLevel}**`)
        .addFields(
        {
            name: `\u200b`,
            value: `**Rangliste**`,
        },
        {
            name: `Solo/Duo-Queue`,
            value: `${solostring}`,
            inline: true,
        },
        {
            name: `Flex-Queue`,
            value: `${flexstring}`,
            inline: true,
        },
        )
        .addFields(
        {
            name:`\u200b`,
            value: `**MMR**`,
        },
        {
            name:`Ranglisten MMR`,
            value: `${rankedmmr}`,
            inline: true,
        },
        {
            name:`Normal MMR`,
            value: `${normalmmr}`,
            inline: true,
        },
        {
            name:`ARAM MMR`,
            value: `${arammmr}`,
            inline: true,
        },
        )
        .addFields(
        {
            name:`\u200b`,
            value: `**Laneverteilung**`,
        },
        {
            name:`Normal & Ranked`,
            value: `${normallanes}`,
            inline: true,
        },
        {
            name:`Solo/Duo-Queue`,
            value: `${soloduolanes}`,
            inline: true,
        },
        {
            name:`Flex-Queue`,
            value: `${flexlanes}`,
            inline: true,
        },
        )
        .setURL(`https://leagueofgraphs.com/de/summoner/${queryregion}/${encodeURI(interaction.options.get("spielername").value)}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${getVersion[0]}/img/profileicon/${summoner.response.profileIconId}.png`)
        .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);

        const embeduserprofile2 = new MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`Stats für ${summoner.response.name}`)
        .addFields(
        {   
            name: `\u200b`,
            value: `**Top 3 Champs - Höchste Meisterschaftspunkte**`,
        },
        {
            name: `${topthreechampsMastery[0].name}`,
            value: `Masterylevel **${championsMastery[0].championLevel}** \n Masterypoints \n **${championsMastery[0].championPoints}**`,
            inline: true,
        },
        {
            name: `${topthreechampsMastery[1].name}`,
            value: `Masterylevel **${championsMastery[1].championLevel}** \n Masterypoints \n **${championsMastery[1].championPoints}**`,
            inline: true,
        },
        {
            name: `${topthreechampsMastery[2].name}`,
            value: `Masterylevel **${championsMastery[2].championLevel}** \n Masterypoints \n **${championsMastery[2].championPoints}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\u200b`,
            value: `**Top 3 Champs in Normals & Ranked - Am häufigsten gespielt**`,
        },
        {
            name: `${normalfirstname}`,
            value: `${normalfirst}`,
            inline: true,
        },
        {
            name: `${normalsecondname}`,
            value: `${normalsecond}`,
            inline: true,
        },
        {
            name: `${normalthirdname}`,
            value: `${normalthird}`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\u200b`,
            value: `**Top 3 Champs in Solo/Duo-Queue - Am häufigsten gespielt**`,
        },
        {
            name: `${soloduofirstname}`,
            value: `${soloduofirst}`,
            inline: true,
        },
        {
            name: `${soloduosecondname}`,
            value: `${soloduosecond}`,
            inline: true,
        },
        {
            name: `${soloduothirdname}`,
            value: `${soloduothird}`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\u200b`,
            value: `**Top 3 Champs in Flex-Queue - Am häufigsten gespielt**`,
        },
        {
            name: `${flexfirstname}`,
            value: `${flexfirst}`,
            inline: true,
        },
        {
            name: `${flexsecondname}`,
            value: `${flexsecond}`,
            inline: true,
        },
        {
            name: `${flexthirdname}`,
            value: `${flexthird}`,
            inline: true,
        },
        )
        .setURL(`https://leagueofgraphs.com/de/summoner/${queryregion}/${encodeURI(interaction.options.get("spielername").value)}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${getVersion[0]}/img/profileicon/${summoner.response.profileIconId}.png`)
        .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);
        
        const embeduserprofile3 = new MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`Stats für ${summoner.response.name}`)
        .addFields(
        {   
            name: `\u200b`,
            value: `**Letzten 10 Spiele** - Seite 1 von 2`,
        },
        {
            name: `${last10games[0].mode} - ${last10games[0].result}`,
            value: `Champion: **${last10games[0].champ}** \n Summoner Spells: **${last10games[0].summ1}** & **${last10games[0].summ2}** \n KDA: **${last10games[0].kills}** / **${last10games[0].deaths}** / **${last10games[0].assists}** \n CS: **${last10games[0].cs}** \n Items: **${last10games[0].item1}**, **${last10games[0].item2}**, **${last10games[0].item3}**, **${last10games[0].item4}**, **${last10games[0].item5}**, **${last10games[0].item6}**, **${last10games[0].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[0].blueSide1}** \n **${last10games[0].blueSide2}** \n **${last10games[0].blueSide3}** \n **${last10games[0].blueSide4}** \n **${last10games[0].blueSide5}** \n Spieldauer: **${last10games[0].time_played}** \n Gespielt ${last10games[0].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[0].redSide1}** \n **${last10games[0].redSide2}** \n **${last10games[0].redSide3}** \n **${last10games[0].redSide4}** \n **${last10games[0].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[1].mode} - ${last10games[1].result}`,
            value: `Champion: **${last10games[1].champ}** \n Summoner Spells: **${last10games[1].summ1}** & **${last10games[1].summ2}** \n KDA: **${last10games[1].kills}** / **${last10games[1].deaths}** / **${last10games[1].assists}** \n CS: **${last10games[1].cs}** \n Items: **${last10games[1].item1}**, **${last10games[1].item2}**, **${last10games[1].item3}**, **${last10games[1].item4}**, **${last10games[1].item5}**, **${last10games[1].item6}**, **${last10games[1].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[1].blueSide1}** \n **${last10games[1].blueSide2}** \n **${last10games[1].blueSide3}** \n **${last10games[1].blueSide4}** \n **${last10games[1].blueSide5}** \n Spieldauer: **${last10games[1].time_played}** \n Gespielt ${last10games[1].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[1].redSide1}** \n **${last10games[1].redSide2}** \n **${last10games[1].redSide3}** \n **${last10games[1].redSide4}** \n **${last10games[1].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[2].mode} - ${last10games[2].result}`,
            value: `Champion: **${last10games[2].champ}** \n Summoner Spells: **${last10games[2].summ1}** & **${last10games[2].summ2}** \n KDA: **${last10games[2].kills}** / **${last10games[2].deaths}** / **${last10games[2].assists}** \n CS: **${last10games[2].cs}** \n Items: **${last10games[2].item1}**, **${last10games[2].item2}**, **${last10games[2].item3}**, **${last10games[2].item4}**, **${last10games[2].item5}**, **${last10games[2].item6}**, **${last10games[2].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[2].blueSide1}** \n **${last10games[2].blueSide2}** \n **${last10games[2].blueSide3}** \n **${last10games[2].blueSide4}** \n **${last10games[2].blueSide5}** \n Spieldauer: **${last10games[2].time_played}** \n Gespielt ${last10games[2].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[2].redSide1}** \n **${last10games[2].redSide2}** \n **${last10games[2].redSide3}** \n **${last10games[2].redSide4}** \n **${last10games[2].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[3].mode} - ${last10games[3].result}`,
            value: `Champion: **${last10games[3].champ}** \n Summoner Spells: **${last10games[3].summ1}** & **${last10games[3].summ2}** \n KDA: **${last10games[3].kills}** / **${last10games[3].deaths}** / **${last10games[3].assists}** \n CS: **${last10games[3].cs}** \n Items: **${last10games[3].item1}**, **${last10games[3].item2}**, **${last10games[3].item3}**, **${last10games[3].item4}**, **${last10games[3].item5}**, **${last10games[3].item6}**, **${last10games[3].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[3].blueSide1}** \n **${last10games[3].blueSide2}** \n **${last10games[3].blueSide3}** \n **${last10games[3].blueSide4}** \n **${last10games[3].blueSide5}** \n Spieldauer: **${last10games[3].time_played}** \n Gespielt ${last10games[3].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[3].redSide1}** \n **${last10games[3].redSide2}** \n **${last10games[3].redSide3}** \n **${last10games[3].redSide4}** \n **${last10games[3].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[4].mode} - ${last10games[4].result}`,
            value: `Champion: **${last10games[4].champ}** \n Summoner Spells: **${last10games[4].summ1}** & **${last10games[4].summ2}** \n KDA: **${last10games[4].kills}** / **${last10games[4].deaths}** / **${last10games[4].assists}** \n CS: **${last10games[4].cs}** \n Items: **${last10games[4].item1}**, **${last10games[4].item2}**, **${last10games[4].item3}**, **${last10games[4].item4}**, **${last10games[4].item5}**, **${last10games[4].item6}**, **${last10games[4].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[4].blueSide1}** \n **${last10games[4].blueSide2}** \n **${last10games[4].blueSide3}** \n **${last10games[4].blueSide4}** \n **${last10games[4].blueSide5}** \n Spieldauer: **${last10games[4].time_played}** \n Gespielt ${last10games[4].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[4].redSide1}** \n **${last10games[4].redSide2}** \n **${last10games[4].redSide3}** \n **${last10games[4].redSide4}** \n **${last10games[4].redSide5}**`,
            inline: true,
        },
        )
        .setURL(`https://leagueofgraphs.com/de/summoner/${queryregion}/${encodeURI(interaction.options.get("spielername").value)}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${getVersion[0]}/img/profileicon/${summoner.response.profileIconId}.png`)
        .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);

        const embeduserprofile4 = new MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`Stats für ${summoner.response.name}`)
        .addFields(
        {   
            name: `\u200b`,
            value: `**Letzten 10 Spiele** - Seite 2 von 2`,
        },
        {
            name: `${last10games[5].mode} - ${last10games[5].result}`,
            value: `Champion: **${last10games[5].champ}** \n Summoner Spells: **${last10games[5].summ1}** & **${last10games[5].summ2}** \n KDA: **${last10games[5].kills}** / **${last10games[5].deaths}** / **${last10games[5].assists}** \n CS: **${last10games[5].cs}** \n Items: **${last10games[5].item1}**, **${last10games[5].item2}**, **${last10games[5].item3}**, **${last10games[5].item4}**, **${last10games[5].item5}**, **${last10games[5].item6}**, **${last10games[5].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[5].blueSide1}** \n **${last10games[5].blueSide2}** \n **${last10games[5].blueSide3}** \n **${last10games[5].blueSide4}** \n **${last10games[5].blueSide5}** \n Spieldauer: **${last10games[5].time_played}** \n Gespielt ${last10games[5].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[5].redSide1}** \n **${last10games[5].redSide2}** \n **${last10games[5].redSide3}** \n **${last10games[5].redSide4}** \n **${last10games[5].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[6].mode} - ${last10games[6].result}`,
            value: `Champion: **${last10games[6].champ}** \n Summoner Spells: **${last10games[6].summ1}** & **${last10games[6].summ2}** \n KDA: **${last10games[6].kills}** / **${last10games[6].deaths}** / **${last10games[6].assists}** \n CS: **${last10games[6].cs}** \n Items: **${last10games[6].item1}**, **${last10games[6].item2}**, **${last10games[6].item3}**, **${last10games[6].item4}**, **${last10games[6].item5}**, **${last10games[6].item6}**, **${last10games[6].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[6].blueSide1}** \n **${last10games[6].blueSide2}** \n **${last10games[6].blueSide3}** \n **${last10games[6].blueSide4}** \n **${last10games[6].blueSide5}** \n Spieldauer: **${last10games[6].time_played}** \n Gespielt ${last10games[6].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[6].redSide1}** \n **${last10games[6].redSide2}** \n **${last10games[6].redSide3}** \n **${last10games[6].redSide4}** \n **${last10games[6].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[7].mode} - ${last10games[7].result}`,
            value: `Champion: **${last10games[7].champ}** \n Summoner Spells: **${last10games[7].summ1}** & **${last10games[7].summ2}** \n KDA: **${last10games[7].kills}** / **${last10games[7].deaths}** / **${last10games[7].assists}** \n CS: **${last10games[7].cs}** \n Items: **${last10games[7].item1}**, **${last10games[7].item2}**, **${last10games[7].item3}**, **${last10games[7].item4}**, **${last10games[7].item5}**, **${last10games[7].item6}**, **${last10games[7].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[7].blueSide1}** \n **${last10games[7].blueSide2}** \n **${last10games[7].blueSide3}** \n **${last10games[7].blueSide4}** \n **${last10games[7].blueSide5}** \n Spieldauer: **${last10games[7].time_played}** \n Gespielt ${last10games[7].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[7].redSide1}** \n **${last10games[7].redSide2}** \n **${last10games[7].redSide3}** \n **${last10games[7].redSide4}** \n **${last10games[7].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[8].mode} - ${last10games[8].result}`,
            value: `Champion: **${last10games[8].champ}** \n Summoner Spells: **${last10games[8].summ1}** & **${last10games[8].summ2}** \n KDA: **${last10games[8].kills}** / **${last10games[8].deaths}** / **${last10games[8].assists}** \n CS: **${last10games[8].cs}** \n Items: **${last10games[8].item1}**, **${last10games[8].item2}**, **${last10games[8].item3}**, **${last10games[8].item4}**, **${last10games[8].item5}**, **${last10games[8].item6}**, **${last10games[8].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[8].blueSide1}** \n **${last10games[8].blueSide2}** \n **${last10games[8].blueSide3}** \n **${last10games[8].blueSide4}** \n **${last10games[8].blueSide5}** \n Spieldauer: **${last10games[8].time_played}** \n Gespielt ${last10games[8].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[8].redSide1}** \n **${last10games[8].redSide2}** \n **${last10games[8].redSide3}** \n **${last10games[8].redSide4}** \n **${last10games[8].redSide5}**`,
            inline: true,
        },
        )
        .addFields(
        {
            name: `\n${last10games[9].mode} - ${last10games[9].result}`,
            value: `Champion: **${last10games[9].champ}** \n Summoner Spells: **${last10games[9].summ1}** & **${last10games[9].summ2}** \n KDA: **${last10games[9].kills}** / **${last10games[9].deaths}** / **${last10games[9].assists}** \n CS: **${last10games[9].cs}** \n Items: **${last10games[9].item1}**, **${last10games[9].item2}**, **${last10games[9].item3}**, **${last10games[9].item4}**, **${last10games[9].item5}**, **${last10games[9].item6}**, **${last10games[9].item7}** \n`,
            inline: false,
        },
        {
            name: `Blue Side Team`,
            value: `**${last10games[9].blueSide1}** \n **${last10games[9].blueSide2}** \n **${last10games[9].blueSide3}** \n **${last10games[9].blueSide4}** \n **${last10games[9].blueSide5}** \n Spieldauer: **${last10games[9].time_played}** \n Gespielt ${last10games[9].time}`,
            inline: true,
        },
        {
            name: `Red Side Team`,
            value: `**${last10games[9].redSide1}** \n **${last10games[9].redSide2}** \n **${last10games[9].redSide3}** \n **${last10games[9].redSide4}** \n **${last10games[9].redSide5}**`,
            inline: true,
        },
        )
        .setURL(`https://leagueofgraphs.com/de/summoner/${queryregion}/${encodeURI(interaction.options.get("spielername").value)}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${getVersion[0]}/img/profileicon/${summoner.response.profileIconId}.png`)
        .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);

        const button1 = new MessageButton()
        .setCustomId('previousbtn')
        .setEmoji(`${backemoji}`)
        .setStyle('SECONDARY');

        const button2 = new MessageButton()
        .setCustomId('nextbtn')
        .setEmoji(`${skipemoji}`)
        .setStyle('SECONDARY');

        buttonList = [ button1, button2 ];
        if(last10games.length < 10) {
            embedpages = [ embeduserprofile, embeduserprofile2 ];
        } else {
            embedpages = [ embeduserprofile, embeduserprofile2, embeduserprofile3, embeduserprofile4 ];
        }

        const timeout = 30000;
        interaction.deleteReply();
        paginationEmbed.interactionLyricsEmbed(interaction, embedpages, buttonList, timeout);
    },
};