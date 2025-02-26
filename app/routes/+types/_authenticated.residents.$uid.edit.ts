import type { ResidentDto } from "~/api/nagaraCareAPI";

export namespace Route {
  export type LoaderArgs = {
    params: {
      uid?: string;
    };
  };
  export type ClientLoaderArgs = LoaderArgs;
  export type ActionArgs = {
    request: Request;
    params: {
      uid?: string;
    };
  };
  export type ClientActionArgs = ActionArgs;

  export type LoaderData = {
    resident: ResidentDto;
  };

  export type ComponentProps = {
    loaderData: LoaderData;
  };
}
