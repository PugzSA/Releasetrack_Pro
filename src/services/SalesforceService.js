import jsforce from 'jsforce';
import config from '../config';

class SalesforceService {
  constructor() {
    this.connection = null;
    this.isLoggedIn = false;
  }

  async login() {
    try {
      const conn = new jsforce.Connection({
        loginUrl: config.salesforce.loginUrl
      });

      await conn.login(
        config.salesforce.username,
        config.salesforce.password + config.salesforce.clientSecret
      );

      this.connection = conn;
      this.isLoggedIn = true;
      console.log('Successfully connected to Salesforce');
      return true;
    } catch (error) {
      console.error('Error connecting to Salesforce:', error);
      return false;
    }
  }

  async logout() {
    if (this.connection) {
      await this.connection.logout();
      this.connection = null;
      this.isLoggedIn = false;
      console.log('Logged out from Salesforce');
    }
  }

  async query(soql) {
    if (!this.isLoggedIn) {
      await this.login();
    }

    try {
      const result = await this.connection.query(soql);
      return result;
    } catch (error) {
      console.error('Error executing SOQL query:', error);
      throw error;
    }
  }

  async getMetadataTypes() {
    if (!this.isLoggedIn) {
      await this.login();
    }

    try {
      const result = await this.connection.metadata.describe();
      return result.metadataObjects;
    } catch (error) {
      console.error('Error fetching metadata types:', error);
      throw error;
    }
  }

  async retrieveMetadata(type, components) {
    if (!this.isLoggedIn) {
      await this.login();
    }

    try {
      const result = await this.connection.metadata.retrieve({
        apiVersion: '58.0',
        unpackaged: {
          types: {
            members: components,
            name: type
          }
        }
      });
      return result;
    } catch (error) {
      console.error('Error retrieving metadata:', error);
      throw error;
    }
  }

  async deployMetadata(zipFile, options = {}) {
    if (!this.isLoggedIn) {
      await this.login();
    }

    const deployOptions = {
      checkOnly: options.checkOnly || false,
      rollbackOnError: options.rollbackOnError || true,
      testLevel: options.testLevel || 'NoTestRun',
      ...options
    };

    try {
      const result = await this.connection.metadata.deploy(zipFile, deployOptions);
      return result;
    } catch (error) {
      console.error('Error deploying metadata:', error);
      throw error;
    }
  }
}

const salesforceService = new SalesforceService();
export default salesforceService;
