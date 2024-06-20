import { useEffect } from 'react';

const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
      console.error("Error message: ", message);
      console.error("Source: ", source);
      console.error("Line number: ", lineno);
      console.error("Column number: ", colno);
      console.error("Error object: ", error);
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection: ", event.reason);
    };

    window.onerror = handleError;
    window.onunhandledrejection = handlePromiseRejection;

    try {
      if (typeof (window as any).TelegramGameProxy !== 'undefined') {
        (window as any).TelegramGameProxy.receiveEvent('event_name', 'event_data');
      } else {
        console.error('TelegramGameProxy is not defined');
      }
    } catch (error) {
      console.error("Caught error: ", error);
    }

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
    };
  }, []);
};

export default useGlobalErrorHandler;
