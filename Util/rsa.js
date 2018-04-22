var Rsa = require('node-rsa');

var publicPem = '-----BEGIN PUBLIC KEY-----' +
    'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMzli1vbwDGBmk5vPIPN3lLZBhgZY/dC' +
    'GzY0de/bkBQGtwmB4fcuBav4bjbEPL5mBtfPOro50PYU+w4eEMX8U+sCAwEAAQ==' +
    '-----END PUBLIC KEY-----';

var privatePem = '-----BEGIN PRIVATE KEY-----' +
    'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAzOWLW9vAMYGaTm88' +
    'g83eUtkGGBlj90IbNjR179uQFAa3CYHh9y4Fq/huNsQ8vmYG1886ujnQ9hT7Dh4Q' +
    'xfxT6wIDAQABAkAqcCjLH9rQ5i0Vrch07EDuG/E9MJUZ82E7euYqhelznAmRkejD' +
    'UIvrKQMKqKSetohBkzXZ5ILKh85tRwIrfUMxAiEA5UGvdN/KHeI2a3DIidbhoXH6' +
    '8lA/H94PEqJGGh24YU0CIQDkzGVWBZmOeYL6cZLaaJIIOrntkL9sDFGhQzFn9M7u' +
    'FwIgR6NZ73yKzQHGHZa1o5T5FpjmYNfAkfWy4hDBNSH6XrUCIQCb89JS6yg63Apy' +
    'KP3/T23SnCzliFdiD5eIgyNnB5AQ6wIhAJrEZfHdp0Rt9Nto7axsUFRWXHL9tbeE' +
    'Z5MA1wZjUn6H' +
    '-----END PRIVATE KEY-----';

var public_key = new Rsa(publicPem);

var private_key = new Rsa(privatePem);

public_key.setOptions({encryptionScheme: 'pkcs1'});

private_key.setOptions({encryptionScheme: 'pkcs1'});

module.exports = {
    public_key : public_key,
    private_key : private_key
};