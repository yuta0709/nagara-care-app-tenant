import type { UserListResponseDto } from "~/api/nagaraCareAPI";

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
    users: UserListResponseDto;
  };

  export type ComponentProps = {
    loaderData: LoaderData;
  };
}
