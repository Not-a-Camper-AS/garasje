import { ExpoResponse } from 'expo-router/server';
import axios from 'axios';

// Get the API key from environment variables
const SVV_AUTH_KEY = process.env.SVV_AUTH_KEY;

export default async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kjennemerke = url.searchParams.get('kjennemerke');

    if (!kjennemerke) {
      return ExpoResponse.json({ 
        success: false, 
        message: 'Missing license plate parameter' 
      }, { status: 400 });
    }

    if (!SVV_AUTH_KEY) {
      return ExpoResponse.json({
        success: false,
        message: 'API key is not configured'
      }, { status: 500 });
    }

    // Call the Vegvesen API
    try {
      const formattedLicensePlate = kjennemerke.replace(/\s+/g, ''); // Remove any spaces
      const apiUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${formattedLicensePlate}`;
      
      console.log(`Calling Vegvesen API for license plate: ${formattedLicensePlate}`);
      
      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: {
          'SVV-Authorization': SVV_AUTH_KEY,
          'Accept': 'application/json',
        }
      });
      
      // Check if vehicle data exists in the response
      const vehicleData = response.data;
      if (!vehicleData || !vehicleData.kjoretoydataListe || vehicleData.kjoretoydataListe.length === 0) {
        return ExpoResponse.json({
          success: false,
          message: 'No vehicle data found'
        }, { status: 404 });
      }
      
      const vehicleInfo = vehicleData.kjoretoydataListe[0];
      
      // Transform the data based on the confirmed API response structure
      const transformedData = {
        // Brand/Make: Extract from merke array
        make: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '',
        
        // Model: Extract from handelsbetegnelse array 
        model: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '',
        
        // Year: Get from registration date
        year: vehicleInfo?.forstegangsregistrering?.registrertForstegangNorgeDato?.substring(0, 4) || 
              vehicleInfo?.godkjenning?.forstegangsGodkjenning?.forstegangRegistrertDato?.substring(0, 4) || '',
        
        // Color: Get from rFarge
        color: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn || '',
        
        // Type description
        typebetegnelse: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.typebetegnelse || '',
        
        // Chassis number
        understellsnummer: vehicleInfo?.kjoretoyId?.understellsnummer || '',
        
        // Registration number
        registrationNumber: vehicleInfo?.kjoretoyId?.kjennemerke?.replace(/\s+/g, '') || kjennemerke,
        
        // Number of seats
        seats: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.persontall?.sitteplasserTotalt || 0,
        
        // Weight
        weight: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.vekter?.egenvekt || 0,
        
        // Total weight
        totalWeight: vehicleInfo?.godkjenning?.tekniskGodkjenning?.tekniskeData?.vekter?.tillattTotalvekt || 0
      };

      // Return the transformed data
      return ExpoResponse.json({
        success: true,
        vehicle: transformedData
      });
      
    } catch (apiError) {
      console.error('Error calling Vegvesen API:', apiError);
      return ExpoResponse.json({
        success: false,
        message: 'Error fetching vehicle data from Vegvesen API',
        error: apiError instanceof Error ? apiError.message : String(apiError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in search-vehicle API:', error);
    return ExpoResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}