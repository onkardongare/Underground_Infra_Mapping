// store/slices/mapSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewState = {
  lng: number;
  lat: number;
  zoom: number;
};

export type MapLayer =
  | "Sewage"
  | "Fiber Optic"
  | "LPG Line"
  | "Water Pipeline"
  | "Electric Line";

interface MapState {
  viewState: ViewState;
  selectedLayers: MapLayer[];
}

const initialState: MapState = {
  viewState: {
    lng: 78.9629, // Center of India
    lat: 20.5937,
    zoom: 4,
  },
  selectedLayers: [],
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setViewState(state, action: PayloadAction<ViewState>) {
      state.viewState = action.payload;
    },
    setSelectedLayers(state, action: PayloadAction<MapLayer[]>) {
      state.selectedLayers = action.payload;
    },
    toggleLayer(state, action: PayloadAction<MapLayer>) {
      const layer = action.payload;
      const exists = state.selectedLayers.includes(layer);
      state.selectedLayers = exists
        ? state.selectedLayers.filter((l) => l !== layer)
        : [...state.selectedLayers, layer];
    },
    resetLayers(state) {
      state.selectedLayers = [];
    },
  },
});

export const {
  setViewState,
  setSelectedLayers,
  toggleLayer,
  resetLayers,
} = mapSlice.actions;

export default mapSlice.reducer;
