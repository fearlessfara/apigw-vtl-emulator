export const defaultSettings = {
  autoRenderDelay: 1000,
  fontSize: 14,
  lineNumbers: true,
  minimap: false,
  wordWrap: true,
  theme: 'light'
};

export const loadSettings = () => {
  try {
    const saved = JSON.parse(window.localStorage?.getItem('vtl-emulator-settings') || '{}');
    return {...defaultSettings, ...saved};
  } catch (e) {
    console.warn('Could not load settings:', e);
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  try {
    window.localStorage?.setItem('vtl-emulator-settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings:', e);
  }
};

export const getDefaultContext = () => {
  return `{
  "accountId": "112233445566",
  "apiId": "a1b2c3d4e5",
  "domainPrefix": "a1b2c3d4e5",
  "domainName": "a1b2c3d4e5.execute-api.us-east-1.amazonaws.com",
  "extendedRequestId": "ABCdEFGhIJKLMnO=",
  "httpMethod": "POST",
  "stage": "prod",
  "path": "/api/users",
  "protocol": "HTTP/1.1",
  "requestId": "7b776519-78de-4539-8e04-ff300f5c2528",
  "requestTime": "23/May/2025:10:30:00 +0000",
  "requestTimeEpoch": 1716458200000,
  "resourceId": "1a2b3c4d5e",
  "resourcePath": "/users",
  "authorizer": {
    "claims": {
      "sub": "4bf08bda-88a3-47b8-90b0-f08291a9e7af",
      "aud": "tfcrxvwog56v9sxpcbcesams65",
      "email_verified": true,
      "token_use": "id",
      "auth_time": 1716458000,
      "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example",
      "cognito:username": "john.doe",
      "exp": 1716461800,
      "iat": 1716458200,
      "email": "john.doe@example.com"
    },
    "principalId": "4bf08bda-88a3-47b8-90b0-f08291a9e7af"
  },
  "identity": {
    "accountId": "112233445566",
    "apiKey": "DM8ua1AIkO292b9gAwRst87qNc296DyNEU3y8Ll4",
    "apiKeyId": "2zmu863a9k",
    "caller": "4bf08bda-88a3-47b8-90b0-f08291a9e7af",
    "cognitoAuthenticationType": "authenticated",
    "cognitoIdentityId": "us-east-1:4bf08bda-88a3-47b8-90b0-f08291a9e7af",
    "cognitoIdentityPoolId": "us-east-1:5f658b59-d1fb-4499-8b24-92246a5c2a05",
    "sourceIp": "203.0.113.1",
    "user": "john.doe",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "userArn": "arn:aws:iam::112233445566:role/CognitoAuthorizedRole"
  }
}`;
};

