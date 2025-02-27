import type {
  DailyRecordDto,
  ResidentDto,
  TranscriptionDto,
} from "~/api/nagaraCareAPI";

export namespace Route {
  export interface ClientLoaderArgs {
    params: {
      uid: string;
      dailyRecordId: string;
    };
  }

  export interface ClientActionArgs {
    request: Request;
    params: {
      uid: string;
      dailyRecordId: string;
    };
  }

  export interface LoaderData {
    resident: ResidentDto;
    dailyRecord: DailyRecordDto;
    transcription: TranscriptionDto;
  }

  export interface ComponentProps {
    loaderData: LoaderData;
  }
}
