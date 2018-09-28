const { CommandoClient } = require('discord.js-commando')
const path = require('path')
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient
const querystring = require('querystring')
const options = { useNewUrlParser: true }
const grammarCheckAPI = 'https://languagetool.org/api/v2/check'
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
        console.log('Logged in!')
        client.user.setActivity('Correcting grammar. $$help')
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
            'disabledRules': guild.disabledRules.toString()
        }))
        .then(response => {
            console.log(response.data)
            if (response.data.matches.length > 0) {
                message.reply(response.data.matches.map(match => {
                    return `${count++}. ${match.message}.\n`
                }))
            }
        })
        .catch(console.error)
    }
}