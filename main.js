const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const tokenUrl = 'https://oauth2.googleapis.com/token';
const grantType = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const axiosConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

module.exports.templateTags = [{
  name: 'googleServiceAccount',
  displayName: 'Google Service Account',
  description: 'Generate a Google Service Account JWT',
  args: [{
    displayName: 'Credentials Location',
    description: 'The location of the credentials file',
    type: 'string',
    placeholder: '/path/to/credentials.json',
    defaultValue: '',
  }, {
    displayName: 'Scope',
    description: 'The scope of the token',
    type: 'string',
    defaultValue: '',
  }],
  async run(_context, location, scope) {
    const serviceCredentials = JSON.parse(fs.readFileSync(location));

    const payload = {
      iat: Math.floor(Date.now() / 1000) - 10,
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope,
    };

    const options = {
      algorithm: 'RS256',
      keyid: serviceCredentials.private_key_id,
      audience: tokenUrl,
      issuer: serviceCredentials.client_email,
    };

    const token = jwt.sign(payload, serviceCredentials.private_key, options);

    return await axios.post(tokenUrl, `assertion=${token}&grant_type=${grantType}`, axiosConfig)
      .then(res => res.data.access_token);
  }
}];
