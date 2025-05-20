import { google } from "googleapis";

export async function POST(request) {
  try {
    const { fields } = await request.json();

    // Check if credentials exist
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) {
      throw new Error(
        "Google Sheets credentials not found in environment variables"
      );
    }

    // Parse credentials
    const parsedCredentials = JSON.parse(credentials);
    const auth = new google.auth.GoogleAuth({
      credentials: parsedCredentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not found in environment variables");
    }

    const sheets = google.sheets({ version: "v4", auth });
    const sheetName = "Transactions";

    // Get the last row with data in column B (to find next empty row)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B:B`,
    });

    const values = response.data.values || [];
    const nextRowNumber = values.length + 1;

    // Create a mapping of column letters to their positions (B=0, C=1, etc.)
    const columnMap = {};
    let maxColumnIndex = 0;

    fields.forEach((field) => {
      const columnLetter = field.column.toUpperCase();
      if (columnLetter >= "B" && columnLetter <= "Z") {
        const columnIndex = columnLetter.charCodeAt(0) - "B".charCodeAt(0);
        columnMap[columnLetter] = columnIndex;
        maxColumnIndex = Math.max(maxColumnIndex, columnIndex);
      }
    });

    // Prepare row data starting from column B
    const rowData = new Array(maxColumnIndex + 1).fill("");
    fields.forEach((field) => {
      const columnLetter = field.column.toUpperCase();
      if (columnMap[columnLetter] !== undefined) {
        rowData[columnMap[columnLetter]] = field.value;
      }
    });

    // Update the sheet starting from column B
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!B${nextRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
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
