import { google } from "googleapis";

export async function POST(request) {
  try {
    const { cells } = await request.json();

    // Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Prepare data for batch update
    const data = cells.map((cell) => ({
      range: cell.range,
      values: [[cell.value]],
    }));

    // Update multiple cells using batchUpdate
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: data,
      },
    });

    return Response.json({
      success: true,
      updatedCells: response.data.totalUpdatedCells,
    });
  } catch (error) {
    console.error("Error updating sheet:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
