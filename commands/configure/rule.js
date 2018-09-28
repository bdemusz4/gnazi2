const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient

module.exports = class RuleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rule',
            group: 'configure',
            memberName: 'rule',
            description: 'Add rules to a list of disabled rules that the bot will ignore',
            examples: ['rule add UpperCaseSentenceStart', 'user remove BadWords'],
            args: [
                {
                    key: 'type',
                    prompt: 'Would you like to "add" or "remove" a rule?',
                    type: 'string',
                    validate: text => {
                        if (text === 'add' || text === 'remove') return true
                        return 'Must be either "add" or "remove"'
                    }
                },
                {
                    key: 'ruleName',
                    prompt: 'Which rule would you like to add or remove from the list of disabled rules?',
                    type: 'string'
                }
            ]
        })
    }

    run(message, { type, ruleName }) {
        MongoClient.connect(process.env.URL, { useNewUrlParser: true }, async (err, dbClient) => {
            if (err) throw new Error(err)
            const db = await dbClient.db('servers')
            const collection = await db.collection('server')
            const guild = await collection.findOne({ server_id: { $eq: message.guild.id } })

            if (guild === null) {
                return message.say(`You need to configure the bot before you can disable any rules. Use $$help for help.`)
            }

            if (type === 'add') {
                console.log(guild.disabledRules)
                const currentRules = guild.disabledRules !== undefined ? guild.disabledRules : []
                currentRules.push(ruleName)

                await collection.update(
                    {
                        server_id: guild.server_id
                    },
                    {
                        server_id: guild.server_id,
                        language: guild.language,
                        frequency: guild.frequency,
                        disabledRules: currentRules
                    }
                )

                return message.say(`${ruleName} has been added to the list of disabled rules.`)
            } else if (type === 'remove') {
                const currentRules = guild.disabledRules !== undefined ? guild.disabledRules : []

                if (currentRules.includes(ruleName)) {
                    const index = currentRules.indexOf(ruleName)
                    currentRules.splice(index, 1)

                    await collection.update(
                        {
                            server_id: guild.server_id
                        },
                        {
                            server_id: guild.server_id,
                            language: guild.language,
                            frequency: guild.frequency,
                            disabledRules: currentRules
                        }
                    )
                    return message.say(`${ruleName} has been removed from the list of disabled rules. ${currentRules.length > 0 ? `Your new list of disabled rules is: ${currentRules.toString()}` : `You don't currently have any rules being disabled.`}`)
                } else {
                    return message.say(`${ruleName} not found in current active list of disabled rules.`)
                }
            }
        })
    }
}