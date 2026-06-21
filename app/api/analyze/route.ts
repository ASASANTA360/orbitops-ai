import { NextResponse } from "next/server";
import { analyzeRepository } from "@/src/lib/analyzer";
import { getOrbitContext } from "@/src/lib/orbit";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const repoUrl = body.repoUrl;

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    const orbitContext = await getOrbitContext(repoUrl);
    const report = await analyzeRepository(repoUrl, orbitContext);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Analysis API error:", error);

    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}