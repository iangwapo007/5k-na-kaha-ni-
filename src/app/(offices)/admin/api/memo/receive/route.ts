'use server';;
import connectDB from "@/lib/database";
import { DocumentType, Roles } from "@/lib/modelInterfaces";
import LetterIndividual from "@/lib/models/LetterIndividual";
import MemoIndividual from "@/lib/models/MemoIndividual";
import User from "@/lib/models/User";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB()
  try {
    const session = await getSession(Roles.Admin)
    if (!!session?.user) {
      const doctype = request.nextUrl.searchParams.get('doctype');
      if ([DocumentType.Memo, DocumentType.Letter].includes(doctype as DocumentType)) {
        const selectFields = 'departmentIds ' + (doctype === DocumentType.Memo ? "readMemos" : "readLetters");
        const user = await User.findById(session.user._id).select(selectFields).exec();
        const MemoLetterIndividual = doctype === DocumentType.Memo ? MemoIndividual : LetterIndividual;
        const result2 = await MemoLetterIndividual.find({
          userId: session!.user._id.toString()
        }).exec();
        const allResult = [...result2];
        allResult.sort((a, b) => (new Date(b.updatedAt)).getTime() - (new Date(a.updatedAt)).getTime())
        return NextResponse.json({ result: allResult, user })
      }
    }
  } catch (e) {
    console.log("error:", e)
  }
  return NextResponse.json({ result: [] })
}