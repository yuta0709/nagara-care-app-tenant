import type {
  UserDto,
  UserListResponseDto,
  ResidentListResponseDto,
  TenantDto,
} from "~/api/nagaraCareAPI";

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
    residents: ResidentListResponseDto;
    me: UserDto;
    tenant: TenantDto;
  };

  export type ComponentProps = {
    loaderData: LoaderData;
  };
}
