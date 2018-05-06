
module.exports = {
    getInitialRequestEmailTemplate: function (attendeeEmail, accessLink) {
    
        return {
            from: 'VocalistEmailer@vocalist.online',
            to: attendeeEmail,
            subject: "Give name",
            body: `Copy and use this link to access your upload portal: ${accessLink}`,
            html: `<p>Click here to access your upload portal!</p> <a href=${accessLink}>Click Here!</a>`
        }
    }

}


