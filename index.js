const { CommandoClient } = require('discord.js-commando')
const path = require('path')
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

client.on('ready', () => {
    console.log('Logged in!')
    client.user.setActivity('Correcting grammar. $$help')
})

client.login(process.env.TOKEN)