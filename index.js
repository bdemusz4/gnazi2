const { CommandoClient } = require('discord.js-commando')
const path = require('path')
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
const querystring = require('querystring')
const options = { useNewUrlParser: true }
const grammarCheckAPI = 'http://localhost:8081/v2/check'
require('dotenv').config()

const client = new CommandoClient({
    commandPrefix: '$$',
    owner: '239808286742806528',
    disableEveryone: true
})

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['configure', 'Commands for configuring the bot']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'))

MongoClient.connect(process.env.URL, options, (err, dbClient) => {
    if (err) throw new Error(err)
    const db = dbClient.db('servers')
    const collection = db.collection('server')

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.username}!`)
        // client.guilds.map(guild => {
            // guild.members.map(async member => {
                // if (member.hasPermission('ADMINISTRATOR', false, true, false)) {
                    // const dmChannel = await member.createDM()
                    // dmChannel.send(
                        // 'Hi, thank you for adding the Grammar Nazi Bot to your server! \n' +
                        // 'The Grammar Nazi Bot has undergone a significant overhaul recently. To get going with it run $$help.\n' +
                        // 'Some notes, we\'ve added support for disabling certain rules, so if you\'re tired of the bot telling you not to swear you can now disable that rule with the $$rule command, the rule name is PROFANITY.\n' +
                        // 'Configuring the server is now easier than before, just run $$configure and the bot will walk you through it.\n' +
                        // 'Consider joining the support server here\n https://discordapp.com/invite/YsbC7Z4'
                    // )
                // }
            // })
        // })
        client.user.setActivity('Correcting grammar. $$help')
    })

    client.on('guildCreate', guild => {
        guild.members.map(async member => {
            if (member.hasPermission('ADMINISTRATOR', false, true, false)) {
                const dmChannel = await member.createDM()
                dmChannel.send(
                    'Hi, thank you for adding the Grammar Nazi Bot to your server!\n' +
                    'The Grammar Nazi Bot has undergone a significant overhaul recently. To get going with it run $$help.\n' +
                    'Some notes, we\'ve added support for disabling certain rules, so if you\'re tired of the bot telling you not to swear you can now disable that rule with the $$rule command, the rule name is PROFANITY.\n' +
                    'Configuring the server is now easier than before, just run $$configure and the bot will walk you through it.\n' +
                    'Consider joining the support server here\n https://discordapp.com/invite/YsbC7Z4'
                )
            }
        })
    })

    client.on('message', async message => {
        if (message.author.bot) return
        if (message.content.startsWith("$$")) return
        const guild = await collection.findOne({ server_id: { $eq: message.guild.id } })
        if (guild === null) return

        checkGrammar(message, guild)
    })

    client.on('messageReactionAdd', async messageReaction => {
        if (messageReaction.emoji.name !== 'grammar') return
        const guild = await collection.findOne({ server_id: { $eq: messageReaction.message.guild.id } })
        if (guild === null) return

        messageReaction.message.reply(checkGrammar(messageReaction.message.content, guild))
    })

    client.login(process.env.TOKEN)
})

const checkGrammar = async (message, guild) => {
    let count = 1

    if (Math.floor(Math.random() * 100) <= guild.frequency) {
        axios.post(grammarCheckAPI, querystring.stringify({
            'text': message.content,
            'language': guild.language,
            'disabledRules': guild.disabledRules != null ? guild.disabledRules.toString() : null
        }))
            .then(response => {
                if (response.data.matches.length > 0) {
                    message.reply(response.data.matches.map(match => {
                        return `${count++}. ${match.message}.\n`
                    }))
                }
            })
            .catch(error => error)
    }
}