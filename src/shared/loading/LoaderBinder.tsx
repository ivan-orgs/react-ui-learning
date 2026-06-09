import { useEffect } from "react";
import { registerLoaderHandlers } from "./loaderBridge";
import { useLoader } from "./LoaderContext";

export function LoaderBinder() {
  const { beginLoading, endLoading } = useLoader();

  useEffect(() => {
    registerLoaderHandlers({ beginLoading, endLoading });
  }, [beginLoading, endLoading]);

  return null;
}


