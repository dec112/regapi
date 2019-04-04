# firmensms.at

API Version 2.6

https://www.firmensms.at/schnittstelle.pdf


### Usage

Import module with

```javascript
import Firmensms from 'firmensms'
```

or

```javascript
const Firmensms = require('firmensms').default
```

and create a client object by passing your user ID and application-specific password to the constructor

```javascript
const client = new Firmensms(user, pass)
```

Any options to `send` will be passed through to the API.

There are some convenience options that map to the native parameters, such as:
  - `to -> nummer`
  - `flash: true -> type=flash`
  - `from -> absender`
  - `test: true -> test=1`

```javascript
client.send({
  to: '00436601234567',
  from: 'Company',
  text: 'Hello World!\nHave a great day.'
}).then((res) => {
  console.log('Yay!', res)
}).catch((err) => {
  console.error('Uh oh.', err)
})
```


A successful response looks like this:

```javascript
{
  to: '00436601234567',
  messageId: '123456789',
  invoiceSum: undefined,
  credits: '0.122',
  transactionCost: '0.078',
  response: {
    error: '0',
    nummer: '00436601234567',
    msgid: '123456789',
    guthaben: '0.122',
    transaktionskosten: '0.078'
  }
}
```
