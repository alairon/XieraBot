const https = require('https');

export class WebJSON{
  private static urlRegExp = /https?:\/\/.*/mi; //http:// or https://

  // Retrieves content from a URL
  private static async getData(url: string): Promise<string>{
    return new Promise((resolve, reject) => {
      https.get(url, (response: any) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error(`There was an error: ${response.statusCode}`));
        }

        let body = '';
        response.on('data', (chunk: any) => {
          body += chunk;
        });
        response.on('end', () => {
          resolve(body);
        });
      }).on('error', (err: Error) => reject(err));
    });
  }

  // Gets data from a URL, then attempts to parse it into a JSON
  public static async getJSON(url: string): Promise<object>{
    // Check that the URL is in a valid format
    if (!this.validURL(url)){
      console.error('The URL provided was in an invalid format!');
      return (null);
    }

    // Attempt to get data from the URL
    let webData: string 
    try {
      webData = await this.getData(url);
    } catch (err) {
      console.error('There was a problem trying to get the data\n' + err);
      return (null);
    }
    
    // Attempt to parse the data into a JSON
    let JSONData = {};
    try{
      JSONData = JSON.parse(webData);
    }
    catch (err){
      console.error('The data could not be parsed into a JSON');
    }
    return (JSONData);
  }

  // Tests if the URL is in the correct format. See the constant urlRegExp above.
  private static validURL(url: string): boolean{
    if (this.urlRegExp.test(url)){
      return (true);
    }
    return (false);
  }
}
