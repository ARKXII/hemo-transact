import { google } from "googleapis";
// import fs from "fs";
// import path from "path";

export async function POST(request) {
  try {
    const { fields } = await request.json();

    // Check if credentials exist
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) {
      throw new Error('Google Sheets credentials not found in environment variables');
    }
    
    // Parse credentials safely
    let parsedCredentials;
    try {
      parsedCredentials = JSON.parse(credentials);
    } catch {
      throw new Error('Failed to parse Google Sheets credentials. Please check your .env.local file format.');
    }
    // const credentialPath = path.join(process.cwd(), "credentials.json");
    // let parsedCredentials;
    // try {
    //   parsedCredentials = JSON.parse(fs.readFileSync(credentialPath, "utf8"));
    // } catch {
    //   throw new Error("Failed to read or parse Google Sheets credentials file");
    // }
    // Google Auth with error handling
    const auth = new google.auth.GoogleAuth({
      credentials: parsedCredentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    // Check spreadsheet ID
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not found in environment variables");
    }

    const sheets = google.sheets({ version: "v4", auth });
    const sheetName = "Transactions"; // Specify the sheet name

    // Step 1: Get the current data to find the next empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`, // Get all data to determine last row
    });

    // Calculate the next row number (rows are 1-indexed in Sheets)
    const values = response.data.values || [];
    const nextRowNumber = values.length + 1;

    // Step 2: Create a sparse array that will place values in correct columns
    const newRowData = [];

    // Process each field and place in corresponding column
    fields.forEach((field) => {
      // Convert column letter to array index (0-based)
      const columnIndex = field.column.charCodeAt(0) - "A".charCodeAt(0);

      // Ensure the array is large enough to hold this column
      while (newRowData.length <= columnIndex) {
        newRowData.push(""); // Fill gaps with empty strings
      }

      // Insert the value at the correct column index
      newRowData[columnIndex] = field.value;
    });

    // Step 3: Append the row to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${nextRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRowData],
      },
    });

    return Response.json({
      success: true,
      rowNumber: nextRowNumber,
    });
  } catch (error) {
    console.error("Error appending row to sheet:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
