const { Command } = require('discord.js-commando')

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
                    type: 'string',
                    validate: text => {
                        if (text === 'UpperCaseSentenceStart') return true
                        return 'Must be a supported rule. See <link> for list of rules or run $$list rules'
                    }
                }
            ]
        })
    }

    run(message, { type, ruleName }) {
        if (type === 'add') {
            return message.say(`${ruleName} has been added to the list of disabled rules.`)
        } else if (type === 'remove') {
            return message.say(`${ruleName} has been removed from the list of disabled rules.`)
        }
    }
}