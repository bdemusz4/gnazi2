const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient
const supportLanguage = ['ast-ES', 'be-BY', 'br-FR', 'ca-ES', 'ca-ES-valencia', 'da-DK', 'de', 'de-AT', 'de-CH', 'de-DE', 'de-DE-x-simple-language', 'el-GR', 'en', 'en-AU', 'en-CA', 'en-GB', 'en-NZ', 'en-US', 'en-ZA', 'eo', 'es', 'fa', 'fr', 'gl-ES', 'it', 'ja-JP', 'km-KH', 'nl', 'pl-PL', 'pt', 'pt-AO', 'pt-BR', 'pt-MZ', 'pt-PT', 'ro-RO', 'ru-RU', 'sk-SK', 'sl-SI', 'sv', 'ta-IN', 'tl-PH', 'uk-UA', 'zh-CN']

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
                    type: 'integer',
                    validate: frequency => {
                        if (!/^\d+$/.test(frequency)) return 'The frequency must be a number only.'
                        if (frequency > 100 || frequency < 0) return 'The frequency must be between 0 and 100'
                        return true
                        
                    }
                },
                {
                    key: 'language',
                    prompt: 'Which language would you like to have your server set to? Reminder to use the language code, i.e. en-US', 
                    type: 'string',
                    validate: languageCode => {
                        if (!supportLanguage.includes(languageCode)) return `${languageCode} is not a supported language. Make sure you use the language code, here is a list\n ${supportLanguage.toString()}`
                        return true
                    }
                }
            ]
        })
    }

    run(message, { frequency, language }) {
        MongoClient.connect(process.env.URL, { useNewUrlParser: true }, async (err, dbClient) => {
            if(err) throw new Error(err)
            const db = await dbClient.db('servers')
            const collection = await db.collection('server')
            const guild = await collection.findOne({ server_id: { $eq: message.guild.id }})
            
            if(guild === null) {
                try {
                    await collection.insertOne({ server_id: message.guild.id, frequency, language })
                } catch(err) {
                    return await message.say(`There was an unkown error. Contact Ciao#6969`)
                }
            } else {
                try {
                    await collection.update({ server_id: guild.server_id }, { server_id: guild.server_id, frequency, language })    
                } catch(err) {
                    return await message.say(`There was an unkown error. Contact Ciao#6969`)
                }
            }

            return await message.say(`Configured your server with a frequency of ${frequency} and language of ${language}`)
        })
    }
}