import { useState, useEffect } from "react";
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(): Breakpoint | undefined {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | undefined>(
    undefined
  );

  const calculateBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= breakpoints.xl) {
      return "xl";
    } else if (width >= breakpoints.lg) {
      return "lg";
    } else if (width >= breakpoints.md) {
      return "md";
    } else if (width >= breakpoints.sm) {
      return "sm";
    } else {
      return "xs";
    }
  };

  useEffect(() => {
    setBreakpoint(calculateBreakpoint());

    const handleResize = () => {
      setBreakpoint(calculateBreakpoint());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return breakpoint;
}
