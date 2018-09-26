const { Command } = require('discord.js-commando')

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'user',
            group: 'configure',
            memberName: 'user',
            description: 'Add users to a list that the bot will ignore the errors of.',
            examples: ['user add @user', 'user remove @user'],
            args: [
                {
                    key: 'type',
                    prompt: 'Would you like to "add" or "remove" a user?',
                    type: 'string',
                    validate: text => {
                        if (text === 'add' || text === 'remove') return true
                        return 'Must be either "add" or "remove"' 
                    }
                },
                {
                    key: 'user',
                    prompt: 'Which user would you like to add or remove from the list of disabled users?',
                    type: 'user'
                }
            ]
        })
    }

    run(message, { type, user }) {
        if (type === 'add') {
            return message.say(`${user} has been added to the list of disabled users.`)
        } else if (type === 'remove') {
            return message.say(`${user} has been removed from the list of disabled users.`)
        }
    }
}