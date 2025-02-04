'use server';;
import connectDB from "@/lib/database";
import { DocumentType, Roles } from "@/lib/modelInterfaces";
import Letter from "@/lib/models/Letter";
import LetterIndividual from "@/lib/models/LetterIndividual";
import Memo from "@/lib/models/Memo";
import MemoIndividual from "@/lib/models/MemoIndividual";
import User from "@/lib/models/User";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB()
  try {
    const session = await getSession(Roles.Faculty)
    if (!!session?.user) {
      const doctype = request.nextUrl.searchParams.get('doctype');
      if ([DocumentType.Memo, DocumentType.Letter].includes(doctype as DocumentType)) {
        const selectFields = 'departmentIds ' + (doctype === DocumentType.Memo ? "readMemos" : "readLetters");
        const user = await User.findById(session.user._id).select(selectFields).exec();
        const MemoLetter = doctype === DocumentType.Memo ? Memo : Letter;
        const MemoLetterIndividual = doctype === DocumentType.Memo ? MemoIndividual : LetterIndividual;
        const userId = user?._id?.toHexString();
        const result = await MemoLetter.find({
          $and: [
            {
              $or: [
                {
                  departmentId: {
                    $in: user._doc.departmentIds,
                  },
                },
                {
                  cc: {
                    $in: [userId]
                  },
                }
              ]
            },
            {
              signatureApprovals: {
                $not: {
                  $all: {
                    $elemMatch: { approvedDate: null },
                  },
                },
              },
            },
            {
              signatureApprovals: {
                $all: {
                  $elemMatch: { rejectedDate: null },
                }
              }
            }
          ]
        }).populate('departmentId').exec();

        const result2 = await MemoLetterIndividual.find({
          userId: session!.user._id.toString()
        }).exec();
        const allResult = [...result, ...result2];
        allResult.sort((a, b) => (new Date(b.updatedAt)).getTime() - (new Date(a.updatedAt)).getTime())
        return NextResponse.json({ result: allResult, user })
      }
    }
  } catch (e) {
    console.log("error:", e)
  }
  return NextResponse.json({ result: [] })
}