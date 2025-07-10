// Configuration for Salesforce API integration
const config = {
  // Salesforce API credentials
  salesforce: {
    // Replace these with actual Salesforce credentials when deploying
    loginUrl: 'https://login.salesforce.com',
    username: process.env.REACT_APP_SF_USERNAME || '',
    password: process.env.REACT_APP_SF_PASSWORD || '',
    clientId: process.env.REACT_APP_SF_CLIENT_ID || '',
    clientSecret: process.env.REACT_APP_SF_CLIENT_SECRET || '',
  },
  
  // Application settings
  app: {
    releaseFrequency: 'monthly',
    defaultDeployDay: 'wednesday',
    developmentLeadTime: 14, // days
    testingPeriod: 7, // days
    stakeholderReviewPeriod: 3, // days
  },
  
  // Notification settings
  notifications: {
    emailEnabled: true,
    slackEnabled: false,
    slackWebhookUrl: process.env.REACT_APP_SLACK_WEBHOOK || '',
  }
};

export default config;
