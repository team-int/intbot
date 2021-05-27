/* eslint-disable no-unused-vars */
const Discord = require('discord.js')
const { EventEmitter } = require('events')
const possibleOption = ['구매', '조회', '현황']
const possibleEmoji = {
  '1️⃣': 1,
  '2️⃣': 2,
  '3️⃣': 3,
  '4️⃣': 4,
  '5️⃣': 5,
  '6️⃣': 6,
  '7️⃣': 7,
  '8️⃣': 8,
  '9️⃣': 9,
}
const 로또값 = 5000

module.exports = {
  name: 'lotto',
  aliases: ['로또', 'ㄹㄸ'],
  description: '인생은 도박이다.',
  usage: '인트야 로또 구매 | 조회 | 현황',
  category: '돈',
  /**
   * 
   * @param {Discord.Client} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async run(client, message, args) {
    let i = 0;
		const [_, option, subOption] = args;
    console.log(option, subOption)
    if (!possibleOption.includes(option))
      return message.reply(this.usage)
    
    const user = await client.db.findOne({_id: message.author.id})
    const now = new Date()
    const event = new EventEmitter()

    event.on('pending', 
    /**
     * @param {Discord.Message} message 
     * @param {Discord.User} user
     * @param {string[]} num
     * @param {string[]} bonus
     */
    async (message, user, num, bonus) => {
      const filter = (reaction, _user) => ['✅', '❌'].includes(reaction.emoji.name) && _user.id === user.id
      const clc = await message.awaitReactions(filter, {max: 1})
      if (clc.size == 0)  return message.reply(`취소되었습니다 (${user.tag})`)
      const reaction = clc.first()
      if (reaction.emoji.name == '✅') {
        return message.channel.send(`등록되었습니다 (${user.tag})`)
      } else {
        return message.channel.send(`취소되었습니다 (${user.tag})`)
      }
    })

    switch(option) {
      case possibleOption[0]:
        if (now.getDay() == 5 && now.getHours() == 17)  return message.reply('금요일 오후 5시가 지났습니다')
        if (!subOption)  return message.reply('자동 | 수동을 선택해주세요')
        if ((user.money - 로또값) < 0)  return message.reply('돈이 부족합니다')
        if (subOption == '자동') {

        } else if (subOption == '수동') {
          let embed = {
            title: '로또 선택',
            description: '이모지를 선택해서 숫자를 고르세요!',
            color: 'GREEN',
            fields: [
              {
                name: '고른번호',
                value: '\u200b'
              },
              {
                name: '보너스 번호',
                value: '\u200b'
              }
            ],
            timestamp: new Date(),
            footer: message.author.tag
          }

          let msg = await message.reply({embed})
          // msg.createReactionCollector((reaction, user) => user.id !== message.author.id && user.id !== client.user.id).on('collect', ctd => ctd.remove())    
          await msg.react('1️⃣')
          await msg.react('2️⃣')
          await msg.react('3️⃣')
          await msg.react('4️⃣')
          await msg.react('5️⃣')
          await msg.react('6️⃣')
          await msg.react('7️⃣')
          await msg.react('8️⃣')
          await msg.react('9️⃣')

          let collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id, {time: 60000})
          collector.on('collect', async ctd => {
            let { emoji } = ctd
            if (!emoji.name in possibleEmoji) return
            if (i > 5)  return
            i += 1
            if (i <= 4) {
              embed.fields[0].value += String(possibleEmoji[emoji.name]) + ' '
              msg = await msg.edit({embed})
            } else {
              embed.fields[1].value += String(possibleEmoji[emoji.name]) + ' '
              msg = await msg.edit({embed})
              let num = embed.fields[0].value.split(' ')
              let bonus = embed.fields[1].value.split(' ')
              let confirmMsg = await msg.channel.send(
                new Discord.MessageEmbed()
                .setTitle('확실합니까?')
                .setColor('ORANGE')
                .setDescription(`번호\n${num.join(' ')} +${bonus.join(' ')}`)
                .setFooter(message.author.tag)
                .setTimestamp()
              )
              await confirmMsg.react('✅')
              await confirmMsg.react('❌')
              event.emit('pending', confirmMsg, message.author, num, bonus)
            }
          })
        }
    }
  }
} 