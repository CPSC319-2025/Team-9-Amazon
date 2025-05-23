import { CSSObject } from "@emotion/react";
import { green } from "@mui/material/colors";

export const colors = {
  blue1: "#146eb4",
  gray1: "#f2f2f2",
  gray2: "#535d69",
  black1: "#232f3e",
  orange1: "#ff9900",
  green1: green[500],
  red1: "#ff0000",
  black: "#000000",
  white: "#ffffff",
};

export const textButtonStyle: CSSObject = {
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "transparent",
    opacity: 0.8,
  },
};

export const outlinedButtonStyle: CSSObject = {
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 24px",
  borderWidth: "2px",
  borderColor: colors.blue1,
  color: colors.blue1,
  borderRadius: "0.5rem",
  "&:hover": {
    borderWidth: "2px",
    borderColor: colors.orange1,
    backgroundColor: `${colors.orange1}10`,
  },
};

export const filledButtonStyle: CSSObject = {
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 24px",
  backgroundColor: colors.orange1,
  color: colors.white,
  borderRadius: "0.5rem",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: colors.orange1,
    opacity: 0.9,
    boxShadow: "none",
  },
};

export const chipStyle: CSSObject = {
  backgroundColor: "white",
  color: colors.gray2,
  border: `1px solid ${colors.gray2}`,
  fontWeight: "bold",
  padding: "6px 12px",
  borderRadius: "4px",
  height: "100%",
};

export const cardStyle: CSSObject = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: colors.white,
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    cursor: "pointer",
  },
};

export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: colors.white,
  borderRadius: "0.5rem",
  boxShadow: 24,
  p: 4,
  maxWidth: "42rem",
  minWidth: "30rem",
  width: "auto ",
  m: 2,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  maxHeight: "90vh",
}

// Layout Styles
export const headerStyle: CSSObject = {
  bgcolor: colors.gray1,
  px: 4,
  py: 3,
  borderRadius: "0 0 12px 12px",
};

// Input Styles
export const searchFieldStyle: CSSObject = {
  backgroundColor: colors.white,
  "& .MuiOutlinedInput-root": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: 2,
      borderColor: `${colors.blue1}50`,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.blue1,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.blue1,
      borderWidth: 2,
    },
  },
};

// Typography Styles
export const titleStyle: CSSObject = {
  color: colors.black1,
  fontWeight: 600,
};

export const subtitleStyle: CSSObject = {
  color: colors.black1,
};

// Paper Styles
export const paperStyle: CSSObject = {
  bgcolor: colors.white,
  borderRadius: 2,
  p: 4,
  height: "100%",
};
