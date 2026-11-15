import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, paths } = body;

    const expectedSecret =
      process.env.REVALIDATION_SECRET || 'ClinicRevalidationSecret2026';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Yetkisiz revalidation isteği.' },
        { status: 401 }
      );
    }

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { message: 'Geçerli bir paths dizisi gönderilmelidir.' },
        { status: 400 }
      );
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Revalidation işlemi sırasında hata oluştu.',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

