// Desc: Database connection and queries
// Commented out for future use

// const pgp = require('pg-promise')(/* options */)
// const db = pgp('postgres://pgoldtho:save.cmbs.json@localhost:5432/cmbs')

// app.get('/db', async (req, res) => {

//   db.one('SELECT $1 AS value', 'Hello from Postgres')
//   .then((data) => {
//     // console.log('DATA:', data.value)
//     res.send(data.value);
//   })
//   .catch((error) => {
//     console.log('ERROR:', error)
//   })


// });