const { Command } = require('discord.js-commando')

module.exports = class ConfigureCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'configure',
            group: 'configure', 
            memberName: 'configure',
            description: 'Configure the settings for your server',
            examples: ['configure 10 en-us'],
            args: [
                {
                    key: 'frequency',
                    prompt: 'What would you like the frequency to be for the bot reporting errors?',
                    type: 'integer'
                },
                {
                    key: 'language',
                    prompt: 'Which language would you like to have your server set to?',
                    type: 'string'
                }
            ]
        })
    }

    run(message, { frequency, language }) {
        return message.say(`Configured your server with a frequency of ${frequency} and language of ${language}`)
    }
}