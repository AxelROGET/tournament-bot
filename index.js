const Discord = require('discord.js');
const client = new Discord.Client();

let flipFlop;
let user;
let userId;

let whitelist = [];

client.login(process.env.TOKEN);

client.on('ready',()=>{client.user.setActivity('Darwin Project', { type: 'PLAYING' })})

client.on('message', (message) => {

    if(whitelist.includes(message.member.id) && (message.content === "!mute" || message.content === "!demute") && message.member.voice.channelID){
        switch (message.content){
            case "!mute":
                message.member.voice.setMute(true);
                break;
            case "!demute":
                message.member.voice.setMute(false);
                break;
        }
    }

    // Les commandes qui suivent sont réservées aux administrateurs
    if(message.member.hasPermission('ADMINISTRATOR') === false) return;

    if(message.content === "!game start" && message.member.voice.channelID){flipFlop = muteDemute(true, message);
        message.channel.send("```Que la partie commence !```");}
 
    else if(message.content === "!game finish" && message.member.voice.channelID) {flipFlop = muteDemute(false, message); 
        message.channel.send("```La partie est terminée, vous pouvez de nouveau parler.```");}

    else if(message.content.startsWith('!whitelist add')){ // Ajouter quelqu'un à la whitelist
        user = message.content.substring(15);
        userId = user.substring(3).slice(0,-1);
        message.channel.send(`${user} est maintenant whitelisté. Il peut désormais utiliser la commande **!mute** et **!demute** et ne sera plus affecté par les mute/demute généraux.`);
        whitelist.push(userId);
    }

    else if(message.content.startsWith('!whitelist remove')){ // Supprimer quelqu'un de la whitelist
        user = message.content.substring(18);
        userId = user.substring(3).slice(0,-1);
        message.channel.send(`${user} n'est plus whitelisté.`);
        whitelist.splice(whitelist.indexOf(userId));
    }

    else if(message.content === "!whitelist list"){
        let whitelistList = "";

        for(let i=0; i < whitelist.length; i++){
            whitelistList = whitelistList + ", " + client.users.cache.get(whitelist[i]).username;
        }
        message.channel.send("```Whitelist :" + whitelistList.substring(1) + "```");
    }

})

// Mute/demute tous les utilisateurs d'un canal lorsque la commande est effectuée
function muteDemute(flipFlop, message) {
    console.log("Flip/flop : " + flipFlop);

    let membersConnected = message.member.voice.channel.members.array();

    for(let i=0; i < membersConnected.length ; i++){
        if(!whitelist.includes(membersConnected[i].id))
        membersConnected[i].voice.setMute(flipFlop);
    }

    return(flipFlop);

}

// Actualiser son status de "mute" lorsqu'un utilisateur rejoint un channel en fonction du flipflop
client.on('voiceStateUpdate',(oldState, newState)=>{
    if(!oldState.channelID && newState.channelID && newState.mute !== flipFlop) newState.member.voice.setMute(flipFlop);
})

