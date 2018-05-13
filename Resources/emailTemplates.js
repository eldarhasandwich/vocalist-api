
module.exports = {
    getInitialRequestEmailTemplate: function (attendeeEmail, accessLink) {
    
        return {
            from: 'VocalistEmailer@vocalist.online',
            to: attendeeEmail,
            subject: "Give name",
            body: `Copy and use this link to access your upload portal: ${accessLink}`,
            html: `<p>Click here to access your upload portal!</p> <a href=${accessLink}>Click Here!</a>`
        }
    },

    getAudioReplaceEmailTemplate: function (attendeeEmail, accessLink, message) {
        if (!message) {
            return {
                from: 'VocalistEmailer@vocalist.online',
                to: attendeeEmail,
                subject: "Give name",
                body: `Your Audio needs to be Replaced. Copy and use this link to access your upload portal: ${accessLink}`,
                html: `<p>Your Audio needs to be Replaced. Click here to access your upload portal!</p> <a href=${accessLink}>Click Here!</a>`
            }
        }
    
        return {
            from: 'VocalistEmailer@vocalist.online',
            to: attendeeEmail,
            subject: "Give name",
            body: `Your Audio needs to be Replaced. The reason given was "${message}" Copy and use this link to access your upload portal: ${accessLink}`,
            html: `<p>Your Audio needs to be Replaced. The reason given was "${message}" Click here to access your upload portal!</p> <a href=${accessLink}>Click Here!</a>`
        }
    }

}


