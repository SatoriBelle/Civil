import * as React from "react";
import { colors } from "../styleConstants";
import { CircleBorder } from "./IconsStyledComponents";

export const TokenIdentityIcon = (): JSX.Element => {
  return (
    <CircleBorder>
      <svg width="18" height="21" viewBox="0 0 18 21" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round">
          >
          <g stroke={colors.accent.CIVIL_BLUE}>
            <path d="M2.111 4.333C3.746 2.388 6.058 1.195 8.539 1.017 12.463 0.77 15.031 3.248 15.444 3.669" />
            <path d="M1 8.778C1.414 8.006 3.841 3.641 7.958 3.25 12.22 2.845 14.997 6.985 15.444 7.673" />
            <path d="M1 11.309C1.568 10.881 2.086 10.388 2.544 9.84 3.336 8.891 3.44 8.372 3.964 7.689 5.146 6.135 6.961 5.668 7.235 5.602 9.76 4.987 11.795 6.363 11.958 6.475 13.497 7.565 14.444 9.319 14.516 11.216 14.545 12.97 13.622 13.68 13.991 15.298 14.227 16.217 14.734 17.043 15.444 17.667" />
            <path d="M1 14.083C2.061 13.367 2.987 12.482 3.741 11.465 4.742 10.102 4.832 9.275 5.959 8.49 6.732 7.934 7.676 7.645 8.639 7.668 9.968 7.74 11.186 8.408 11.931 9.473 13.429 11.748 11.053 14.198 12.517 16.909 12.947 17.672 13.572 18.315 14.333 18.778" />
            <path d="M1 16.714C3.644 15.103 5.142 13.439 6.027 12.202 6.738 11.205 7.355 10.051 8.539 9.903 9.472 9.804 10.376 10.24 10.834 11.009 11.154 11.621 11.029 12.401 10.306 13.658 8.785 16.303 6.119 18.426 3.853 19.889" />
            <path d="M2.111 18.778C3.755 17.696 5.255 16.414 6.575 14.961 7.382 14.069 8.119 13.116 8.778 12.111" />
            <path d="M15.444 8.778C16.768 10.887 16.914 13.264 15.855 15.444" />
            <path d="M10.214 15.444C9.858 16.163 9.792 16.961 10.027 17.714 10.348 18.646 11.099 19.431 12.111 19.889" />
            <path d="M6.556 20.408C6.836 20.031 7.15 19.7 7.489 19.42 7.992 19.008 8.327 18.723 8.689 18.787 9.244 18.883 9.705 19.805 9.889 21" />
          </g>
        </g>
      </svg>
    </CircleBorder>
  );
};
