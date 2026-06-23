import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { isDbDisabled } from "@/lib/env";

function dbDisabledResponse() {
  return NextResponse.json(
    { error: "Database features are disabled in this environment." },
    { status: 503 },
  );
}

/** GET /api/analyses — list user's analyses (paginated, searchable) */
export async function GET(request: NextRequest) {
  if (isDbDisabled) return dbDisabledResponse();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  const where = {
    userId: session.user.id,
    ...(query ? { title: { contains: query } } : {}),
  };

  const [analyses, total] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        jobTitle: true,
        candidateCount: true,
        topScore: true,
        matchLevel: true,
        createdAt: true,
      },
    }),
    prisma.analysis.count({ where }),
  ]);

  return NextResponse.json({
    analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/** POST /api/analyses — save analysis */
export async function POST(request: NextRequest) {
  if (isDbDisabled) return dbDisabledResponse();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, report } = await request.json();

    if (!title || !report) {
      return NextResponse.json(
        { error: "Title and report are required." },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        title,
        jobTitle: report.jdSummary?.jobTitle ?? null,
        candidateCount: report.candidateOverview?.length ?? 0,
        topScore: report.finalRecommendation?.topCandidateScore ?? 0,
        matchLevel: report.candidateOverview?.[0]?.matchLevel ?? null,
        report: JSON.stringify(report),
      },
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: "Failed to save analysis." },
      { status: 500 }
    );
  }
}
