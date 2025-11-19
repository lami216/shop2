import { useEffect, useState } from "react";

const useDebounce = (value, delay = 300) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
                const scheduleTimeout =
                        typeof globalThis !== "undefined" && globalThis.setTimeout
                                ? globalThis.setTimeout
                                : setTimeout;
                const clearScheduled =
                        typeof globalThis !== "undefined" && globalThis.clearTimeout
                                ? globalThis.clearTimeout
                                : clearTimeout;

                const timer = scheduleTimeout(() => {
                        setDebouncedValue(value);
                }, delay);

                return () => {
                        clearScheduled(timer);
                };
        }, [value, delay]);

        return debouncedValue;
};

export default useDebounce;
