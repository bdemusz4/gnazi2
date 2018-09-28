const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient

module.exports = class CurrentRulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'currentrules',
            group: 'configure',
            memberName: 'currentrules',
            description: 'List the current active disabled rules',
            examples: ['currentRules']
        })
    }

    run(message) {
        MongoClient.connect(process.env.URL, { useNewUrlParser: true }, async (err, dbClient) => {
            if (err) throw new Error(err)
            const db = await dbClient.db('servers')
            const collection = await db.collection('server')
            const guild = await collection.findOne({ server_id: { $eq: message.guild.id }})
            let count = 1

            if (guild === null) return message.say(`You need to configure the bot before you can disable any rules. Use $$help for help.`)
            if (guild.disabledRules === undefined || guild.disabledRules.length === 0) return message.say('You don\'t have any rules being disabled currently. Add some with $$rule add <ruleName>')

            return message.say(guild.disabledRules.map(rule => {
                return `${count++}. ${rule}.\n`
            }))
        })
    }
}