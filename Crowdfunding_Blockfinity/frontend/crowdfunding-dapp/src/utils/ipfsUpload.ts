// src/utils/ipfsUpload.ts

export const uploadTitleToIPFS = async (title: string): Promise<string> => {
    // Use environment variables in production!
    const apiKey = '17d9ed8e09a75d825a7b';
    const apiSecret = '8246dcacd38f2a54377e5874a66e77eea66cda91dfa7c8f7f5770fc57919fd4e';
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
    try {
      console.log('Uploading to Pinata:', { title });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret,
        },
        body: JSON.stringify({
          pinataContent: { title },
          pinataMetadata: {
            name: `Campaign-${Date.now()}`
          },
          pinataOptions: {
            cidVersion: 0
          }
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Pinata API error:', error);
        throw new Error(error.error?.message || `Upload failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Pinata upload successful:', data);
      
      // Ensure the IpfsHash exists before returning
      if (!data.IpfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      console.error('IPFS Upload Error:', error);
      throw error;
    }
  };
  
  // Helper function to validate IPFS URI
  export const isValidIpfsUri = (uri: string): boolean => {
    return Boolean(uri && typeof uri === 'string' && (
      uri.startsWith('ipfs://') || 
      uri.match(/^[a-zA-Z0-9]{46,59}$/) // Flexible CID validation
    ));
  };