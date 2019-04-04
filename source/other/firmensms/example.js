import Firmensms from './src'

const client = new Firmensms('user', 'pass')

client.send({
  to: '00436601234567',
  text: 'Hello World!\nHave a great day.',
  from: 'Company',
  route: 3,
  test: true
}).then((res) => {
  console.log('Yay! Promise resolved:', res)
}).catch((err) => {
  console.log('Promise rejected:', err)
})
