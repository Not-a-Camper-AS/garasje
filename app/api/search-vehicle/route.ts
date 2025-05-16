// Define the vehicle data type
type VehicleData = {
  make: string;
  model: string;
  year: string;
  color: string;
  registrationNumber: string;
  typebetegnelse?: string;
  understellsnummer?: string;
  seats?: number;
  weight?: number;
  totalWeight?: number;
};

// Define response types
type SuccessResponse = {
  success: true;
  vehicle: VehicleData;
};

type ErrorResponse = {
  success: false;
  message: string;
  error?: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

// Get the API key from environment variables
const SVV_AUTH_KEY = process.env.SVV_AUTH_KEY;

export function GET(request: Request) {
  console.log("API route called: /api/search-vehicle");
  
  try {
    const url = new URL(request.url);
    console.log("Full request URL:", url.toString());
    
    const kjennemerke = url.searchParams.get('kjennemerke');
    console.log("Kjennemerke parameter:", kjennemerke);

    if (!kjennemerke) {
      console.log("Missing license plate parameter");
      return Response.json({ 
        success: false, 
        message: 'Missing license plate parameter' 
      } as ErrorResponse, { status: 400 });
    }

    // Return mock data since we may not have an API key in development
    console.log("Returning mock data for:", kjennemerke);
    return Response.json({
      success: true,
      vehicle: {
        make: "Tesla",
        model: "Model 3 Long Range",
        year: "2022",
        color: "Grå",
        registrationNumber: kjennemerke,
        typebetegnelse: "Model 3",
        understellsnummer: "5YJ3E7EA7NF123456",
        seats: 5,
        weight: 1850,
        totalWeight: 2250
      }
    } as SuccessResponse, { status: 200 });
    
  } catch (error) {
    console.error('Error in search-vehicle API:', error);
    
    return Response.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    } as ErrorResponse, { status: 500 });
  }
} 