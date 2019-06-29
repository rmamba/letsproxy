module.exports = {
    domain: "letsproxy.mydomain.com",
    acme: {
        challenge: '/var/www/.well-known/acme-challenge',
        certificates: '/var/lib/acme/live'
    }
}
