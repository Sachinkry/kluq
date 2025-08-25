import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionService } from '@/lib/assemblyai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, filePath } = body;

    if (!type || (type === 'url' && !url) || (type === 'file' && !filePath)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let result;
    
    if (type === 'url') {
      result = await TranscriptionService.transcribeYouTube(url);
    } else if (type === 'file') {
      result = await TranscriptionService.transcribeFile(filePath);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "url" or "file"' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = searchParams.get('id');

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'Missing transcript ID' },
        { status: 400 }
      );
    }

    const result = await TranscriptionService.getTranscription(transcriptId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get transcription API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get transcription' },
      { status: 500 }
    );
  }
} 