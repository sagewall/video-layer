import Color from "@arcgis/core/Color.js";
import config from "@arcgis/core/config.js";
import { watch } from "@arcgis/core/core/reactiveUtils";
import type GroupLayer from "@arcgis/core/layers/GroupLayer";
import Layer from "@arcgis/core/layers/Layer.js";
import VideoLayer from "@arcgis/core/layers/VideoLayer.js";
import PortalItem from "@arcgis/core/portal/PortalItem.js";
import request from "@arcgis/core/request.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import WebMap from "@arcgis/core/WebMap.js";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-video-player";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-slider";
import "@esri/calcite-components/components/calcite-switch";
import { airplanePath } from "./airplane-path";
import "./style.css";

const state: {
  videoLayer: VideoLayer | null;
  webMap: WebMap;
} = {
  videoLayer: null,
  webMap: new WebMap({
    basemap: "topo-vector",
  }),
};

config.portalUrl = "https://dev0019062.esri.com/portal";

const frameEffectBrightnessSlider = document.querySelector(
  "#frame-effect-brightness-slider",
)! as HTMLCalciteSliderElement;
const frameEffectContrastSlider = document.querySelector(
  "#frame-effect-contrast-slider",
)! as HTMLCalciteSliderElement;
const frameEffectInvertSwitch = document.querySelector(
  "#frame-effect-invert-switch",
)! as HTMLCalciteSwitchElement;
const frameEffectSaturateSlider = document.querySelector(
  "#frame-effect-saturate-slider",
)! as HTMLCalciteSliderElement;
const frameOpacitySlider = document.querySelector(
  "#frame-opacity-slider",
)! as HTMLCalciteSliderElement;
const layerListElement = document.querySelector(
  "arcgis-layer-list",
)! as HTMLArcgisLayerListElement;
const opacitySlider = document.querySelector(
  "#opacity-slider",
)! as HTMLCalciteSliderElement;
const saveAsButton = document.querySelector(
  "#save-as-button",
)! as HTMLCalciteButtonElement;
const saveButton = document.querySelector(
  "#save-button",
)! as HTMLCalciteButtonElement;
const testingPropertiesSwitch = document.querySelector(
  "#testing-properties-switch",
)! as HTMLCalciteSwitchElement;
const viewElement = document.querySelector(
  "arcgis-map",
)! as HTMLArcgisMapElement;
const videoPlayerElement = document.querySelector("arcgis-video-player")!;

init();

frameEffectBrightnessSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

frameEffectContrastSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

frameEffectInvertSwitch.addEventListener("calciteSwitchChange", () => {
  updateFrameEffect();
});

frameOpacitySlider.addEventListener("calciteSliderInput", () => {
  updateFrameOpacity(frameOpacitySlider.value);
});

frameEffectSaturateSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

opacitySlider.addEventListener("calciteSliderInput", () => {
  updateOpacity(opacitySlider.value);
});

saveButton.addEventListener("click", async () => {
  console.log("save button clicked");
  state.webMap.updateFrom(viewElement.view);
  const result = await state.webMap.save();
  console.log("Save result:", result.id, result);
});

saveAsButton.addEventListener("click", async () => {
  console.log("save as button clicked");
  await state.webMap.loadAll();
  state.webMap.updateFrom(viewElement.view);
  const result = await state.webMap.saveAs(
    new PortalItem({
      title: "My Video Layer Web Map",
    }),
  );
  state.webMap.portalItem = result;
  saveButton.disabled = false;
  console.log("Save As result:", result.id, result);
});

testingPropertiesSwitch.addEventListener("calciteSwitchChange", async () => {
  if (testingPropertiesSwitch.checked) {
    await addTestingProperties();
  } else {
    await removeTestingProperties();
  }
});

async function addTestingProperties() {
  if (!state.videoLayer) {
    return;
  }
  if (!state.videoLayer) {
    return;
  }
  await state.videoLayer.load();
  state.videoLayer.autoplay = true;
  state.videoLayer.blendMode = "vivid-light";
  state.videoLayer.effect =
    "brightness(500%) hue-rotate(270deg) contrast(200%)";
  state.videoLayer.frameEffect = "invert()";
  frameEffectInvertSwitch.checked = true;
  state.videoLayer.frameOpacity = 0.1;
  state.videoLayer.frameCenterSymbol = new SimpleMarkerSymbol({
    angle: 0,
    color: new Color([0, 0, 255, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 1]),
      join: "round",
      miterLimit: 1,
      style: "short-dash-dot-dot",
      width: 2,
    }),
    size: 12,
    style: "triangle",
    xoffset: 0,
    yoffset: 0,
  });
  state.videoLayer.frameOutlineSymbol = new SimpleFillSymbol({
    color: new Color([255, 0, 0, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 1]),
      join: "round",
      miterLimit: 1,
      style: "dot",
      width: 12,
    }),
    style: "vertical",
  });
  state.videoLayer.muted = true;
  state.videoLayer.opacity = 0.5;
  state.videoLayer.sensorSightLineSymbol = new SimpleLineSymbol({
    cap: "round",
    color: new Color([255, 255, 0, 1]),
    join: "round",
    miterLimit: 1,
    style: "dash-dot",
    width: 3,
  });
  state.videoLayer.sensorSymbol = new SimpleMarkerSymbol({
    angle: 90,
    color: new Color([0, 0, 255, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 1]),
      join: "round",
      miterLimit: 1,
      style: "solid",
      width: 3,
    }),
    path: airplanePath,
    size: 24,
    xoffset: 0,
    yoffset: 0,
  });
  state.videoLayer.sensorSymbolOrientation = {
    source: "platformHeading", // "cameraAzimuth" or "platformHeading"
    symbolOffset: 0,
  };
  state.videoLayer.sensorTrailSymbol = new SimpleLineSymbol({
    cap: "round",
    color: new Color([255, 0, 0, 1]),
    join: "round",
    miterLimit: 1,
    style: "dash",
    width: 12,
  });
  state.videoLayer.start = 6;
  state.videoLayer.telemetryDisplay = {
    frame: true,
    frameCenter: true,
    frameOutline: true,
    lineOfSight: true,
    sensorLocation: true,
    sensorTrail: true,
  };
  state.videoLayer.visible = true;
}

