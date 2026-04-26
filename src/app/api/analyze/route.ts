import { NextResponse } from "next/server";

import { generateAnalysis } from "@/lib/analysis";
import { type QuestionnaireData } from "@/lib/questionnaire";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { questionnaire?: QuestionnaireData };

    if (!body.questionnaire) {
      return NextResponse.json({ error: "Missing questionnaire payload." }, { status: 400 });
    }

    const analysis = await generateAnalysis(body.questionnaire);

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error while generating analysis.",
      },
      { status: 500 },
    );
  }
}
