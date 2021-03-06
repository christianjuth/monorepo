import { CSSProperties, forwardRef, ReactNode } from "react";
import styled from "styled-components";
import { Breakpoint, BreakpointGenerator } from "./types";
import { computeBreakpoints, mediaQuery } from "./utils";

export interface ColProps extends Partial<BreakpointGenerator<number>> {
  style?: CSSProperties;
  children?: ReactNode;
  className?: string;
}

export interface RowProps {
  style?: CSSProperties;
  children?: ReactNode;
  spacing?: number | string;
  className?: string;
  /**
   * Keep this number as low as possible to avoid
   * horizontal overflow. For example, 6 might be
   * a good number of columns since its low, but
   * divisible by both 2, and 3.
   */
  cols: string | number;
  /**
   * This method of reversing is inaccessible
   * because it only reverses the order visually
   * and not for people using screen readers
   */
  inaccessiblyReverse?: boolean;
}

const ColStyle = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  direction: ltr;

  @media ${mediaQuery("xs", "sm")} {
    display: var(--gridDisplay-xs);
    grid-column: span var(--gridWidth-xs);
  }

  @media ${mediaQuery("sm", "md")} {
    display: var(--gridDisplay-sm);
    grid-column: span var(--gridWidth-sm);
  }

  @media ${mediaQuery("md", "lg")} {
    display: var(--gridDisplay-md);
    grid-column: span var(--gridWidth-md);
  }

  @media ${mediaQuery("lg", "xl")} {
    display: var(--gridDisplay-lg);
    grid-column: span var(--gridWidth-lg);
  }

  @media ${mediaQuery("xl", "xxl")} {
    display: var(--gridDisplay-xl);
    grid-column: span var(--gridWidth-xl);
  }

  @media ${mediaQuery("xxl")} {
    display: var(--gridDisplay-xxl);
    grid-column: span var(--gridWidth-xxl);
  }
`;

const Col = forwardRef<HTMLDivElement, ColProps>(function Col(props, ref) {
  const { xs, sm, md, lg, xl, xxl, style, children, className, ...rest } =
    props;
  const computedBreakpoints = computeBreakpoints({
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
  });

  const vars: Record<string, string | number> = {};

  (Object.keys(computedBreakpoints) as Breakpoint[]).forEach((breakpoint) => {
    vars[`--gridWidth-${breakpoint}`] = computedBreakpoints[breakpoint];
    vars[`--gridDisplay-${breakpoint}`] =
      computedBreakpoints[breakpoint] === 0 ? "none" : "flex";
  });

  return (
    <ColStyle
      style={{
        ...style,
        ...vars,
      }}
      className={[className, "col"].join(" ")}
      ref={ref}
      {...rest}
    >
      {children}
    </ColStyle>
  );
});

const RowStyle = styled.div`
  display: grid;
  flex: 1;
  align-items: flex-start;
`;

const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  {
    cols,
    spacing = 0,
    children,
    style,
    className,
    inaccessiblyReverse = false,
    ...rest
  },
  ref
) {
  if (typeof cols === "number") {
    cols = Array.from({ length: cols })
      .map(() => "1fr")
      .join(" ");
  }

  if (typeof spacing === "number") {
    spacing = spacing + "px";
  }

  return (
    <RowStyle
      className={className}
      style={{
        gridGap: spacing,
        gridTemplateColumns: cols,
        direction: inaccessiblyReverse ? "rtl" : undefined,
        ...style,
      }}
      ref={ref}
      {...rest}
    >
      {children}
    </RowStyle>
  );
});

export const Grid = {
  Row,
  Col,
};
