'use server';
import connectDB from "@/lib/database";
import { DocumentType, Roles } from "@/lib/modelInterfaces";
import Memo from "@/lib/models/Memo";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB()
  try {
    const session = await getSession(Roles.Admin)
    if (!!session?.user) {
      const depid = request.nextUrl.searchParams.get('depid');
      const doctype = request.nextUrl.searchParams.get('doctype');
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear + 1, 0, 1);
      if (doctype === DocumentType.Memo) {
        const memoSeriesLastest = await Memo.countDocuments({
          departmentId: depid,
          preparedBy: session.user._id,
          createdAt: { $gte: startOfYear, $lt: endOfYear }
        }).exec();
        return NextResponse.json({
          result: memoSeriesLastest + 1
        })
      } else if (doctype === DocumentType.Letter) {
        const letterSeriesLastest = await Memo.countDocuments({
          departmentId: depid,
          preparedBy: session.user._id,
          createdAt: { $gte: startOfYear, $lt: endOfYear }
        }).exec();
        return NextResponse.json({
          result: letterSeriesLastest + 1
        })
      }
    }
  } catch (e) {
    console.log("error", e)
  }
  return NextResponse.json({ result: undefined })
}