import { NextResponse } from 'next/server';
import { memberService } from '@/lib/services/member.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request);
    
    const members = await memberService.getAll({
      ...options,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const member = await memberService.create(data);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}