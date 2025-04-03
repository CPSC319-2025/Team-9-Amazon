import { useBeforeUnload, UNSAFE_NavigationContext as NavigationContext } from "react-router-dom"
import { useEffect, useContext } from "react";

export const useBlocker = (blocker: () => boolean, when: boolean) => {
    const { navigator } = useContext(NavigationContext);
  
    useEffect(() => {
      if (!when) return;
  
      const originalPush = navigator.push;
      const originalReplace = navigator.replace;
  
      navigator.push = (path: string, state?: unknown) => {
        if (blocker()) {
          originalPush.call(navigator, path, state);
        }
      };
  
      navigator.replace = (path: string, state?: unknown) => {
        if (blocker()) {
          originalReplace.call(navigator, path, state);
        }
      };
  
      return () => {
        navigator.push = originalPush;
        navigator.replace = originalReplace;
      };
    }, [navigator, blocker, when]);
  };

export const useBrowserBlocker = (blocker: () => boolean, when: boolean) => {
    useBeforeUnload((event) => {
      if (when) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    );
  }