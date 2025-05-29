import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/Symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/Symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/Symbols/SimpleMarkerSymbol";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import VideoLayer from "@arcgis/core/layers/VideoLayer";
import PortalItem from "@arcgis/core/portal/PortalItem";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-placement";
import "@arcgis/map-components/components/arcgis-video-player";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-slider";
import "@esri/calcite-components/components/calcite-switch";
import "./style.css";

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
const opacitySlider = document.querySelector(
  "#opacity-slider"
)! as HTMLCalciteSliderElement;
const saveButton = document.querySelector(
  "#save-button"
)! as HTMLCalciteButtonElement;
const saveAsButton = document.querySelector(
  "#save-as-button"
)! as HTMLCalciteButtonElement;
const viewElement = document.querySelector("arcgis-map")!;
const videoPlayerElement = document.querySelector("arcgis-video-player")!;

const videoLayer = new VideoLayer({
  autoplay: true,
  // blendMode: "vivid-light",
  // effect: "brightness(500%) hue-rotate(270deg) contrast(200%)",
  // frameEffect: "invert()",
  // frameOpacity: 0.1,
  frameCenterSymbol: new SimpleMarkerSymbol({
    angle: 0,
    color: new Color([0, 0, 255, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 1]),
      join: "round",
      miterLimit: 1,
      style: "solid",
      width: 2,
    }),
    size: 12,
    style: "triangle",
    xoffset: 0,
    yoffset: 0,
  }),
  frameOutlineSymbol: new SimpleFillSymbol({
    color: new Color([255, 0, 0, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 0.1]),
      join: "round",
      miterLimit: 1,
      style: "dot",
      width: 3,
    }),
    style: "vertical",
  }),
  muted: true,
  // opacity: 0.5,
  sensorSightLineSymbol: new SimpleLineSymbol({
    cap: "round",
    color: new Color([255, 255, 0, 1]),
    join: "round",
    miterLimit: 1,
    style: "dash-dot",
    width: 3,
  }),
  sensorSymbol: new SimpleMarkerSymbol({
    angle: 0,
    color: new Color([0, 0, 255, 1]),
    outline: new SimpleLineSymbol({
      cap: "round",
      color: new Color([0, 255, 0, 1]),
      join: "round",
      miterLimit: 1,
      style: "solid",
      width: 3,
    }),
    size: 12,
    style: "triangle",
    xoffset: 0,
    yoffset: 0,
  }),
  sensorTrailSymbol: new SimpleLineSymbol({
    cap: "round",
    color: new Color([255, 0, 0, 1]),
    join: "round",
    miterLimit: 1,
    style: "dash",
    width: 12,
  }),
  start: 6,
  // telemetryColor: new Color([255, 0, 0, 0.5]),
  telemetryDisplay: {
    frame: true,
    frameCenter: true,
    frameOutline: true,
    lineOfSight: true,
    sensorLocation: true,
    sensorTrail: true,
  },
  title: "The best video layer in the world",
  url: "https://dev000276.esri.com/video/rest/services/cheyenne1/VideoServer/0",
  visible: true,
});

const webMap = new WebMap({
  basemap: "topo-vector",
  layers: [videoLayer],
});

viewElement.map = webMap;

load();

opacitySlider.addEventListener("calciteSliderInput", () => {
  const value = opacitySlider.value;
  if (typeof value === "number") {
    videoLayer.opacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    videoLayer.opacity = value[0] / 100;
  } else {
    videoLayer.opacity = 1;
  }
});

frameOpacitySlider.addEventListener("calciteSliderInput", () => {
  const value = frameOpacitySlider.value;
  if (typeof value === "number") {
    videoLayer.frameOpacity = value / 100;
  } else if (Array.isArray(value) && typeof value[0] === "number") {
    videoLayer.frameOpacity = value[0] / 100;
  } else {
    videoLayer.frameOpacity = 1;
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

saveButton.addEventListener("click", async () => {
  console.log("save button clicked");
  const result = await webMap.save();
  console.log("Save result:", result.id);
});

saveAsButton.addEventListener("click", async () => {
  await webMap.loadAll();
  webMap.updateFrom(viewElement.view);
  console.log("save as button clicked");
  const result = await webMap.saveAs(
    new PortalItem({ title: "My Video Layer Web Map" })
  );
  console.log("Save As result:", result.id);
  webMap.portalItem = result;
  saveButton.disabled = false;
});

async function load() {
  await viewElement.viewOnReady();
  console.log("the view is ready");

  if (videoLayer.loaded) {
    console.log("the layer is loaded");
    videoPlayerElement.layer = videoLayer;
  } else {
    await videoLayer.load();
    videoPlayerElement.layer = videoLayer;
  }
  await viewElement.whenLayerView(videoLayer);
  console.log("the layerview is created");
  viewElement.goTo(videoLayer.fullExtent);

  updateFrameEffect();
}

function updateFrameEffect() {
  videoLayer.frameEffect = `brightness(${frameEffectBrightnessSlider.value}%) contrast(${frameEffectContrastSlider.value}%) saturate(${frameEffectSaturateSlider.value}%)`;
  if (frameEffectInvertSwitch.checked) {
    videoLayer.frameEffect += " invert()";
  }
}