async function getPortalItems(portalUrl: string) {
  const url = portalUrl + "/sharing/rest/search";

  const options = {
    query: {
      f: "json",
      q: 'type:"Video Service"',
      sortField: "title",
      sortOrder: "desc",
    },
  };

  const response = await request(url, options);
  const portalItems = response.data.results;

  return portalItems;
}

async function init() {
  const portalItems = await getPortalItems(config.portalUrl);
  portalItems.forEach(async (portalItem: PortalItem, index: number) => {
    console.log(portalItem.title);
    const layer = await Layer.fromPortalItem({ portalItem });
    await layer.load();
    console.log(layer.title);
    state.webMap.layers.add(layer);

    if (index === 0) {
      if (layer.type === "video") {
        state.videoLayer = layer as VideoLayer;
      } else if (layer.type === "group") {
        state.videoLayer = (layer as GroupLayer).layers.getItemAt(
          0,
        ) as VideoLayer;
      }
      videoPlayerElement.layer = state.videoLayer;
    }
  });

  viewElement.map = state.webMap;

  await viewElement.viewOnReady();
  console.log("the view is ready");

  if (state.videoLayer && state.videoLayer.loaded) {
    console.log("the layer is loaded");
    videoPlayerElement.layer = state.videoLayer;
  } else {
    await state.videoLayer?.load();
    videoPlayerElement.layer = state.videoLayer;
  }
  if (!state.videoLayer) {
    return;
  }
  await viewElement.whenLayerView(state.videoLayer);
  console.log("the layerview is created");
  if (state.videoLayer.fullExtent) {
    viewElement.goTo(state.videoLayer.fullExtent);
  }

  updateFrameEffect();
}

async function removeTestingProperties() {
  if (!state.videoLayer) {
    return;
  }
  await state.videoLayer.load();
  state.videoLayer.autoplay = false;
  state.videoLayer.blendMode = "normal";
  state.videoLayer.effect = null;
  state.videoLayer.frameEffect = null;
  frameEffectInvertSwitch.checked = false;
  state.videoLayer.frameOpacity = 1;
  state.videoLayer.frameCenterSymbol = new SimpleMarkerSymbol({
    angle: 0,
    color: new Color([255, 127, 0]),
    size: 10,
    style: "cross",
  });
  state.videoLayer.frameOutlineSymbol = new SimpleFillSymbol({
    color: new Color([0, 0, 0, 0.05]),
    outline: new SimpleLineSymbol({
      color: new Color([255, 127, 0]),
      width: 2,
    }),
  });
  state.videoLayer.muted = false;
  state.videoLayer.opacity = 1;
  state.videoLayer.sensorSightLineSymbol = new SimpleLineSymbol({
    color: new Color([255, 127, 0]),
    width: 1,
  });
  state.videoLayer.sensorSymbol = new SimpleMarkerSymbol({
    angle: 0,
    color: new Color([255, 127, 0]),
    outline: { color: [255, 255, 255], width: 1.33 },
    size: 10,
    style: "circle",
  });
  state.videoLayer.sensorSymbolOrientation = {
    source: "platformHeading",
    symbolOffset: 0,
  };
  state.videoLayer.sensorTrailSymbol = new SimpleLineSymbol({
    color: new Color([255, 127, 0]),
    width: 1,
  });
  state.videoLayer.start = 0;
  state.videoLayer.telemetryDisplay = {
    frame: false,
    frameCenter: false,
    frameOutline: true,
    lineOfSight: true,
    sensorLocation: true,
    sensorTrail: true,
  };
  state.videoLayer.visible = true;
}

function updateFrameEffect() {
  if (!state.videoLayer) {
    return;
  }
  state.videoLayer.frameEffect = `brightness(${frameEffectBrightnessSlider.value}%) contrast(${frameEffectContrastSlider.value}%) saturate(${frameEffectSaturateSlider.value}%)`;
  if (frameEffectInvertSwitch.checked) {
    state.videoLayer.frameEffect += " invert()";
  }
}

function updateFrameOpacity(value: number | number[] | null) {
  if (!state.videoLayer) {
    return;
  }
  if (typeof value === "number") {
    state.videoLayer.frameOpacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    state.videoLayer.frameOpacity = value[0] / 100;
  } else {
    state.videoLayer.frameOpacity = 1;
  }
}

function updateOpacity(value: number | number[] | null) {
  if (!state.videoLayer) {
    return;
  }
  if (typeof value === "number") {
    state.videoLayer.opacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    state.videoLayer.opacity = value[0] / 100;
  } else {
    state.videoLayer.opacity = 1;
  }
}

watch(
  () => layerListElement.selectedItems.getItemAt(0),
  async (selectedListItem) => {
    console.log("Selected List Item:", selectedListItem);
    if (!selectedListItem) {
      return;
    }
    const { layer } = selectedListItem;
    if (!layer) {
      return;
    }
    await layer.load();
    if (layer.type === "video") {
      videoPlayerElement.layer = layer as VideoLayer;
      (layer as VideoLayer).play();
      state.videoLayer = layer as VideoLayer;
    }
    updateFrameEffect();
    updateFrameOpacity(frameOpacitySlider.value);
    updateOpacity(opacitySlider.value);
  },
);
