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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing Google Sheet ID");

    // Fetch all data in a single batch request
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        "Summary!B1", // totalSpending
        "Summary!B2", // installment
        "Summary!B3", // totalBudget
        "Summary!B4", // remainingBudget
        "Summary!D2", // currentCredit
        "Summary!D4", // budget
        "Summary!A7:C12", // Matrix data
      ],
    });

    return Response.json({
      individualCells: {
        totalSpending: response.data.valueRanges[0].values?.[0]?.[0] || null,
        installment: response.data.valueRanges[1].values?.[0]?.[0] || null,
        totalBudget: response.data.valueRanges[2].values?.[0]?.[0] || null,
        remainingBudget: response.data.valueRanges[3].values?.[0]?.[0] || null,
        currentCredit: response.data.valueRanges[4].values?.[0]?.[0] || null,
        budget: response.data.valueRanges[5].values?.[0]?.[0] || null,
      },
      matrix: response.data.valueRanges[6].values || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
