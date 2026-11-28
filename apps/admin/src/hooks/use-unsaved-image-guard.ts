import { useEffect } from "react";

const UNSAVED_IMAGE_MESSAGE =
  "Tenés una imagen elegida sin guardar. Si salís ahora se perderá.";

export function useUnsavedImageGuard(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  return {
    confirmLeave: () => window.confirm(UNSAVED_IMAGE_MESSAGE),
  };
}
