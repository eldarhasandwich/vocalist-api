const path = require('path')

const admin = require("firebase-admin");
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const AWS = require('aws-sdk')
const nodemailer = require('nodemailer')

let config = require('./config/' + (process.env.NODE_ENV || 'development'))
var serviceAccount = require("./config/firebase.json");

const EmailTemplates = require('./Resources/emailTemplates')

const app = express()

const transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      apiVersion: '2010-12-01',
      region: 'us-west-2', // must be for SES
      accessKeyId: config.SES.accessKey,
      secretAccessKey: config.SES.secretKey
    })
  })
  
admin.initializeApp({
    credential: admin
        .credential
        .cert(serviceAccount),
    databaseURL: "https://project-babel-datastore.firebaseio.com"
});

app.use(bodyParser.json())

app.use(cors())

app.use(function (req, res, next) {
    if (req.path.split('/')[1] === "attendee") {
        next()
        return
    }

    let token = req.get('authorization')

    if (!token) {
        return res.sendStatus(400)
    }

    admin
        .auth()
        .verifyIdToken(token)
        .then(function (decoded) {
            admin.auth().listUsers(1000).then(function (response) {
                // console.log(response)
                if (!response.users.some(user => user.email === decoded.email)) {
                    return res.sendStatus(403)
                }
                req.user = decoded
                next()
            })
        })
})

app.get('/', function (req, res) {
    res.end('hello')
})


app.post('/email/send', function (req, res) {

    console.log("Recieved Email Send Request from " + req.user.uid)

    let listID = req.body.listID
    let userIDs = req.body.userIDs

    var db = admin.database()
    console.log(req.user.uid)
    console.log(listID)
    var ref = db.ref("_COMPANIES/" + req.user.uid + "/_LISTS/" + listID)
    ref.once("value", function(snapshot) {

        let attendees = snapshot.val()._ATTENDEES

        for (let userId in attendees) {
            let accessLink = `upload.vocalist.online/?k=${req.user.uid}~${listID}~${userId}`
            let attendeeEmail = attendees[userId].contactEmail
            let e = EmailTemplates.getInitialRequestEmailTemplate(attendeeEmail, accessLink)

            if (userIDs && !userIDs.includes(userId)) {
                continue
            }

            console.log("Sending Email to " + attendeeEmail)

            transporter.sendMail({
                from: e.from,
                to: e.to,
                subject: e.subject,
                text: e.text,
                html: e.html
            }, (error, info) => {
                if (error) {
                    return console.log(error)
                }
                console.log('Email sent')
                console.log(req.user.uid)
                console.log(listID)
                console.log(userId)

                var db = admin.database()
                var ref = db.ref(`_COMPANIES/${req.user.uid}/_LISTS/${listID}/_ATTENDEES/${userId}`)
                ref.update({awaitingResponse: true})
            })
        }

    })

})

app.get('/attendee/load', function (req, res) {
    // console.log(req)

    console.log("Recieved attendee key load request from " + req.query.attID)

    let c = req.query.compID;
    let l = req.query.listID
    let a = req.query.attID

    var db = admin.database()
    var ref = db.ref(`_COMPANIES/${c}/_LISTS/${l}/_ATTENDEES/${a}`)
    ref.once("value", function(snapshot) {
        let v = snapshot.val()
        if (!v) {
            console.log("No attendee")
            res.end(null)
            return
        }

        console.log("Found attendee: " + v.name)
        res.json(v)
    })
})

app.post('/attendee/uploadaudio', function (req, res) {
    // console.log(req)

    console.log("Recieved attendee audio upload request from " + req.body.attID)

    let c = req.body.compID
    let l = req.body.listID
    let a = req.body.attID

    console.log(c)
    console.log(l)
    console.log(a)

    var db = admin.database()
    var ref = db.ref(`_COMPANIES/${c}/_LISTS/${l}/_ATTENDEES/${a}`)
    ref.update({audioStatus: "Unverified", awaitingResponse: false})


    res.end("success")


})

app.listen(config.app.port, function (err) {
    if (err) {
        throw err
    }
    console.log("App is working :D")
})

