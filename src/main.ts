import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/Symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/Symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/Symbols/SimpleMarkerSymbol";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import Layer from "@arcgis/core/layers/Layer";
import VideoLayer from "@arcgis/core/layers/VideoLayer";
import PortalItem from "@arcgis/core/portal/PortalItem";
import esriRequest from "@arcgis/core/request";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-placement";
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

const state = {
  videoLayer: new VideoLayer(),
  webMap: new WebMap(),
};

esriConfig.portalUrl = "https://devtesting.mapsdevext.arcgis.com/";

const frameEffectBrightnessSlider = document.querySelector(
  "#frame-effect-brightness-slider"
)! as HTMLCalciteSliderElement;
const frameEffectContrastSlider = document.querySelector(
  "#frame-effect-contrast-slider"
)! as HTMLCalciteSliderElement;
const frameEffectInvertSwitch = document.querySelector(
  "#frame-effect-invert-switch"
)! as HTMLCalciteSwitchElement;
const frameEffectSaturateSlider = document.querySelector(
  "#frame-effect-saturate-slider"
)! as HTMLCalciteSliderElement;
const frameOpacitySlider = document.querySelector(
  "#frame-opacity-slider"
)! as HTMLCalciteSliderElement;
const loadButton = document.querySelector(
  "#load-button"
)! as HTMLCalciteButtonElement;
const opacitySlider = document.querySelector(
  "#opacity-slider"
)! as HTMLCalciteSliderElement;
const saveButton = document.querySelector(
  "#save-button"
)! as HTMLCalciteButtonElement;
const saveAsButton = document.querySelector(
  "#save-as-button"
)! as HTMLCalciteButtonElement;
const testingPropertiesSwitch = document.querySelector(
  "#testing-properties-switch"
)! as HTMLCalciteSwitchElement;
const viewElement = document.querySelector("arcgis-map")!;
const videoLayerSelect = document.querySelector(
  "#video-layer-select"
)! as HTMLCalciteSelectElement;
const videoPlayerElement = document.querySelector("arcgis-video-player")!;

init();

opacitySlider.addEventListener("calciteSliderInput", () => {
  const value = opacitySlider.value;
  if (typeof value === "number") {
    state.videoLayer.opacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    state.videoLayer.opacity = value[0] / 100;
  } else {
    state.videoLayer.opacity = 1;
  }
});

frameOpacitySlider.addEventListener("calciteSliderInput", () => {
  const value = frameOpacitySlider.value;
  if (typeof value === "number") {
    state.videoLayer.frameOpacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    state.videoLayer.frameOpacity = value[0] / 100;
  } else {
    state.videoLayer.frameOpacity = 1;
  }
});

frameEffectBrightnessSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

frameEffectContrastSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

frameEffectInvertSwitch.addEventListener("calciteSwitchChange", () => {
  updateFrameEffect();
});

frameEffectSaturateSlider.addEventListener("calciteSliderInput", () => {
  updateFrameEffect();
});

loadButton.addEventListener("click", async () => {
  console.log("load button clicked");
  viewElement.itemId = state.webMap.portalItem?.id;
});

saveButton.addEventListener("click", async () => {
  console.log("save button clicked");
  const result = await state.webMap.save();
  console.log("Save result:", result.id, result);
});

saveAsButton.addEventListener("click", async () => {
  await state.webMap.loadAll();
  // @ts-expect-error
  state.videoLayer.portalItem = null;
  state.webMap.updateFrom(viewElement.view);
  console.log("save as button clicked");
  const result = await state.webMap.saveAs(
    new PortalItem({ title: "My Video Layer Web Map" })
  );
  console.log("Save As result:", result.id, result);
  state.webMap.portalItem = result;
  saveButton.disabled = false;
  loadButton.disabled = false;
});

testingPropertiesSwitch.addEventListener("calciteSwitchChange", async () => {
  if (testingPropertiesSwitch.checked) {
    await addTestingProperties();
  } else {
    await removeTestingProperties();
  }
});

videoLayerSelect.addEventListener("calciteSelectChange", async (event) => {
  const selectedOption = event.target as HTMLCalciteSelectElement;
  updateVideoLayer(selectedOption.value);
});

async function getPortalItems(portalUrl: string) {
  const url = portalUrl + "/sharing/rest/search";

  const options = {
    query: {
      q: 'type:"Video Service"',
      f: "json",
    },
  };

  const response = await esriRequest(url, options);
  const portalItems = response.data.results;
  return portalItems;
}

async function init() {
  const portalItems = await getPortalItems(
    "https://video-portal.idt.geocloud.com/portal"
  );

  console.log("Portal Items:", portalItems);

  portalItems.forEach((item: PortalItem) => {
    const option = document.createElement("calcite-option");
    option.value = item.id;
    option.label = item.title ?? "";
    videoLayerSelect.appendChild(option);
  });

  await updateVideoLayer(portalItems[0].id);

  state.webMap = new WebMap({
    portalItem: {
      id: "e61993e233b34bf4a12441b61129e15a",
    },
  });
  state.webMap.layers.add(state.videoLayer);

  viewElement.map = state.webMap;

  await viewElement.viewOnReady();
  console.log("the view is ready");

  if (state.videoLayer.loaded) {
    console.log("the layer is loaded");
    videoPlayerElement.layer = state.videoLayer;
  } else {
    await state.videoLayer.load();
    videoPlayerElement.layer = state.videoLayer;
  }
  await viewElement.whenLayerView(state.videoLayer);
  console.log("the layerview is created");
  viewElement.goTo(state.videoLayer.fullExtent);

  updateFrameEffect();
}

function updateFrameEffect() {
  state.videoLayer.frameEffect = `brightness(${frameEffectBrightnessSlider.value}%) contrast(${frameEffectContrastSlider.value}%) saturate(${frameEffectSaturateSlider.value}%)`;
  if (frameEffectInvertSwitch.checked) {
    state.videoLayer.frameEffect += " invert()";
  }
}

async function updateVideoLayer(id: string) {
  const layer = await Layer.fromPortalItem({
    portalItem: new PortalItem({
      id,
      portal: { url: "https://video-portal.idt.geocloud.com/portal" },
    }),
  });
  state.webMap.layers.remove(state.videoLayer);
  state.videoLayer = layer as VideoLayer;
  state.videoLayer.frameEffect = "brightness(25%) contrast(25%) saturate(25%)";
  state.webMap.layers.add(state.videoLayer);
  videoPlayerElement.layer = state.videoLayer;
  if (testingPropertiesSwitch.checked) {
    await addTestingProperties();
  }
}

async function addTestingProperties() {
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
  // @ts-ignore
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

async function removeTestingProperties() {
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
  // @ts-ignore
  state.videoLayer.sensorSymbolOrientation = {
    source: "platformHeading",
    symbolOffset: 0,
  };
  state.videoLayer.sensorTrailSymbol = new SimpleLineSymbol({
    color: new Color([255, 127, 0]),
    width: 1,
  });
  state.videoLayer.start = 0;
  state.videoLayer.telemetryDisplay = null;
  state.videoLayer.visible = true;
}
