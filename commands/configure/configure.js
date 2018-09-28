const { Command } = require('discord.js-commando')
const MongoClient = require('mongodb').MongoClient

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
        MongoClient.connect(process.env.URL, { useNewUrlParser: true }, async (err, dbClient) => {
            if(err) throw new Error(err)
            const db = await dbClient.db('servers')
            const collection = await db.collection('server')
            const guild = await collection.findOne({ server_id: { $eq: message.guild.id }})
            
            if(guild === null) {
                try {
                    await collection.insertOne({ server_id: message.guild.id, frequency, language })
                } catch(err) {
                    return await message.say(`There was an unkown error. Contact Ciao#0810`)
                }
            } else {
                try {
                    await collection.update({ server_id: guild.server_id }, { server_id: guild.server_id, frequency, language })    
                } catch(err) {
                    return await message.say(`There was an unkown error. Contact Ciao#0810`)
                }
            }

            return await message.say(`Configured your server with a frequency of ${frequency} and language of ${language}`)
        })
    }
}