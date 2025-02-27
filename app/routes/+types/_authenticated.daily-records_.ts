import type { ResidentListResponseDto } from "~/api/nagaraCareAPI";

export namespace Route {
  export interface LoaderArgs {
    params: {
      [key: string]: string | undefined;
    };
  }

  export interface ClientLoaderArgs {
    params: {
      [key: string]: string | undefined;
    };
  }

  export interface ClientActionArgs {
    request: Request;
    params: {
      [key: string]: string | undefined;
    };
  }

  export interface ComponentProps {
    loaderData: {
      residents: ResidentListResponseDto;
    };
  }
}
