import { google } from "googleapis";

export async function GET() {
  try {
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) throw new Error("Missing Google Sheets credentials");

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing Google Sheet ID");

    // Fetch data using the correct API method
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Transactions!B2:E101",
    });

    // The values are directly in response.data.values, not valueRanges
    return Response.json({
      matrix: response.data.values || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
