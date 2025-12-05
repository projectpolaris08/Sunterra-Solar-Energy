import { useEffect, useState, useRef } from "react";
import type { Map as MapboxMap, MapMouseEvent } from "mapbox-gl";
import {
  RoofPolygon,
  SolarPanel,
  PanelPlacementSettings,
} from "../../types/solar-design";
import {
  RotateCw,
  Trash2,
  Grid3x3,
  Hand,
  MousePointerClick,
  Plus,
  X,
  AlertTriangle,
} from "lucide-react";

interface PanelPlacerProps {
  roofPolygons: RoofPolygon[];
  panels: SolarPanel[];
  onPanelsChange: (panels: SolarPanel[]) => void;
  map: MapboxMap | null;
  isManualMode: boolean;
  onManualModeChange: (manual: boolean) => void;
}

// Panel specifications
const PANEL_LENGTH = 2.382; // meters (2382mm)
const PANEL_WIDTH = 1.134; // meters (1134mm)
const PANEL_POWER = 0.62; // kW (620W)
const DEFAULT_SPACING = 0; // meters (ZERO gap - panels can touch, minimal spacing only for overlap prevention)
const DEFAULT_EDGE_BUFFER = 0.2; // meters (reduced for maximum coverage)

export default function PanelPlacer({
  roofPolygons,
  panels,
  onPanelsChange,
  map,
  isManualMode,
  onManualModeChange,
}: PanelPlacerProps) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [draggingPanel, setDraggingPanel] = useState<string | null>(null);
  const [panelToDelete, setPanelToDelete] = useState<string | null>(null);
  // State variables for UI (set but not directly read - refs are used for logic)
  const [, setDragStartPos] = useState<[number, number] | null>(null);
  const [, setDragStartPanelPos] = useState<[number, number] | null>(null);
  // Track if mouse actually moved during drag (to distinguish drag from click)
  const hasDragged = useRef<boolean>(false);
  const dragStartTime = useRef<number>(0);
  // CRITICAL: Use refs for drag state to avoid stale closures in event handlers
  const draggingPanelRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<[number, number] | null>(null);
  const dragStartPanelPosRef = useRef<[number, number] | null>(null);
  const [settings, setSettings] = useState<PanelPlacementSettings>({
    spacing: DEFAULT_SPACING,
    edgeBuffer: DEFAULT_EDGE_BUFFER,
    orientation: 0,
    allowRotation: true,
    numberOfStrings: 2, // Default to 2 strings
  });
  const [snapToGrid, setSnapToGrid] = useState(true); // Grid snapping toggle
  const [freePlacement, setFreePlacement] = useState(false); // Allow placement anywhere
  // CRITICAL: Use ref to always have latest panels in event handlers (avoid closure issues)
  const panelsRef = useRef<SolarPanel[]>(panels);
  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);
  const panelHandlers = useRef<
    Map<
      string,
      {
        click: (e: MapMouseEvent) => void;
        enter: () => void;
        leave: () => void;
        mousedown: (e: MapMouseEvent) => void;
        canvasMouseDown?: (e: MouseEvent) => void;
      }
    >
  >(new globalThis.Map());
  const dragHandlers = useRef<{
    move?: (e: MapMouseEvent) => void;
    up?: () => void;
    nativeMove?: (e: MouseEvent) => void;
    nativeUp?: (e: MouseEvent) => void;
    windowMove?: (e: MouseEvent) => void;
  }>({});

  // Calculate panel corners from center position and rotation
  const calculatePanelCorners = (
    center: [number, number],
    rotation: number
  ): [number, number][] => {
    const [lng, lat] = center;

    // Convert rotation to radians
    const angleRad = (rotation * Math.PI) / 180;

    // Determine actual length and width based on rotation
    const actualLength = rotation === 90 ? PANEL_WIDTH : PANEL_LENGTH;
    const actualWidth = rotation === 90 ? PANEL_LENGTH : PANEL_WIDTH;

    // Calculate half dimensions in degrees (approximate conversion)
    // 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLng = 111000 * Math.cos((lat * Math.PI) / 180);

    // Calculate half dimensions in degrees
    const halfLengthLng = actualLength / 2 / metersPerDegreeLng;
    const halfWidthLat = actualWidth / 2 / metersPerDegreeLat;

    // Calculate corners relative to center (before rotation)
    const corners: [number, number][] = [
      [-halfLengthLng, -halfWidthLat],
      [halfLengthLng, -halfWidthLat],
      [halfLengthLng, halfWidthLat],
      [-halfLengthLng, halfWidthLat],
    ];

    // Rotate corners around center
    const rotatedCorners = corners.map(([dx, dy]) => {
      const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
      const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
      return [lng + rotatedX, lat + rotatedY] as [number, number];
    });

    return rotatedCorners;
  };

  // Check if two rectangles overlap (conservative check for rotated rectangles)
  const doRectanglesOverlap = (
    center1: [number, number],
    length1: number,
    width1: number,
    center2: [number, number],
    length2: number,
    width2: number,
    spacing: number
  ): boolean => {
    const [lng1, lat1] = center1;
    const [lng2, lat2] = center2;

    // Convert to meters for accurate distance calculation
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLng = 111000 * Math.cos((lat1 * Math.PI) / 180);

    // Calculate distance between centers in meters
    const dx = (lng2 - lng1) * metersPerDegreeLng;
    const dy = (lat2 - lat1) * metersPerDegreeLat;

    // For rotated rectangles, use a conservative bounding box check
    // Calculate the maximum extent of each panel (diagonal half-length)
    const maxExtent1 = Math.sqrt(
      Math.pow(length1 / 2, 2) + Math.pow(width1 / 2, 2)
    );
    const maxExtent2 = Math.sqrt(
      Math.pow(length2 / 2, 2) + Math.pow(width2 / 2, 2)
    );

    // Minimum distance required to avoid overlap (including spacing)
    const minDistance = maxExtent1 + maxExtent2 + spacing;

    // Check if centers are too close
    const actualDistance = Math.sqrt(dx * dx + dy * dy);
    if (actualDistance < minDistance) {
      return true; // Overlaps
    }

    // More accurate check: project onto axes and check separation
    // For simplicity, if the distance is less than the sum of half-dimensions + spacing,
    // they likely overlap
    const halfLength1 = length1 / 2;
    const halfWidth1 = width1 / 2;
    const halfLength2 = length2 / 2;
    const halfWidth2 = width2 / 2;

    // Check separation along both axes (conservative approach)
    const minSeparationX = halfLength1 + halfLength2 + spacing;
    const minSeparationY = halfWidth1 + halfWidth2 + spacing;

    // If distance in both X and Y is less than required, they overlap
    if (Math.abs(dx) < minSeparationX && Math.abs(dy) < minSeparationY) {
      return true; // Overlaps
    }

    return false; // No overlap
  };

  // Check if point is inside polygon (ray casting algorithm)
  const isPointInPolygon = (
    point: [number, number],
    polygon: [number, number][]
  ): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Check if panel fits in polygon with buffer
  const isPanelValid = (
    center: [number, number],
    rotation: number,
    polygon: RoofPolygon
  ): boolean => {
    const corners = calculatePanelCorners(center, rotation);

    // Check if all corners are inside polygon
    for (const corner of corners) {
      if (!isPointInPolygon(corner, polygon.coordinates)) {
        return false;
      }
    }

    // Check distance from edges (simplified - check center distance)
    // This is approximate; full edge distance check would be more complex
    const [centerLng, centerLat] = center;
    const minDistance = settings.edgeBuffer;

    // Approximate edge distance check
    let minEdgeDistance = Infinity;
    for (let i = 0; i < polygon.coordinates.length; i++) {
      const [p1Lng, p1Lat] = polygon.coordinates[i];
      const [p2Lng, p2Lat] =
        polygon.coordinates[(i + 1) % polygon.coordinates.length];

      // Distance from point to line segment
      const A = centerLng - p1Lng;
      const B = centerLat - p1Lat;
      const C = p2Lng - p1Lng;
      const D = p2Lat - p1Lat;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = p1Lng;
        yy = p1Lat;
      } else if (param > 1) {
        xx = p2Lng;
        yy = p2Lat;
      } else {
        xx = p1Lng + param * C;
        yy = p1Lat + param * D;
      }

      const dx = centerLng - xx;
      const dy = centerLat - yy;
      const distance = Math.sqrt(dx * dx + dy * dy) * 111000; // Convert to meters
      minEdgeDistance = Math.min(minEdgeDistance, distance);
    }

    return minEdgeDistance >= minDistance;
  };

  // Auto-detect roof orientation (find longest edge)
  const detectRoofOrientation = (polygon: RoofPolygon): number => {
    if (polygon.coordinates.length < 2) return 0;

    let maxLength = 0;
    let maxAngle = 0;

    for (let i = 0; i < polygon.coordinates.length; i++) {
      const [p1Lng, p1Lat] = polygon.coordinates[i];
      const [p2Lng, p2Lat] =
        polygon.coordinates[(i + 1) % polygon.coordinates.length];

      const dx = p2Lng - p1Lng;
      const dy = p2Lat - p1Lat;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > maxLength) {
        maxLength = length;
        // Calculate angle in degrees
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        maxAngle = angle;
      }
    }

    return maxAngle;
  };

  // Clean, aligned, realistic solar panel layout
  // Algorithm: Grid-based placement aligned with roof's longest edge
  const autoPlacePanels = (polygon: RoofPolygon): SolarPanel[] => {
    if (polygon.coordinates.length < 3) return [];

    // Step 1: Determine Roof Orientation (longest edge angle)
    const roofAngle = detectRoofOrientation(polygon);
    const roofAngleRad = (roofAngle * Math.PI) / 180;
    const cosAngle = Math.cos(roofAngleRad);
    const sinAngle = Math.sin(roofAngleRad);

    // Calculate polygon center (centroid)
    let sumLng = 0,
      sumLat = 0;
    for (const [lng, lat] of polygon.coordinates) {
      sumLng += lng;
      sumLat += lat;
    }
    const polygonCenter: [number, number] = [
      sumLng / polygon.coordinates.length,
      sumLat / polygon.coordinates.length,
    ];
    const centerLat = polygonCenter[1];

    // Convert meters to degrees
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLng = 111000 * Math.cos((centerLat * Math.PI) / 180);

    // Panel dimensions (actual size: 2.382m x 1.134m)
    // Panels should be placed HORIZONTALLY (side by side)
    // Length (2.382m) goes along the roof's main direction (horizontal)
    // Width (1.134m) goes perpendicular (vertical)
    const panelLength = PANEL_LENGTH; // 2.382m (horizontal dimension - side by side)
    const panelWidth = PANEL_WIDTH; // 1.134m (vertical dimension - row height)
    const spacing = settings.spacing; // 0m (zero gap - panels can touch, minimal spacing only for overlap prevention)

    // Grid spacing in meters (panel + gap)
    // Horizontal spacing: panel length + gap (for side-by-side placement)
    const gridSpacingX = panelLength + spacing; // Horizontal spacing (side by side)
    // Vertical spacing: panel width + gap (for rows)
    const gridSpacingY = panelWidth + spacing; // Vertical spacing (between rows)

    // Convert to degrees
    const gridSpacingLng = gridSpacingX / metersPerDegreeLng;
    const gridSpacingLat = gridSpacingY / metersPerDegreeLat;
    const edgeBufferDeg = 0.1 / metersPerDegreeLat; // Use 0.1m edge buffer

    // Step 2: Build a Grid That Fills the Polygon
    // Transform polygon to rotated coordinate system (aligned with roof)
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const [lng, lat] of polygon.coordinates) {
      // Translate to origin
      const dx = lng - polygonCenter[0];
      const dy = lat - polygonCenter[1];

      // Rotate to local coordinates (inverse rotation to align with roof)
      const localX = dx * cosAngle + dy * sinAngle;
      const localY = -dx * sinAngle + dy * cosAngle;

      minX = Math.min(minX, localX);
      maxX = Math.max(maxX, localX);
      minY = Math.min(minY, localY);
      maxY = Math.max(maxY, localY);
    }

    // Panel half-dimensions in degrees
    // Since panels are horizontal (rotation = 0), we use actual dimensions
    const halfPanelLengthDeg = panelLength / 2 / metersPerDegreeLng; // Horizontal half-length
    const halfPanelWidthDeg = panelWidth / 2 / metersPerDegreeLat; // Vertical half-width

    // For horizontal panels in a rotated grid, project dimensions onto local axes
    // Local X is along roof's main direction, Local Y is perpendicular
    const halfLengthLocal =
      Math.abs(halfPanelLengthDeg * cosAngle) +
      Math.abs(halfPanelWidthDeg * sinAngle);
    const halfWidthLocal =
      Math.abs(halfPanelLengthDeg * sinAngle) +
      Math.abs(halfPanelWidthDeg * cosAngle);

    // Grid bounds with edge buffer
    const startX = minX + edgeBufferDeg + halfLengthLocal;
    const endX = maxX - edgeBufferDeg - halfLengthLocal;
    const startY = maxY - edgeBufferDeg - halfWidthLocal;
    const endY = minY + edgeBufferDeg + halfWidthLocal;

    // Grid spacing in local (rotated) coordinates
    // Transform spacing vector from global to local coordinate system
    const localSpacingX = gridSpacingLng * cosAngle + gridSpacingLat * sinAngle;
    const localSpacingY =
      -gridSpacingLng * sinAngle + gridSpacingLat * cosAngle;

    // Calculate grid dimensions
    const gridWidth = Math.max(0, endX - startX);
    const gridHeight = Math.max(0, startY - endY);
    const absLocalSpacingX = Math.abs(localSpacingX);
    const absLocalSpacingY = Math.abs(localSpacingY);

    const maxCols = Math.max(1, Math.floor(gridWidth / absLocalSpacingX));
    const maxRows = Math.max(1, Math.floor(gridHeight / absLocalSpacingY));

    // Step 3: Place panels in clean grid and verify each fits
    const placedPanels: SolarPanel[] = [];

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        // Calculate grid position in local coordinates
        const localX = startX + col * absLocalSpacingX;
        const localY = startY - row * absLocalSpacingY;

        // Transform back to global coordinates
        const rotatedX = localX * cosAngle - localY * sinAngle;
        const rotatedY = localX * sinAngle + localY * cosAngle;

        const globalLng = polygonCenter[0] + rotatedX;
        const globalLat = polygonCenter[1] + rotatedY;
        const center: [number, number] = [globalLng, globalLat];

        // Panel rotation = 0 (panels are horizontal, side by side)
        // Panels should NOT rotate with roof - they stay horizontal
        const panelRotation = 0;

        // Step 3: Verify That the Entire Panel Fits
        const corners = calculatePanelCorners(center, panelRotation);

        // Check if corners are inside polygon
        let cornersInside = 0;
        for (const corner of corners) {
          if (isPointInPolygon(corner, polygon.coordinates)) {
            cornersInside++;
          }
        }

        // Accept panel if center is inside AND at least 2 corners are inside (more lenient for max coverage)
        const centerInside = isPointInPolygon(center, polygon.coordinates);
        if (centerInside && cornersInside >= 2) {
          // Check for overlaps with existing panels using accurate rectangle overlap detection
          let overlaps = false;

          for (const existingPanel of placedPanels) {
            // Get existing panel dimensions (accounting for rotation)
            const existingRotation = existingPanel.rotation;
            const existingPanelLength =
              existingRotation === 90 ? PANEL_WIDTH : PANEL_LENGTH;
            const existingPanelWidth =
              existingRotation === 90 ? PANEL_LENGTH : PANEL_WIDTH;

            // Check if rectangles overlap
            if (
              doRectanglesOverlap(
                center,
                panelLength,
                panelWidth,
                existingPanel.position,
                existingPanelLength,
                existingPanelWidth,
                spacing
              )
            ) {
              overlaps = true;
              break;
            }
          }

          if (!overlaps) {
            placedPanels.push({
              id: `panel-${Date.now()}-${row}-${col}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              position: center,
              length: PANEL_LENGTH,
              width: PANEL_WIDTH,
              rotation: panelRotation, // All panels have same rotation (aligned with roof)
              power: PANEL_POWER,
              corners,
            });
          }
        }
      }
    }

    // Update settings - panels are horizontal (rotation = 0)
    setSettings((prev) => ({ ...prev, orientation: 0 }));

    return placedPanels;
  };

  // Handle auto-place button
  const handleAutoPlace = () => {
    if (roofPolygons.length === 0) {
      alert("Please draw at least one roof section first.");
      return;
    }

    const allPanels: SolarPanel[] = [];

    // Place panels on each roof polygon
    for (const polygon of roofPolygons) {
      const panels = autoPlacePanels(polygon);
      allPanels.push(...panels);
    }

    onPanelsChange(allPanels);
  };

  // Snap point to grid (for consistent spacing)
  const snapPointToGrid = (
    point: [number, number],
    polygon: RoofPolygon
  ): [number, number] => {
    // Calculate grid parameters similar to auto-placement
    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;

    for (const [lng, lat] of polygon.coordinates) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }

    const centerLat = (minLat + maxLat) / 2;
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLng = 111000 * Math.cos((centerLat * Math.PI) / 180);

    const panelLengthWithSpacing = PANEL_LENGTH + settings.spacing;
    const panelWidthWithSpacing = PANEL_WIDTH + settings.spacing;

    const stepLng = panelLengthWithSpacing / metersPerDegreeLng;
    const stepLat = panelWidthWithSpacing / metersPerDegreeLat;

    const edgeBufferDegLng = settings.edgeBuffer / metersPerDegreeLng;
    const edgeBufferDegLat = settings.edgeBuffer / metersPerDegreeLat;

    const startLng =
      minLng + edgeBufferDegLng + PANEL_LENGTH / 2 / metersPerDegreeLng;
    const startLat =
      maxLat - edgeBufferDegLat - PANEL_WIDTH / 2 / metersPerDegreeLat;

    // Snap to nearest grid point
    const col = Math.round((point[0] - startLng) / stepLng);
    const row = Math.round((startLat - point[1]) / stepLat);

    return [startLng + col * stepLng, startLat - row * stepLat];
  };

  // Handle manual panel placement (renamed to avoid conflict)
  const handleMapClickForPlacement = (e: MapMouseEvent) => {
    if (!isManualMode || !map) return;

    // Prevent event from bubbling to MapView's click handler
    if (e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
    }

    let point: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    // Find which roof polygon this point belongs to
    let targetPolygon: RoofPolygon | null = null;
    for (const polygon of roofPolygons) {
      if (isPointInPolygon(point, polygon.coordinates)) {
        targetPolygon = polygon;
        break;
      }
    }

    if (!targetPolygon && !freePlacement) {
      // Show visual feedback - cursor change
      const canvas = map.getCanvas();
      const originalCursor = canvas.style.cursor;
      canvas.style.cursor = "not-allowed";
      setTimeout(() => {
        canvas.style.cursor = originalCursor;
      }, 500);
      return;
    }

    // If free placement is enabled, allow placement anywhere
    if (!targetPolygon && freePlacement) {
      targetPolygon = roofPolygons[0] || null; // Use first polygon for grid calculation if available
    }

    // Detect roof orientation to align panels properly (if polygon exists)
    const roofOrientation = targetPolygon
      ? detectRoofOrientation(targetPolygon)
      : 0;
    const normalizedRoofAngle = ((roofOrientation % 360) + 360) % 360;

    // Determine panel rotation based on roof orientation
    // If roof is more vertical (45-135° or 225-315°), rotate panels 90°
    // Otherwise, keep panels horizontal (0°)
    let panelRotation = 0;
    if (
      (normalizedRoofAngle > 45 && normalizedRoofAngle < 135) ||
      (normalizedRoofAngle > 225 && normalizedRoofAngle < 315)
    ) {
      panelRotation = 90; // Roof is more vertical, rotate panels
    }

    // Update settings to match detected orientation for consistency
    if (settings.orientation !== panelRotation) {
      setSettings((prev) => ({ ...prev, orientation: panelRotation }));
    }

    // Snap to grid for alignment (if enabled and polygon exists)
    if (snapToGrid && targetPolygon) {
      point = snapPointToGrid(point, targetPolygon);
    }

    // Check if panel fits - use roof-aligned rotation
    const rotation = panelRotation;

    // For manual placement, use a smaller edge buffer (0.1m instead of 0.5m) to allow placement closer to edges
    const manualEdgeBuffer = 0.1; // 10cm buffer for manual placement

    // Validate panel placement (skip if free placement is enabled)
    if (targetPolygon && !freePlacement) {
      const panelCorners = calculatePanelCorners(point, rotation);

      // Check if all corners are inside polygon (more lenient in manual mode)
      let cornersInside = 0;
      for (const corner of panelCorners) {
        if (isPointInPolygon(corner, targetPolygon.coordinates)) {
          cornersInside++;
        }
      }

      // Allow placement if at least 2 corners are inside (more lenient)
      if (cornersInside < 2) {
        // Show visual feedback
        const canvas = map.getCanvas();
        const originalCursor = canvas.style.cursor;
        canvas.style.cursor = "not-allowed";
        setTimeout(() => {
          canvas.style.cursor = originalCursor;
        }, 500);
        return;
      }
    }

    // Check edge distance with reduced buffer for manual placement (skip if free placement)
    if (targetPolygon && !freePlacement) {
      const [centerLng, centerLat] = point;
      const metersPerDegreeLat = 111000;
      const metersPerDegreeLng = 111000 * Math.cos((centerLat * Math.PI) / 180);

      let minEdgeDistance = Infinity;
      for (let i = 0; i < targetPolygon.coordinates.length; i++) {
        const [p1Lng, p1Lat] = targetPolygon.coordinates[i];
        const [p2Lng, p2Lat] =
          targetPolygon.coordinates[(i + 1) % targetPolygon.coordinates.length];

        // Distance from point to line segment
        const A = centerLng - p1Lng;
        const B = centerLat - p1Lat;
        const C = p2Lng - p1Lng;
        const D = p2Lat - p1Lat;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
          xx = p1Lng;
          yy = p1Lat;
        } else if (param > 1) {
          xx = p2Lng;
          yy = p2Lat;
        } else {
          xx = p1Lng + param * C;
          yy = p1Lat + param * D;
        }

        const dx = (centerLng - xx) * metersPerDegreeLng;
        const dy = (centerLat - yy) * metersPerDegreeLat;
        const distance = Math.sqrt(dx * dx + dy * dy) / 1000; // Convert to km, then to meters

        minEdgeDistance = Math.min(minEdgeDistance, distance);
      }

      // Use reduced buffer for manual placement
      if (minEdgeDistance < manualEdgeBuffer) {
        // Show visual feedback
        const canvas = map.getCanvas();
        const originalCursor = canvas.style.cursor;
        canvas.style.cursor = "not-allowed";
        setTimeout(() => {
          canvas.style.cursor = originalCursor;
        }, 500);
        return;
      }
    }

    // Check for overlaps with existing panels
    let hasOverlap = false;
    const overlapCenterLat = point[1];
    const overlapMetersPerDegreeLat = 111000;
    const overlapMetersPerDegreeLng =
      111000 * Math.cos((overlapCenterLat * Math.PI) / 180);

    for (const existingPanel of panels) {
      const dx =
        (point[0] - existingPanel.position[0]) * overlapMetersPerDegreeLng;
      const dy =
        (point[1] - existingPanel.position[1]) * overlapMetersPerDegreeLat;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check overlap with spacing requirement
      if (dist < PANEL_LENGTH + settings.spacing) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      // Show visual feedback
      const canvas = map.getCanvas();
      const originalCursor = canvas.style.cursor;
      canvas.style.cursor = "not-allowed";
      setTimeout(() => {
        canvas.style.cursor = originalCursor;
      }, 500);
      return;
    }

    // Place panel
    const finalCorners = calculatePanelCorners(point, rotation);
    const newPanel: SolarPanel = {
      id: `panel-manual-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      position: point,
      length: PANEL_LENGTH,
      width: PANEL_WIDTH,
      rotation,
      power: PANEL_POWER,
      corners: finalCorners,
    };

    onPanelsChange([...panels, newPanel]);

    // Visual feedback - select the new panel and show success cursor
    setSelectedPanel(newPanel.id);
    const canvas = map.getCanvas();
    canvas.style.cursor = "pointer";
    setTimeout(() => {
      canvas.style.cursor = "";
    }, 200);
  };

  // Handle adding a panel via button (places at center of first roof polygon)
  const handleAddPanelButton = () => {
    if (!map || roofPolygons.length === 0) {
      alert("Please draw a roof section first!");
      return;
    }

    // Get the first roof polygon
    const targetPolygon = roofPolygons[0];

    // Calculate center of polygon
    let centerLng = 0;
    let centerLat = 0;
    for (const coord of targetPolygon.coordinates) {
      centerLng += coord[0];
      centerLat += coord[1];
    }
    centerLng /= targetPolygon.coordinates.length;
    centerLat /= targetPolygon.coordinates.length;

    const point: [number, number] = [centerLng, centerLat];

    // Detect roof orientation
    const roofOrientation = detectRoofOrientation(targetPolygon);
    const normalizedRoofAngle = ((roofOrientation % 360) + 360) % 360;
    let panelRotation = 0;
    if (
      (normalizedRoofAngle > 45 && normalizedRoofAngle < 135) ||
      (normalizedRoofAngle > 225 && normalizedRoofAngle < 315)
    ) {
      panelRotation = 90;
    }

    // Place panel at center
    const finalCorners = calculatePanelCorners(point, panelRotation);
    const newPanel: SolarPanel = {
      id: `panel-button-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      position: point,
      length: PANEL_LENGTH,
      width: PANEL_WIDTH,
      rotation: panelRotation,
      power: PANEL_POWER,
      corners: finalCorners,
    };

    onPanelsChange([...panels, newPanel]);
    setSelectedPanel(newPanel.id);
  };

  // Handle panel selection
  const handleSelectPanel = (panelId: string) => {
    setSelectedPanel(panelId === selectedPanel ? null : panelId);
  };

  // Handle panel drag start
  const handlePanelDragStart = (panelId: string, e: MapMouseEvent) => {
    if (!map) {
      return;
    }

    // CRITICAL: Clear any existing drag state first to prevent conflicts
    draggingPanelRef.current = null;
    dragStartPosRef.current = null;
    dragStartPanelPosRef.current = null;

    const panel = panels.find((p) => p.id === panelId);
    if (!panel) {
      return;
    }

    // CRITICAL: Reset drag tracking
    hasDragged.current = false;
    dragStartTime.current = Date.now();

    // Prevent map panning when dragging panels - CRITICAL
    e.preventDefault();
    if (e.originalEvent) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
    }

    // CRITICAL: Clean up OLD handlers FIRST, before setting refs
    // This prevents old handlers from seeing new refs and interfering
    const canvas = map.getCanvas();

    // Remove canvas listeners
    if (dragHandlers.current.nativeMove) {
      canvas.removeEventListener("mousemove", dragHandlers.current.nativeMove, {
        capture: true,
      } as any);
    }
    if (dragHandlers.current.nativeUp) {
      canvas.removeEventListener("mouseup", dragHandlers.current.nativeUp, {
        capture: true,
      } as any);
      canvas.removeEventListener("mouseleave", dragHandlers.current.nativeUp);
    }

    // Remove window listeners
    if (dragHandlers.current.windowMove) {
      window.removeEventListener("mousemove", dragHandlers.current.windowMove, {
        capture: true,
      } as any);
    }
    if (dragHandlers.current.nativeUp) {
      window.removeEventListener("mouseup", dragHandlers.current.nativeUp, {
        capture: true,
      } as any);
    }

    // Clear ALL handlers ref
    dragHandlers.current = {
      move: undefined,
      up: undefined,
      nativeMove: undefined,
      nativeUp: undefined,
      windowMove: undefined,
    };

    // CRITICAL: Set refs AFTER cleanup, before attaching new listeners
    // This ensures handlers have immediate access to drag state
    const startPos: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const panelPos: [number, number] = [panel.position[0], panel.position[1]];

    // Set refs IMMEDIATELY (synchronous)
    draggingPanelRef.current = panelId;
    dragStartPosRef.current = startPos;
    dragStartPanelPosRef.current = panelPos;

    // Then set state (async, for UI updates)
    setDraggingPanel(panelId);
    setSelectedPanel(panelId);
    setDragStartPos(startPos);
    setDragStartPanelPos(panelPos);

    map.getCanvas().style.cursor = "grabbing";

    // Disable ALL map interactions temporarily - CRITICAL for dragging to work
    if (map.dragPan) {
      map.dragPan.disable();
    }
    if (map.boxZoom) {
      map.boxZoom.disable();
    }
    if (map.scrollZoom) {
      map.scrollZoom.disable();
    }
    if (map.doubleClickZoom) {
      map.doubleClickZoom.disable();
    }

    // Set up drag handlers immediately - use native DOM events for reliability
    const handleGlobalMouseMove = (moveEvent: MouseEvent | MapMouseEvent) => {
      if ("preventDefault" in moveEvent) {
        moveEvent.preventDefault();
      }
      if ("originalEvent" in moveEvent && moveEvent.originalEvent) {
        moveEvent.originalEvent.stopPropagation();
        moveEvent.originalEvent.stopImmediatePropagation();
      } else if (moveEvent instanceof MouseEvent) {
        moveEvent.stopPropagation();
        moveEvent.stopImmediatePropagation();
      }
      handlePanelDrag(moveEvent as any);
    };

    const handleGlobalMouseUp = (upEvent?: MapMouseEvent | MouseEvent) => {
      if (upEvent && "preventDefault" in upEvent) {
        upEvent.preventDefault();
        if ("stopPropagation" in upEvent) {
          upEvent.stopPropagation();
        }
      }
      handlePanelDragEnd();

      // Clean up handlers
      if (map) {
        map.off("mousemove", handleGlobalMouseMove);
        map.off("mouseup", handleGlobalMouseUp as any);
        map
          .getCanvas()
          .removeEventListener("mouseleave", handleGlobalMouseUp as any);
        map
          .getCanvas()
          .removeEventListener("mouseup", handleGlobalMouseUp as any);
      }
    };

    // Store handlers for cleanup
    dragHandlers.current.move = handleGlobalMouseMove;
    dragHandlers.current.up = handleGlobalMouseUp;

    // Attach handlers to both Mapbox events and native DOM events for better capture
    map.on("mousemove", handleGlobalMouseMove);
    map.on("mouseup", handleGlobalMouseUp as any);

    // Note: canvas already declared above, cleanup already done
    // Now we can safely attach new handlers
    // This MUST happen before setting refs to prevent old handlers from interfering
    if (dragHandlers.current.nativeMove) {
      canvas.removeEventListener("mousemove", dragHandlers.current.nativeMove, {
        capture: true,
      } as any);
      if (dragHandlers.current.windowMove) {
        window.removeEventListener(
          "mousemove",
          dragHandlers.current.windowMove,
          {
            capture: true,
          } as any
        );
      }
    }
    if (dragHandlers.current.nativeUp) {
      canvas.removeEventListener("mouseup", dragHandlers.current.nativeUp, {
        capture: true,
      } as any);
      canvas.removeEventListener("mouseleave", dragHandlers.current.nativeUp);
      window.removeEventListener("mouseup", dragHandlers.current.nativeUp, {
        capture: true,
      } as any);
    }
    // Clear handlers ref to ensure old handlers are completely gone
    dragHandlers.current.nativeMove = undefined;
    dragHandlers.current.nativeUp = undefined;
    dragHandlers.current.windowMove = undefined;

    // Use native DOM events for more reliable dragging - DIRECT UPDATE
    // CRITICAL: Don't capture panelId in closure - check refs directly
    // This prevents stale handlers from previous drags from interfering
    const nativeMouseMove = (e: MouseEvent) => {
      // Use refs for immediate access (state updates are async)
      const currentDraggingPanel = draggingPanelRef.current;
      const currentDragStartPos = dragStartPosRef.current;
      const currentDragStartPanelPos = dragStartPanelPosRef.current;

      // CRITICAL: Only process if refs are set (don't check panelId - refs are cleared on drag end)
      // If refs are null, this is either:
      // 1. A stale handler from a previous drag (shouldn't happen if cleanup works)
      // 2. Drag hasn't started yet (shouldn't happen)
      // 3. Drag already ended (refs cleared)
      if (
        !currentDraggingPanel ||
        !currentDragStartPos ||
        !currentDragStartPanelPos
      ) {
        // Silently skip - this is likely a stale event or drag has ended
        // Don't log here to avoid console spam
        return;
      }

      // Verify we're still dragging (defensive check)
      if (currentDraggingPanel !== draggingPanelRef.current) {
        // Drag state changed during event processing - abort
        return;
      }

      // CRITICAL: Use panelsRef to get latest panels (avoid closure issues)
      // This ensures we always have the most up-to-date panel positions
      const currentPanels = panelsRef.current;

      // Convert screen coordinates to map coordinates DIRECTLY
      const canvasEl = map.getCanvas();
      const rect = canvasEl.getBoundingClientRect();
      const point: [number, number] = [
        e.clientX - rect.left,
        e.clientY - rect.top,
      ];
      const lngLat = map.unproject(point);

      // Mark as dragged
      hasDragged.current = true;

      const panel = currentPanels.find((p) => p.id === currentDraggingPanel);
      if (!panel) {
        return;
      }

      // Calculate offset from mouse start position
      const [startLng, startLat] = currentDragStartPos;
      const [startPanelLng, startPanelLat] = currentDragStartPanelPos;

      const offsetLng = lngLat.lng - startLng;
      const offsetLat = lngLat.lat - startLat;

      // Calculate new position
      const newPosition: [number, number] = [
        startPanelLng + offsetLng,
        startPanelLat + offsetLat,
      ];

      // IMMEDIATELY update panel position - DIRECT UPDATE, NO DELAYS
      const newCorners = calculatePanelCorners(newPosition, panel.rotation);
      const updatedPanels = currentPanels.map((p: SolarPanel) =>
        p.id === currentDraggingPanel
          ? { ...p, position: newPosition, corners: newCorners }
          : p
      );

      // CRITICAL: Update panelsRef immediately so handlePanelDragEnd can read the latest position
      panelsRef.current = updatedPanels;

      // Force immediate update to parent (which will flow back as props)
      onPanelsChange(updatedPanels);
    };

    const nativeMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleGlobalMouseUp(e);
    };

    // Attach native DOM events with capture for priority
    // Refs are already set above, so handlers will have immediate access

    // Attach to canvas (primary)
    canvas.addEventListener("mousemove", nativeMouseMove, {
      passive: false,
      capture: true,
    });
    canvas.addEventListener("mouseup", nativeMouseUp, {
      passive: false,
      capture: true,
    });
    canvas.addEventListener("mouseleave", nativeMouseUp, {
      passive: false,
    });

    // ALSO attach to window as fallback (in case canvas events are blocked)
    // But only process if we're actually dragging (refs are set)
    const windowMouseMove = (e: MouseEvent) => {
      // Only process if we're actually dragging (refs are set)
      if (
        !draggingPanelRef.current ||
        !dragStartPosRef.current ||
        !dragStartPanelPosRef.current
      ) {
        return; // Not dragging, ignore
      }
      nativeMouseMove(e);
    };

    window.addEventListener("mousemove", windowMouseMove, {
      passive: false,
      capture: true,
    });
    window.addEventListener("mouseup", nativeMouseUp, {
      passive: false,
      capture: true,
    });

    // Also attach Mapbox events as backup
    map.on("mousemove", handleGlobalMouseMove);
    map.on("mouseup", handleGlobalMouseUp as any);

    // Store native handlers for cleanup
    dragHandlers.current.nativeMove = nativeMouseMove;
    dragHandlers.current.nativeUp = nativeMouseUp;
  };

  // Handle panel drag - COMPLETELY FREE, IMMEDIATE UPDATE
  const handlePanelDrag = (e: MapMouseEvent | any) => {
    // Use refs for immediate access (state updates are async)
    const currentDraggingPanel = draggingPanelRef.current;
    const currentDragStartPos = dragStartPosRef.current;
    const currentDragStartPanelPos = dragStartPanelPosRef.current;

    if (
      !map ||
      !currentDraggingPanel ||
      !currentDragStartPos ||
      !currentDragStartPanelPos
    ) {
      return;
    }

    // Mark that we've actually dragged (mouse moved)
    hasDragged.current = true;

    // Prevent map panning during drag
    if (e.preventDefault) e.preventDefault();
    if (e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
    }

    // Get current mouse position
    let currentLng: number, currentLat: number;
    if (e.lngLat) {
      currentLng = e.lngLat.lng;
      currentLat = e.lngLat.lat;
    } else {
      return; // Invalid event
    }

    // Get current panel from state
    const panel = panels.find((p) => p.id === currentDraggingPanel);
    if (!panel) return;

    const [startLng, startLat] = currentDragStartPos;
    const [startPanelLng, startPanelLat] = currentDragStartPanelPos;

    // Calculate offset from mouse start position
    const offsetLng = currentLng - startLng;
    const offsetLat = currentLat - startLat;

    // Calculate new position relative to original panel position
    const newPosition: [number, number] = [
      startPanelLng + offsetLng,
      startPanelLat + offsetLat,
    ];

    // IMMEDIATELY update panel position - NO restrictions, NO validation
    // Panel moves smoothly with mouse cursor
    const newCorners = calculatePanelCorners(newPosition, panel.rotation);
    const updatedPanels = panels.map((p) =>
      p.id === currentDraggingPanel
        ? { ...p, position: newPosition, corners: newCorners }
        : p
    );

    onPanelsChange(updatedPanels);
  };

  // Handle panel drag end - COMPLETELY FREE, NO RESTRICTIONS
  const handlePanelDragEnd = () => {
    if (!map) return;

    // Use refs for immediate access (state updates are async)
    const currentDraggingPanel = draggingPanelRef.current;
    const currentDragStartPanelPos = dragStartPanelPosRef.current;

    // When drag ends, panel stays EXACTLY where it was dragged - NO validation, NO snapping, NO restrictions
    if (currentDraggingPanel && currentDragStartPanelPos) {
      // CRITICAL: Use panelsRef to get the LATEST panel position (from the drag updates)
      // Don't use panels prop - it might be stale due to async state updates
      const panel = panelsRef.current.find(
        (p) => p.id === currentDraggingPanel
      );
      if (panel) {
        // Panel stays exactly where user dragged it - just update corners
        // NO validation, NO snapping, NO restrictions - COMPLETE FREEDOM
        const finalCorners = calculatePanelCorners(
          panel.position,
          panel.rotation
        );
        // Use panelsRef to ensure we're working with the latest data
        const updatedPanels = panelsRef.current.map((p) =>
          p.id === currentDraggingPanel ? { ...p, corners: finalCorners } : p
        );
        onPanelsChange(updatedPanels);
      }
    }

    // Clear dragging state (both state and refs)
    setDraggingPanel(null);
    draggingPanelRef.current = null;
    setDragStartPos(null);
    dragStartPosRef.current = null;
    setDragStartPanelPos(null);
    dragStartPanelPosRef.current = null;
    hasDragged.current = false;

    // Clean up drag handlers from both Mapbox and native events
    const canvas = map.getCanvas();
    if (dragHandlers.current.move) {
      map.off("mousemove", dragHandlers.current.move);
    }
    if (dragHandlers.current.up) {
      map.off("mouseup", dragHandlers.current.up as any);
    }
    if (dragHandlers.current.nativeMove) {
      // Remove from canvas
      canvas.removeEventListener(
        "mousemove",
        dragHandlers.current.nativeMove,
        true
      );
    }
    if (dragHandlers.current.windowMove) {
      // Remove from window (fallback)
      window.removeEventListener(
        "mousemove",
        dragHandlers.current.windowMove,
        true
      );
    }
    if (dragHandlers.current.nativeUp) {
      // Remove from canvas
      canvas.removeEventListener(
        "mouseup",
        dragHandlers.current.nativeUp,
        true
      );
      canvas.removeEventListener("mouseleave", dragHandlers.current.nativeUp);
      // Remove from window (fallback)
      window.removeEventListener(
        "mouseup",
        dragHandlers.current.nativeUp,
        true
      );
    }
    dragHandlers.current = {};

    setDraggingPanel(null);
    setDragStartPos(null);
    setDragStartPanelPos(null);
    map.getCanvas().style.cursor = "";

    // Re-enable map drag
    if (map.dragPan) {
      map.dragPan.enable();
    }
    if (map.boxZoom) {
      map.boxZoom.enable();
    }
    if (map.scrollZoom) {
      map.scrollZoom.enable();
    }
  };

  // Handle panel rotation - free rotation (increment by 15°)
  const handleRotatePanel = (panelId: string, increment: number = 15) => {
    const panel = panels.find((p) => p.id === panelId);
    if (!panel) return;

    // Rotate by increment (default 15°), wrap around at 360°
    const newRotation = (((panel.rotation + increment) % 360) + 360) % 360;
    const newCorners = calculatePanelCorners(panel.position, newRotation);

    // Check if rotated panel still fits (skip validation if free placement is enabled)
    const polygon = roofPolygons.find((p) =>
      isPointInPolygon(panel.position, p.coordinates)
    );

    if (
      polygon &&
      !freePlacement &&
      !isPanelValid(panel.position, newRotation, polygon)
    ) {
      // If it doesn't fit, try the opposite direction
      const altRotation = (((panel.rotation - increment) % 360) + 360) % 360;
      const altCorners = calculatePanelCorners(panel.position, altRotation);
      if (isPanelValid(panel.position, altRotation, polygon)) {
        const updatedPanels = panels.map((p) =>
          p.id === panelId
            ? { ...p, rotation: altRotation, corners: altCorners }
            : p
        );
        onPanelsChange(updatedPanels);
      }
      return;
    }

    const updatedPanels = panels.map((p) =>
      p.id === panelId
        ? { ...p, rotation: newRotation, corners: newCorners }
        : p
    );

    onPanelsChange(updatedPanels);
  };

  // Handle panel deletion
  const handleDeletePanel = (panelId: string) => {
    onPanelsChange(panels.filter((p) => p.id !== panelId));
    setPanelToDelete(null); // Close modal after deletion
    if (selectedPanel === panelId) {
      setSelectedPanel(null); // Clear selection if deleted panel was selected
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (panelId: string) => {
    setPanelToDelete(panelId);
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setPanelToDelete(null);
  };

  // Render panels on map
  useEffect(() => {
    if (!map || !map.loaded()) return;

    // Get all existing panel layer IDs from the map
    const style = map.getStyle();
    const existingLayers = (style?.layers || []).filter((layer) => {
      if (!layer.id || typeof layer.id !== "string") return false;
      const layerId = layer.id.toLowerCase();
      return (
        layerId.startsWith("panel-layer-") ||
        layerId.startsWith("panel-outline-") ||
        layerId.endsWith("-glow") ||
        layerId.endsWith("-highlight")
      );
    });

    // Remove all existing panel layers and sources
    existingLayers.forEach((layer) => {
      const layerId = layer.id as string;
      if (map.getLayer(layerId)) {
        try {
          map.removeLayer(layerId);
        } catch (e) {
          // Ignore errors if layer doesn't exist
        }
      }
    });

    // Remove all panel sources
    const existingSources = Object.keys(map.getStyle().sources || {}).filter(
      (sourceId) => sourceId.startsWith("panel-source-")
    );
    existingSources.forEach((sourceId) => {
      if (map.getSource(sourceId)) {
        try {
          map.removeSource(sourceId);
        } catch (e) {
          // Ignore errors if source doesn't exist
        }
      }
    });

    // Add panel layers - ensure they're added after roof polygons
    panels.forEach((panel) => {
      const sourceId = `panel-source-${panel.id}`;
      const layerId = `panel-layer-${panel.id}`;
      const outlineId = `panel-outline-${panel.id}`;

      const isSelected = selectedPanel === panel.id;
      const isDragging = draggingPanel === panel.id;

      // Close the polygon
      const closedCorners = [...panel.corners, panel.corners[0]];

      const geoJsonFeature: GeoJSON.Feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [closedCorners],
        },
      };

      map.addSource(sourceId, {
        type: "geojson",
        data: geoJsonFeature,
      });

      // Find where to insert panels (above roof polygons)
      const style = map.getStyle();
      const layers = style?.layers || [];
      let insertBefore: string | undefined;

      // Find the last roof polygon layer to insert panels above it
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (
          layer.id &&
          typeof layer.id === "string" &&
          (layer.id.includes("polygon") || layer.id.includes("roof"))
        ) {
          insertBefore = layer.id;
          break;
        }
      }

      // Professional solar panel styling - realistic dark blue/black panels with premium look
      const panelBaseColor = isDragging
        ? "#10b981" // Vibrant green when dragging
        : isSelected
        ? "#fbbf24" // Premium gold when selected
        : "#0f172a"; // Professional dark slate (like real solar panels)

      const panelAccentColor = isDragging
        ? "#34d399" // Light green accent
        : isSelected
        ? "#fcd34d" // Gold accent
        : "#1e40af"; // Deep blue accent

      // Add fill layer with professional styling
      // CRITICAL: Make layer queryable by adding it to the map's interactive layers
      const fillLayer: any = {
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": panelBaseColor,
          "fill-opacity": isDragging ? 0.9 : isSelected ? 0.85 : 0.75, // Higher opacity for premium look
          "fill-outline-color": panelAccentColor,
        },
        // Ensure layer is queryable
        metadata: { interactive: true },
      };

      // Add the layer
      try {
        if (insertBefore) {
          map.addLayer(fillLayer, insertBefore);
        } else {
          map.addLayer(fillLayer);
        }
      } catch (error) {
        console.error(`❌ Failed to add panel layer ${layerId}:`, error);
        return; // Skip this panel if layer addition fails
      }

      // Make layer interactive and ensure it's visible
      // Don't verify immediately - Mapbox needs time to process
      // Verification and handler attachment will happen in setTimeout below

      // Premium outline with professional styling
      const outlineColor = isDragging
        ? "#059669" // Rich green outline
        : isSelected
        ? "#f59e0b" // Premium gold outline
        : "#3b82f6"; // Professional blue outline

      const outlineWidth = isDragging ? 4.5 : isSelected ? 4 : 3;

      // Add premium outline layer with enhanced visibility
      const outlineLayer: any = {
        id: outlineId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": outlineColor,
          "line-width": outlineWidth,
          "line-opacity": 1.0, // Full opacity for crisp lines
          "line-blur": isSelected ? 0.5 : 0, // Subtle blur for selected
        },
      };

      // Add premium glow/shadow effect for selected and dragging panels
      if (isSelected || isDragging) {
        const glowLayerId = `${outlineId}-glow`;
        const glowColor = isDragging ? "#10b981" : "#fbbf24";
        const glowLayer: any = {
          id: glowLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": glowColor,
            "line-width": outlineWidth + 4,
            "line-opacity": 0.4, // More visible glow
            "line-blur": 5, // Softer glow effect
          },
        };

        if (insertBefore) {
          map.addLayer(glowLayer, insertBefore);
        } else {
          map.addLayer(glowLayer);
        }
      }

      // Add inner highlight for premium 3D effect (simulated with a thinner inner line)
      if (!isDragging && !isSelected) {
        const highlightLayerId = `${layerId}-highlight`;
        const highlightLayer: any = {
          id: highlightLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#60a5fa", // Light blue highlight
            "line-width": 1,
            "line-opacity": 0.3,
            "line-offset": -1, // Inside the panel
          },
        };

        if (insertBefore) {
          map.addLayer(highlightLayer, insertBefore);
        } else {
          map.addLayer(highlightLayer);
        }
      }

      if (insertBefore) {
        map.addLayer(outlineLayer, insertBefore);
      } else {
        map.addLayer(outlineLayer);
      }

      // Make panel interactive - use mousedown for drag, click for selection
      const handlePanelMouseDown = (e: MapMouseEvent) => {
        if (map) {
          // CRITICAL: Prevent ALL map interactions immediately
          e.preventDefault();
          if (e.originalEvent) {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            e.originalEvent.stopImmediatePropagation();
          }
          // Start drag immediately - this sets up all drag handlers
          handlePanelDragStart(panel.id, e);
        }
      };

      const handlePanelClick = (e: MapMouseEvent) => {
        // CRITICAL: Prevent click if we just dragged
        const timeSinceDragStart = Date.now() - dragStartTime.current;
        const wasDrag =
          hasDragged.current ||
          (draggingPanel !== null && timeSinceDragStart > 200);

        if (wasDrag || draggingPanel) {
          // This was a drag, not a click - prevent click handler
          e.preventDefault();
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            e.originalEvent.stopImmediatePropagation();
          }
          return;
        }

        // Only select if not dragging and this wasn't part of a drag operation
        handleSelectPanel(panel.id);
      };

      const handlePanelEnter = () => {
        if (!draggingPanel) {
          // Always show grab cursor when hovering over panels (both modes)
          map.getCanvas().style.cursor = "grab";
          // Premium hover effect - brighten and enhance
          const isSelected = selectedPanel === panel.id;
          map.setPaintProperty(
            layerId,
            "fill-opacity",
            isSelected ? 0.9 : 0.85
          );
          map.setPaintProperty(outlineId, "line-width", isSelected ? 4.5 : 3.5);
          map.setPaintProperty(outlineId, "line-opacity", 1.0);
        }
      };

      const handlePanelLeave = () => {
        if (!draggingPanel) {
          map.getCanvas().style.cursor = "";
          // Reset to premium default state
          const isSelected = selectedPanel === panel.id;
          const isDragging = draggingPanel === panel.id;
          map.setPaintProperty(
            layerId,
            "fill-opacity",
            isDragging ? 0.9 : isSelected ? 0.85 : 0.75
          );
          map.setPaintProperty(
            outlineId,
            "line-width",
            isDragging ? 4.5 : isSelected ? 4 : 3
          );
          map.setPaintProperty(outlineId, "line-opacity", 1.0);
        }
      };

      // Store handlers for cleanup
      panelHandlers.current.set(panel.id, {
        click: handlePanelClick,
        enter: handlePanelEnter,
        leave: handlePanelLeave,
        mousedown: handlePanelMouseDown,
      });

      // Use mousedown for drag, click for selection
      // CRITICAL: Attach handlers to panel layer - these fire when panel is clicked
      // Mapbox may transform layer IDs (capital 'L' in "Layer"), so we need to find the ACTUAL layer ID
      // Wait a moment for Mapbox to process the layer addition, then query the map's style
      // Use setTimeout to ensure Mapbox has finished processing
      setTimeout(() => {
        const mapStyle = map.getStyle();
        const allMapLayers = mapStyle?.layers || [];

        // Find the actual layer ID that matches our panel (case-insensitive search)
        // Look for a layer that contains the panel ID and "layer" but not "outline", "glow", or "highlight"
        const foundLayer = allMapLayers.find((l) => {
          if (!l.id || typeof l.id !== "string") return false;
          const layerIdLower = l.id.toLowerCase();
          const panelIdLower = panel.id.toLowerCase();
          // Match: contains panel ID, contains "layer", but not outline/glow/highlight
          return (
            layerIdLower.includes(panelIdLower) &&
            layerIdLower.includes("layer") &&
            !layerIdLower.includes("outline") &&
            !layerIdLower.includes("glow") &&
            !layerIdLower.includes("highlight")
          );
        });

        if (!foundLayer || !foundLayer.id) {
          console.error(
            `❌ Could not find actual layer for panel ${panel.id} (searched for layer containing "${panel.id}")`
          );
          return; // Skip this panel
        }

        // CRITICAL: Use the EXACT layer ID from the map (may be "panel-Layer-" with capital L)
        // Mapbox transforms IDs after adding, so we must use what's actually in the style
        const handlerLayerIdActual = foundLayer.id as string;

        // CRITICAL: Mapbox transforms "panel-layer-" to "panel-Layer-" (capital L)
        // The foundLayer.id should already be the correct case from the map's style
        // But if it's lowercase, we need to convert it to match what Mapbox actually uses
        let finalLayerId = handlerLayerIdActual;
        if (handlerLayerIdActual.includes("panel-layer-")) {
          // Mapbox uses capital L, so convert it
          finalLayerId = handlerLayerIdActual.replace(
            "panel-layer-",
            "panel-Layer-"
          );
        }

        // Verify the layer exists - but map.getLayer() might be case-insensitive
        // So we'll try attaching handlers anyway if the ID looks correct
        const layerExists = map.getLayer(finalLayerId);
        if (!layerExists) {
          // Try the original found ID in case map.getLayer is case-sensitive
          const originalExists = map.getLayer(handlerLayerIdActual);
          if (originalExists) {
            finalLayerId = handlerLayerIdActual;
          } else {
            console.warn(
              `⚠️ Layer ${finalLayerId} not found via getLayer(), but will try attaching handlers anyway (ID from map style: ${handlerLayerIdActual})`
            );
            // Use the ID from the map style - it should be correct
            finalLayerId = handlerLayerIdActual.includes("panel-Layer-")
              ? handlerLayerIdActual
              : handlerLayerIdActual.replace("panel-layer-", "panel-Layer-");
          }
        }

        // Attach handlers using the EXACT layer ID from the map

        // Verify layer exists one more time before attaching
        if (!map.getLayer(finalLayerId)) {
          console.error(
            `❌ Cannot attach handlers - layer ${finalLayerId} does not exist!`
          );
          return;
        }

        try {
          map.on("mousedown", finalLayerId, handlePanelMouseDown);
          map.on("click", finalLayerId, handlePanelClick);
          map.on("mouseenter", finalLayerId, handlePanelEnter);
          map.on("mouseleave", finalLayerId, handlePanelLeave);
        } catch (error) {
          console.error(
            `❌ Error attaching handlers to layer ${finalLayerId}:`,
            error
          );
        }
      }, 100); // Wait 100ms for Mapbox to process the layer
    });

    // Debug: Verify layers were added

    // Setup global map mousedown handler to detect panel drag start (more reliable)
    // CRITICAL: This handler must always use the latest panels - use ref which is updated by useEffect
    // NOTE: This is a fallback - layer-specific handlers should fire first
    const handleGlobalMapMouseDown = (e: MapMouseEvent) => {
      if (!map || draggingPanel) {
        return;
      }

      // If a layer-specific handler already handled this, don't process it again
      // Check if the event target is a panel layer
      const targetLayer = (e as any).targetLayer;
      if (
        targetLayer &&
        typeof targetLayer === "string" &&
        targetLayer.toLowerCase().includes("panel")
      ) {
        return;
      }

      // CRITICAL FIX: Use panels prop directly (always current) instead of ref
      // The ref is updated asynchronously via useEffect, causing race conditions
      // Props are always current in React, so use them directly

      // Use panels prop directly - it's always current
      const currentPanels = panels;

      // Query ALL features at the click point, then filter for panel layers
      // This is more reliable than specifying exact layer IDs
      // CRITICAL: Check if map is fully loaded and layers exist
      if (!map.loaded()) {
        return;
      }

      const allFeatures = map.queryRenderedFeatures(e.point);
      const allRenderedFeatures = map.queryRenderedFeatures();
      const allPanelFeatures = allRenderedFeatures.filter((f) => {
        const layerId = f.layer?.id?.toLowerCase() || "";
        return (
          layerId.startsWith("panel-layer-") ||
          (layerId.includes("panel") && layerId.includes("layer"))
        );
      });

      // Filter for panel layers - check if layer ID contains panel ID (case-insensitive)
      // Mapbox may transform layer IDs (e.g., "panel-Layer-" with capital L), so we check both
      // CRITICAL: Also check all rendered features if point query returns nothing
      let panelFeatures = allFeatures.filter((f) => {
        const layerId = f.layer?.id || "";
        if (!layerId) return false;
        const layerIdLower = layerId.toLowerCase();

        // Check if this feature belongs to any of our panels
        // by checking if the layer ID contains any panel ID
        return currentPanels.some((panel) => {
          const panelIdLower = panel.id.toLowerCase();
          // Layer ID should contain the panel ID (e.g., "panel-layer-panel-123" or "panel-Layer-panel-123")
          // Check both lowercase and original case
          return (
            (layerIdLower.includes(panelIdLower) &&
              layerIdLower.includes("layer")) ||
            (layerId.includes(panel.id) &&
              (layerId.includes("Layer") || layerId.includes("layer")))
          );
        });
      });

      // If no features found at point, try querying a larger area
      if (panelFeatures.length === 0 && currentPanels.length > 0) {
        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - 10, e.point.y - 10],
          [e.point.x + 10, e.point.y + 10],
        ];
        const featuresInBox = map.queryRenderedFeatures(bbox);
        panelFeatures = featuresInBox.filter((f) => {
          const layerId = f.layer?.id || "";
          if (!layerId) return false;
          const layerIdLower = layerId.toLowerCase();
          return currentPanels.some((panel) => {
            const panelIdLower = panel.id.toLowerCase();
            return (
              (layerIdLower.includes(panelIdLower) &&
                layerIdLower.includes("layer")) ||
              (layerId.includes(panel.id) &&
                (layerId.includes("Layer") || layerId.includes("layer")))
            );
          });
        });
        if (panelFeatures.length > 0) {
        }
      }

      // If no panels found but we have panels, try querying a larger area
      if (panelFeatures.length === 0 && currentPanels.length > 0) {
        // Try querying a larger box around the click point
        const largerBbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - 20, e.point.y - 20],
          [e.point.x + 20, e.point.y + 20],
        ];
        const featuresInLargerBox = map.queryRenderedFeatures(largerBbox);
        const panelFeaturesInBox = featuresInLargerBox.filter((f) => {
          const layerId = (f.layer?.id || "").toLowerCase();
          if (!layerId) return false;
          return currentPanels.some((panel) => {
            const panelIdLower = panel.id.toLowerCase();
            return layerId.includes(panelIdLower) && layerId.includes("layer");
          });
        });
        if (panelFeaturesInBox.length > 0) {
          // Use the first panel found in the larger box
          const foundFeature = panelFeaturesInBox[0];
          const foundLayerId = foundFeature.layer?.id || "";
          // Extract panel ID from layer ID
          const panelIdMatch = foundLayerId.match(/panel-[\w-]+/i);
          if (panelIdMatch) {
            const potentialPanelId = panelIdMatch[0]
              .replace(/^panel-layer-?/i, "")
              .replace(/^panel-/i, "");
            const foundPanel = currentPanels.find(
              (p) =>
                p.id === potentialPanelId ||
                foundLayerId.toLowerCase().includes(p.id.toLowerCase())
            );
            if (foundPanel) {
              // Start dragging this panel
              handlePanelDragStart(foundPanel.id, e);
              return;
            }
          }
        }
      }

      // If we found panel features elsewhere but not at click point, log their positions
      if (allPanelFeatures.length > 0 && panelFeatures.length === 0) {
        // Try to get bounding boxes of panel features
        // Panel features exist but not at click point - skip processing
      }

      // Log all layer IDs for debugging
      if (allFeatures.length > 0) {
      }

      // If queryRenderedFeatures didn't find panels, try geometric detection
      // Check if click point is within any panel's bounds
      if (panelFeatures.length === 0 && currentPanels.length > 0) {
        const clickLng = e.lngLat.lng;
        const clickLat = e.lngLat.lat;

        // Check each panel to see if click is inside its bounds
        for (let i = 0; i < currentPanels.length; i++) {
          const panel = currentPanels[i];
          if (!panel.corners || panel.corners.length < 3) {
            console.warn(
              `⚠️ Panel ${panel.id} has invalid corners:`,
              panel.corners
            );
            continue;
          }

          const isInside = isPointInPolygon(
            [clickLng, clickLat],
            panel.corners
          );
          if (isInside) {
            // Start dragging immediately
            e.preventDefault();
            if (e.originalEvent) {
              e.originalEvent.preventDefault();
              e.originalEvent.stopPropagation();
              e.originalEvent.stopImmediatePropagation();
            }
            handlePanelDragStart(panel.id, e);
            return; // Exit early - panel found and drag started
          }
        }
      }

      if (panelFeatures.length > 0) {
        // A panel was clicked - start dragging immediately
        const feature = panelFeatures[0];
        const layerId = feature.layer?.id || "";
        // Extract panel ID - handle both "panel-layer-" and "panel-Layer-" (case-insensitive)
        const panelId = layerId
          .replace(/^panel-Layer?-/i, "")
          .replace(/^panel-/i, "");

        const panel = currentPanels.find((p) => p.id === panelId);
        if (panel) {
          // CRITICAL: Prevent all default behaviors and stop propagation
          e.preventDefault();
          if (e.originalEvent) {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            e.originalEvent.stopImmediatePropagation();
          }
          // Start dragging immediately
          handlePanelDragStart(panelId, e);
          return false; // Prevent further event handling
        } else {
        }
      } else {
      }
    };

    // Setup global map click handler for panel selection and placement
    const handleGlobalMapClick = (e: MapMouseEvent) => {
      if (!map) return;

      // CRITICAL: If we just finished dragging, don't handle click
      // Check if this was a drag (mouse moved) or just a click
      const timeSinceDragStart = Date.now() - dragStartTime.current;
      const wasDrag =
        hasDragged.current ||
        (draggingPanel !== null && timeSinceDragStart > 200);

      if (wasDrag || draggingPanel) {
        // This was a drag, not a click - ignore
        return;
      }

      // Check if a panel was clicked for selection
      const panelLayerIds = panels.map((p) => `panel-layer-${p.id}`);
      const features = map.queryRenderedFeatures(e.point, {
        layers: panelLayerIds,
      });

      if (features.length > 0) {
        // A panel was clicked - select it (don't place new panel)
        const feature = features[0];
        const layerId = feature.layer?.id || "";
        const panelId = layerId.replace("panel-layer-", "");

        if (panelId) {
          handleSelectPanel(panelId);
          return;
        }
      }

      // If no panel clicked and in manual mode, place new panel
      if (isManualMode) {
        handleMapClickForPlacement(e);
      }
    };

    // Listen for mousedown to start dragging, click for selection/placement
    // Use capture phase to ensure we catch events before map handlers
    map.on("mousedown", handleGlobalMapMouseDown);
    map.on("click", handleGlobalMapClick);

    // Also attach directly to canvas for more reliable capture
    // CRITICAL: Use capture phase with HIGHEST priority to catch panel clicks BEFORE MapView
    const canvas = map.getCanvas();
    if (!canvas) {
      console.error("❌ Cannot get canvas element from map!");
      return;
    }

    const canvasMouseDownHandler = (e: MouseEvent) => {
      if (draggingPanel) {
        // Already dragging - prevent all other handlers
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Check if clicking on a panel - use geometric detection since queryRenderedFeatures isn't working
      const rect = canvas.getBoundingClientRect();
      const point: [number, number] = [
        e.clientX - rect.left,
        e.clientY - rect.top,
      ];

      // Convert screen point to lat/lng for geometric detection
      const lngLat = map.unproject(point);

      // Try queryRenderedFeatures first
      const panelLayerIds = panels.map((p) => `panel-layer-${p.id}`);
      const features = map.queryRenderedFeatures(point, {
        layers: panelLayerIds,
      });

      // If queryRenderedFeatures didn't find anything, try geometric detection
      let panelFound = false;
      let foundPanel: SolarPanel | null = null;

      if (features.length > 0) {
        // Extract panel ID from the feature
        const feature = features[0];
        const layerId = feature.layer?.id || "";
        // Extract panel ID - handle both "panel-layer-" and "panel-Layer-" (case-insensitive)
        // Layer IDs are like "panel-Layer-panel-1764910783722-0-0-426kr7p6r"
        // We need to extract "panel-1764910783722-0-0-426kr7p6r"
        let panelId = layerId.replace(/^panel-Layer?-/i, "");
        // If it still starts with "panel-", that's the actual panel ID
        // Otherwise, the layer ID might be different
        if (!panelId.startsWith("panel-")) {
          // Try to find the panel ID within the layer ID
          const match = layerId.match(/panel-[\w-]+/i);
          if (match) {
            panelId = match[0].replace(/^panel-Layer?-/i, "");
          }
        }

        // Find the panel in our panels array - try exact match first
        foundPanel = panels.find((p) => p.id === panelId) || null;

        // If not found, try case-insensitive or partial match
        if (!foundPanel) {
          foundPanel =
            panels.find(
              (p) =>
                p.id.toLowerCase() === panelId.toLowerCase() ||
                layerId.toLowerCase().includes(p.id.toLowerCase())
            ) || null;
        }

        if (foundPanel) {
          panelFound = true;
        } else {
          console.warn(
            "⚠️ Canvas handler: Panel ID",
            panelId,
            "not found in panels array"
          );
          console.warn(
            "  Tried to match against:",
            panels.map((p) => p.id)
          );
        }
      } else {
        // Try geometric detection
        for (let i = 0; i < panels.length; i++) {
          const panel = panels[i];
          if (panel.corners && panel.corners.length >= 3) {
            const isInside = isPointInPolygon(
              [lngLat.lng, lngLat.lat],
              panel.corners
            );
            if (isInside) {
              panelFound = true;
              foundPanel = panel;
              break;
            }
          }
        }
      }

      if (panelFound && foundPanel) {
        // CRITICAL: Panel was clicked - prevent MapView's drawing handler from firing
        // Stop ALL propagation to prevent MapView from handling this
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Convert to MapMouseEvent-like object for handlePanelDragStart
        // handlePanelDragStart expects a MapMouseEvent with lngLat, point, preventDefault, etc.
        const mapEvent = {
          lngLat: lngLat,
          point: point,
          originalEvent: e,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
          stopImmediatePropagation: () => e.stopImmediatePropagation(),
        } as any as MapMouseEvent;

        handlePanelDragStart(foundPanel.id, mapEvent);
        return false;
      } else if (panelFound) {
        // Found via queryRenderedFeatures but need to extract panel ID
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      } else {
      }
    };
    // Also prevent click events from reaching MapView when dragging
    const canvasClickHandler = (e: MouseEvent) => {
      // If we just finished dragging or are currently dragging, prevent MapView from handling click
      const timeSinceDragStart = Date.now() - dragStartTime.current;
      const wasDrag =
        hasDragged.current ||
        (draggingPanel !== null && timeSinceDragStart > 100);

      if (wasDrag || draggingPanel) {
        // This was a drag operation - prevent MapView's drawing handler
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Check if clicking on a panel - query all features then filter
      const rect = canvas.getBoundingClientRect();
      const point: [number, number] = [
        e.clientX - rect.left,
        e.clientY - rect.top,
      ];
      const allFeatures = map.queryRenderedFeatures(point);
      const panelFeatures = allFeatures.filter((f) => {
        const layerId = f.layer?.id?.toLowerCase() || "";
        return (
          layerId.startsWith("panel-layer-") ||
          (layerId.includes("panel") && layerId.includes("layer"))
        );
      });

      if (panelFeatures.length > 0) {
        // Panel was clicked - prevent MapView from handling this
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Use capture phase with highest priority to catch events FIRST
    canvas.addEventListener("mousedown", canvasMouseDownHandler, {
      capture: true, // Capture phase - fires BEFORE target phase
      passive: false, // Allow preventDefault
    });
    canvas.addEventListener("click", canvasClickHandler, {
      capture: true, // Capture phase - fires BEFORE MapView's click handler
      passive: false, // Allow preventDefault
    });

    // Keyboard shortcuts for selected panel
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedPanel) {
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          handleRotatePanel(selectedPanel, 15); // Rotate +15°
        } else if (e.key === "q" || e.key === "Q") {
          e.preventDefault();
          handleRotatePanel(selectedPanel, -15); // Rotate -15°
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          handleDeleteClick(selectedPanel);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);

      if (map) {
        // Remove the global handlers
        map.off("mousedown", handleGlobalMapMouseDown);
        map.off("click", handleGlobalMapClick);

        // Remove canvas event listeners - with safety checks
        try {
          const canvas = map.getCanvas();
          if (canvas && canvasMouseDownHandler) {
            canvas.removeEventListener(
              "mousedown",
              canvasMouseDownHandler,
              true
            );
          }
          if (canvas && canvasClickHandler) {
            canvas.removeEventListener("click", canvasClickHandler, true);
          }
        } catch (error) {
          console.warn("Error removing canvas event listeners:", error);
        }

        // Clean up global drag handlers if they exist
        if (dragHandlers.current.move) {
          map.off("mousemove", dragHandlers.current.move);
        }
        if (dragHandlers.current.up) {
          map.off("mouseup", dragHandlers.current.up as any);
          map
            .getCanvas()
            .removeEventListener("mouseleave", dragHandlers.current.up as any);
          map
            .getCanvas()
            .removeEventListener("mouseup", dragHandlers.current.up as any);
        }
        dragHandlers.current = {};

        // Remove all panel event handlers
        panels.forEach((panel) => {
          const layerId = `panel-layer-${panel.id}`;
          const handlers = panelHandlers.current.get(panel.id);
          if (map.getLayer(layerId) && handlers) {
            try {
              if (handlers.mousedown) {
                map.off("mousedown", layerId, handlers.mousedown);
              }
              map.off("click", layerId, handlers.click);
              map.off("mouseenter", layerId, handlers.enter);
              map.off("mouseleave", layerId, handlers.leave);
            } catch (e) {
              // Ignore errors if handlers don't exist
            }
          }
        });
        panelHandlers.current.clear();
      }
    };
  }, [
    map,
    panels,
    selectedPanel,
    isManualMode,
    roofPolygons,
    settings,
    draggingPanel,
  ]);

  const totalCapacity = panels.reduce((sum, panel) => sum + panel.power, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Panel Placement
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onManualModeChange(!isManualMode)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              isManualMode
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            title={
              isManualMode ? "Switch to Auto Mode" : "Switch to Manual Mode"
            }
          >
            <Hand className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Mode selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onManualModeChange(false)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isManualMode
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-1" />
            Auto
          </button>
          <button
            onClick={() => onManualModeChange(true)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isManualMode
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Hand className="w-4 h-4 inline mr-1" />
            Manual
          </button>
        </div>

        {/* String configuration */}
        {!isManualMode && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Strings (Rows)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.numberOfStrings || 2}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  numberOfStrings: Math.max(
                    1,
                    Math.min(10, parseInt(e.target.value) || 2)
                  ),
                })
              }
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Panels will be organized into {settings.numberOfStrings || 2}{" "}
              string{settings.numberOfStrings !== 1 ? "s" : ""} (rows)
            </p>
          </div>
        )}

        {/* Auto placement button */}
        {!isManualMode && (
          <div className="space-y-2">
            <button
              onClick={handleAutoPlace}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Grid3x3 className="w-5 h-5" />
              Auto-Place Panels
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Automatically place panels in a clean grid with 0m (zero) spacing
              - panels can touch
            </p>
          </div>
        )}

        {/* Manual placement - Active Mode */}
        {isManualMode && (
          <div className="space-y-3">
            {/* Add Panel Button */}
            <button
              onClick={handleAddPanelButton}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Panel (Center of Roof)
            </button>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-600 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <Hand className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-blue-900 dark:text-blue-100">
                    Manual Placement Mode
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Click on roof to add panels one by one
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 p-3 rounded-lg mb-3 border-2 border-green-400 dark:border-green-600 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="font-bold text-green-900 dark:text-green-100 text-sm">
                      How to Add Panels:
                    </p>
                  </div>
                  <div className="space-y-1 text-green-800 dark:text-green-200">
                    <p className="font-semibold">
                      ✨ No dragging needed! Just click on the map:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>
                        Click anywhere on the <strong>roof area</strong> (the
                        purple highlighted section)
                      </li>
                      <li>
                        A panel will <strong>instantly appear</strong> at that
                        location
                      </li>
                      <li>Keep clicking to add more panels</li>
                    </ol>
                    <p className="text-xs mt-2 opacity-75">
                      💡 Tip: The panel appears as a dark blue rectangle on the
                      map
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold text-base">
                    ✓
                  </span>
                  <span className="flex-1">
                    <strong>Click on the map</strong> to place a new panel
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold text-base">
                    ✓
                  </span>
                  <span className="flex-1">
                    <strong>Drag existing panels</strong> to move them anywhere
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold text-base">
                    ✓
                  </span>
                  <span className="flex-1">
                    <strong>Click a panel</strong> to select, then use{" "}
                    <strong>+/-</strong> buttons or press <strong>R</strong>{" "}
                    (rotate +15°) / <strong>Q</strong> (rotate -15°) to rotate
                    freely
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold text-base">
                    ✓
                  </span>
                  <span className="flex-1">
                    Click <strong>🗑️</strong> to delete panels
                  </span>
                </div>
              </div>

              {/* Editing Controls */}
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>Snap to Grid (0m / zero spacing)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freePlacement}
                    onChange={(e) => setFreePlacement(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>
                    Free Placement (place anywhere, even outside roof)
                  </span>
                </label>
              </div>

              {panels.length > 0 && (
                <div className="mt-3 pt-3 border-t-2 border-blue-300 dark:border-blue-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Panels
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {panels.length}
                      </p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Capacity
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalCapacity.toFixed(1)} kW
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={handleAutoPlace}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <Grid3x3 className="w-4 h-4" />
                Auto-Fill All Panels
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Or click on the map to add panels manually
              </p>
            </div>
          </div>
        )}

        {/* Editing instructions for auto mode */}
        {!isManualMode && panels.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-xs text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">💡 Full Editing Freedom</p>
            <p className="mb-1">You can edit panels in Auto Mode too:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Drag</strong> any panel to move it
              </li>
              <li>
                <strong>Click</strong> to select, then use <strong>+/-</strong>{" "}
                buttons or press <strong>R</strong> (+15°) / <strong>Q</strong>{" "}
                (-15°) to rotate freely
              </li>
              <li>
                <strong>Delete</strong> button to remove panels
              </li>
            </ul>
            <p className="mt-2 text-xs opacity-75">
              Switch to Manual Mode for more controls (grid snap, free
              placement)
            </p>
          </div>
        )}

        {/* Panel stats */}
        {panels.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Panels
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {panels.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Capacity
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {totalCapacity.toFixed(1)} kW
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Panel list */}
        {panels.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1">
            {panels.map((panel) => (
              <div
                key={panel.id}
                className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                  selectedPanel === panel.id
                    ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                    : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleSelectPanel(panel.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    Panel {panels.indexOf(panel) + 1}
                  </span>
                  <span className="text-gray-500">{panel.rotation}°</span>
                  {draggingPanel === panel.id && (
                    <span className="text-green-600 dark:text-green-400 text-xs">
                      (Dragging...)
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Rotation Controls */}
                  <div className="flex items-center gap-0.5 border border-blue-300 dark:border-blue-700 rounded">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotatePanel(panel.id, -15);
                      }}
                      className="px-1.5 py-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Rotate -15°"
                    >
                      <span className="text-xs font-bold">-</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotatePanel(panel.id, 15);
                      }}
                      className="px-1.5 py-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-l border-r border-blue-300 dark:border-blue-700"
                      title="Rotate +15° (R key)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotatePanel(panel.id, 15);
                      }}
                      className="px-1.5 py-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Rotate +15°"
                    >
                      <span className="text-xs font-bold">+</span>
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(panel.id);
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete panel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear all button */}
        {panels.length > 0 && (
          <button
            onClick={() => onPanelsChange([])}
            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Clear All Panels
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {panelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Panel?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Are you sure you want to delete this panel? This action
                    cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleCancelDelete}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePanel(panelToDelete)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
