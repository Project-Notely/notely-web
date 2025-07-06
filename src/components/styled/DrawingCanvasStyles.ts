import {
  AppBar,
  Box,
  ButtonGroup,
  Chip,
  Fab,
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Main canvas container
export const CanvasContainer = styled(Paper)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
  backgroundColor: theme.palette.grey[50],
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[12],
  },
}));

// Canvas wrapper
export const CanvasWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: 1,
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

// Drawing canvas element
export const DrawingCanvas = styled("canvas")(({ theme }) => ({
  display: "block",
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[2],
  cursor: "crosshair",
  touchAction: "none",
  userSelect: "none",
  transition: "all 0.2s ease-in-out",
  border: "2px solid #e0e0e0",
  "&:hover": {
    boxShadow: theme.shadows[4],
    border: "2px solid #2196f3",
  },
  "&.drawing": {
    cursor: "none",
  },
  "&.eraser": {
    cursor: "grab",
  },
}));

// Top toolbar
export const TopToolbar = styled(AppBar)(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
  transition: "all 0.3s ease-in-out",
  "&.hidden": {
    transform: "translateY(-100%)",
    opacity: 0,
  },
}));

// Toolbar content
export const ToolbarContent = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  minHeight: "auto",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

// Tool section
export const ToolSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

// Tool button group
export const ToolButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  "& .MuiButton-root": {
    padding: theme.spacing(1),
    minWidth: "auto",
    aspectRatio: "1",
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
    "&.active": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

// Color palette
export const ColorPalette = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  flexWrap: "wrap",
  alignItems: "center",
}));

// Color button
export const ColorButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== "colorValue" && prop !== "selected",
})<{ colorValue: string; selected: boolean }>(
  ({ theme, colorValue, selected }) => ({
    width: 32,
    height: 32,
    padding: 0,
    borderRadius: "50%",
    backgroundColor: colorValue,
    border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: theme.shadows[4],
    },
    "&.selected": {
      border: `3px solid ${theme.palette.primary.main}`,
      boxShadow: theme.shadows[3],
    },
  })
);

// Thickness section
export const ThicknessSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  minWidth: 120,
}));

// Thickness slider
export const ThicknessSlider = styled(Slider)(({ theme }) => ({
  "& .MuiSlider-thumb": {
    width: 20,
    height: 20,
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  "& .MuiSlider-track": {
    border: "none",
  },
}));

// Action buttons section
export const ActionSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

// Action button
export const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
  "&.danger": {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.light,
    },
  },
  "&.success": {
    color: theme.palette.success.main,
    "&:hover": {
      backgroundColor: theme.palette.success.light,
    },
  },
  "&:disabled": {
    opacity: 0.5,
    transform: "none",
  },
}));

// Status bar
export const StatusBar = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 10,
}));

// Status chip
export const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  backdropFilter: "blur(10px)",
  "& .MuiChip-label": {
    fontSize: "0.75rem",
  },
}));

// Status content
export const StatusContent = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.spacing(1),
  color: theme.palette.common.white,
  fontSize: "0.875rem",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(0.5),
    textAlign: "center",
  },
}));

// Toggle toolbar button
export const ToggleToolbarButton = styled(Fab)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 20,
  width: 48,
  height: 48,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[4],
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
    boxShadow: theme.shadows[8],
  },
}));

// Tool info section
export const ToolInfoSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.spacing(1),
  minWidth: 120,
}));

// Tool info text
export const ToolInfoText = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

// Responsive wrapper
export const ResponsiveWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "none",
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiToolbar-root": {
      flexDirection: "column",
      gap: theme.spacing(1),
    },
  },
}));

// Loading overlay
export const LoadingOverlay = styled(Box)(({ theme: _theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(5px)",
  zIndex: 1000,
}));

// Performance indicator
export const PerformanceIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  left: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.info.main,
  color: theme.palette.info.contrastText,
  borderRadius: theme.spacing(0.5),
  fontSize: "0.75rem",
  fontWeight: 500,
  zIndex: 15,
}));
